import type { SavedBook, ReadingStatus, GoogleBookItem, ReadingGoal } from '../types/book';
import { sanitizeImageUrl } from '../utils/imageUtils';
import { doc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

export { getApiKey, setApiKey } from './googleBooksApi';

const STORAGE_KEY = 'marca_pagina_saved_books';
const GOAL_KEY = 'marca_pagina_reading_goal';
const GOALS_KEY = 'marca_pagina_reading_goals';
const LISTS_KEY = 'marca_pagina_reading_lists';

function cleanObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as Partial<T>;
}

export async function syncBookToFirestore(book: SavedBook, userId?: string): Promise<void> {
  const uid = userId || auth?.currentUser?.uid;
  if (!db || !uid) return;
  try {
    const bookRef = doc(db, 'users', uid, 'books', book.id);
    await setDoc(bookRef, cleanObject(book as unknown as Record<string, unknown>), { merge: true });
  } catch (err) {
    const errorObj = err as { code?: string; message?: string };
    if (errorObj?.code === 'permission-denied') {
      console.warn(
        'Firestore: Permissão negada ao salvar livro. Atualize as regras de segurança (firestore.rules) no Firebase Console.'
      );
    } else {
      console.error('Erro ao sincronizar livro com Firestore:', err);
    }
  }
}

export async function removeBookFromFirestore(bookId: string, userId?: string): Promise<void> {
  const uid = userId || auth?.currentUser?.uid;
  if (!db || !uid) return;
  try {
    const bookRef = doc(db, 'users', uid, 'books', bookId);
    await deleteDoc(bookRef);
  } catch (err) {
    const errorObj = err as { code?: string; message?: string };
    if (errorObj?.code === 'permission-denied') {
      console.warn(
        'Firestore: Permissão negada ao remover livro. Atualize as regras de segurança (firestore.rules) no Firebase Console.'
      );
    } else {
      console.error('Erro ao remover livro do Firestore:', err);
    }
  }
}

export async function syncGoalToFirestore(goal: number, userId?: string): Promise<void> {
  const uid = userId || auth?.currentUser?.uid;
  if (!db || !uid) return;
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { readingGoal: goal }, { merge: true });
  } catch (err) {
    const errorObj = err as { code?: string; message?: string };
    if (errorObj?.code === 'permission-denied') {
      console.warn(
        'Firestore: Permissão negada ao salvar meta. Atualize as regras de segurança (firestore.rules) no Firebase Console.'
      );
    } else {
      console.error('Erro ao salvar meta no Firestore:', err);
    }
  }
}

export async function syncGoalsToFirestore(goals: ReadingGoal[], userId?: string): Promise<void> {
  const uid = userId || auth?.currentUser?.uid;
  if (!db || !uid) return;
  try {
    const goalsCollectionRef = collection(db, 'users', uid, 'goals');
    const current = await import('firebase/firestore').then((m) =>
      m.getDocs(goalsCollectionRef)
    );
    current.forEach(async (docSnap) => {
      if (!goals.some((g) => g.id === docSnap.id)) {
        await deleteDoc(docSnap.ref);
      }
    });
    for (const g of goals) {
      const ref = doc(goalsCollectionRef, g.id);
      await setDoc(ref, { ...g, id: g.id }, { merge: true });
    }
  } catch (err) {
    const errorObj = err as { code?: string; message?: string };
    if (errorObj?.code === 'permission-denied') {
      console.warn(
        'Firestore: Permissão negada ao salvar metas. Atualize as regras de segurança (firestore.rules) no Firebase Console.'
      );
    } else {
      console.error('Erro ao salvar metas no Firestore:', err);
    }
  }
}

export async function syncListsToFirestore(lists: string[], userId?: string): Promise<void> {
  const uid = userId || auth?.currentUser?.uid;
  if (!db || !uid) return;
  try {
    const listsCollectionRef = collection(db, 'users', uid, 'readingLists');
    const current = await import('firebase/firestore').then((m) =>
      m.getDocs(listsCollectionRef)
    );
    current.forEach(async (docSnap) => {
      if (!lists.includes(docSnap.id)) {
        await deleteDoc(docSnap.ref);
      }
    });
    for (const name of lists) {
      const ref = doc(listsCollectionRef, name);
      await setDoc(ref, { name }, { merge: true });
    }
  } catch (err) {
    const errorObj = err as { code?: string; message?: string };
    if (errorObj?.code === 'permission-denied') {
      console.warn(
        'Firestore: Permissão negada ao salvar listas. Atualize as regras de segurança (firestore.rules) no Firebase Console.'
      );
    } else {
      console.error('Erro ao salvar listas no Firestore:', err);
    }
  }
}

let unsubscribeFirestore: (() => void) | null = null;

export function initFirestoreSync(userId: string): () => void {
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
    unsubscribeFirestore = null;
  }

  if (!db || !userId) return () => {};

  const booksCollectionRef = collection(db, 'users', userId, 'books');

  unsubscribeFirestore = onSnapshot(
    booksCollectionRef,
    (snapshot) => {
      const firestoreBooks: SavedBook[] = [];
      snapshot.forEach((docSnap) => {
        firestoreBooks.push(docSnap.data() as SavedBook);
      });
      firestoreBooks.sort((a, b) => new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime());

      if (firestoreBooks.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreBooks));
        window.dispatchEvent(new Event('marca_pagina_books_updated'));
      } else {
        const rawLocal = localStorage.getItem(STORAGE_KEY);
        const hasMigrated = localStorage.getItem('marca_pagina_migrated_to_firestore');
        if (!hasMigrated && rawLocal && rawLocal !== '[]') {
          localStorage.setItem('marca_pagina_migrated_to_firestore', 'true');
          const localBooks = getSavedBooks();
          localBooks.forEach((b) => {
            syncBookToFirestore(b, userId);
          });
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
          window.dispatchEvent(new Event('marca_pagina_books_updated'));
        }
      }
    },
    (error) => {
      if (error.code === 'permission-denied') {
        console.warn(
          'Firestore: Permissões insuficientes para sincronização em tempo real. Configure as regras de segurança do Firestore no Firebase Console (veja o arquivo firestore.rules gerado no projeto).'
        );
      } else {
        console.error('Erro na sincronização em tempo real do Firestore:', error);
      }
    }
  );

  return () => {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }
  };
}

export function stopFirestoreSync(): void {
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
    unsubscribeFirestore = null;
  }
}

const INITIAL_DEMO_BOOKS: SavedBook[] = [
  {
    id: 's1gVAAAAYAAJ',
    title: 'Dom Casmurro',
    authors: ['Machado de Assis'],
    thumbnail: 'https://books.google.com/books/content?id=s1gVAAAAYAAJ&printsec=frontcover&img=1&zoom=1',
    description: 'Um dos maiores clássicos da literatura brasileira.',
    categories: ['Fiction', 'Classics'],
    status: 'lido',
    userRating: 5,
    userNotes: 'Obra-prima atemporal.',
    dateAdded: '2026-01-10T10:00:00.000Z',
    dateFinished: '2026-01-20T18:30:00.000Z',
    favorite: true,
  },
  {
    id: 'kLAwDwAAQBAJ',
    title: 'Torto Arado',
    authors: ['Itamar Vieira Junior'],
    thumbnail: 'https://books.google.com/books/content?id=kLAwDwAAQBAJ&printsec=frontcover&img=1&zoom=1',
    description: 'Saga marcante no sertão baiano.',
    categories: ['Fiction', 'Literary'],
    status: 'lido',
    userRating: 5,
    dateAdded: '2026-02-05T14:00:00.000Z',
    dateFinished: '2026-02-18T21:00:00.000Z',
    favorite: true,
  }
];

export function getSavedBooks(): SavedBook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_BOOKS));
      return INITIAL_DEMO_BOOKS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('Dados em localStorage (marca_pagina_saved_books) não são um array de livros.');
      return [];
    }
    return parsed.map((b) => ({
      ...b,
      title: b.title || 'Sem título',
      authors: Array.isArray(b.authors) && b.authors.length > 0 ? b.authors : ['Autor desconhecido'],
      categories: Array.isArray(b.categories) && b.categories.length > 0 ? b.categories : ['Fiction'],
      lists: Array.isArray(b.lists) ? b.lists : [],
    }));
  } catch (err) {
    console.error('Erro ao ler livros salvos do localStorage:', err);
    return [];
  }
}

export function saveBooks(books: SavedBook[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  window.dispatchEvent(new Event('marca_pagina_books_updated'));
}

export function addOrUpdateFromGoogleBook(
  googleBook: GoogleBookItem,
  status: ReadingStatus = 'quero_ler',
  rating?: number,
  notes?: string
): SavedBook {
  const books = getSavedBooks();
  const existingIndex = books.findIndex((b) => b.id === googleBook.id);
  const existing = existingIndex >= 0 ? books[existingIndex] : null;
  const thumbnail = sanitizeImageUrl(
    googleBook.volumeInfo.imageLinks?.thumbnail ||
    googleBook.volumeInfo.imageLinks?.smallThumbnail || ''
  );

  const bookData: SavedBook = {
    id: googleBook.id,
    title: googleBook.volumeInfo.title || existing?.title || 'Sem título',
    authors: (googleBook.volumeInfo.authors && googleBook.volumeInfo.authors.length > 0)
      ? googleBook.volumeInfo.authors
      : (existing?.authors || ['Autor desconhecido']),
    thumbnail: thumbnail || existing?.thumbnail || '',
    description: googleBook.volumeInfo.description || existing?.description || '',
    categories: (googleBook.volumeInfo.categories && googleBook.volumeInfo.categories.length > 0)
      ? googleBook.volumeInfo.categories
      : (existing?.categories || ['Fiction']),
    pageCount: googleBook.volumeInfo.pageCount ?? existing?.pageCount,
    publishedDate: googleBook.volumeInfo.publishedDate || existing?.publishedDate,
    publisher: googleBook.volumeInfo.publisher || existing?.publisher,
    previewLink: googleBook.volumeInfo.previewLink || existing?.previewLink,
    infoLink: googleBook.volumeInfo.infoLink || existing?.infoLink,
    status,
    userRating: rating !== undefined ? rating : existing?.userRating,
    userNotes: notes !== undefined ? notes : existing?.userNotes,
    dateAdded: existing?.dateAdded || new Date().toISOString(),
    dateFinished: status === 'lido'
      ? (existing?.dateFinished || new Date().toISOString())
      : existing?.dateFinished,
    favorite: existing ? Boolean(existing.favorite) : false,
    lists: existing?.lists || [],
  };

  if (existingIndex >= 0) {
    books[existingIndex] = bookData;
  } else {
    books.unshift(bookData);
  }
  saveBooks(books);
  syncBookToFirestore(bookData);
  return bookData;
}

export function updateBookStatus(id: string, status: ReadingStatus): SavedBook | null {
  const books = getSavedBooks();
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return null;
  books[index].status = status;
  if (status === 'lido' && !books[index].dateFinished) {
    books[index].dateFinished = new Date().toISOString();
  }
  saveBooks(books);
  syncBookToFirestore(books[index]);
  return books[index];
}

export function updateBookReview(id: string, userRating?: number, userNotes?: string): SavedBook | null {
  const books = getSavedBooks();
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return null;
  if (userRating !== undefined) books[index].userRating = userRating;
  if (userNotes !== undefined) books[index].userNotes = userNotes;
  saveBooks(books);
  syncBookToFirestore(books[index]);
  return books[index];
}

export function toggleFavorite(id: string): SavedBook | null {
  const books = getSavedBooks();
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return null;
  books[index].favorite = !books[index].favorite;
  saveBooks(books);
  syncBookToFirestore(books[index]);
  return books[index];
}

export function removeBook(id: string): void {
  saveBooks(getSavedBooks().filter((b) => b.id !== id));
  removeBookFromFirestore(id);
}

export function getReadBooks(): SavedBook[] {
  return getSavedBooks().filter((b) => b.status === 'lido');
}

export function getReadingGoal(): number {
  const val = localStorage.getItem(GOAL_KEY);
  return val ? parseInt(val, 10) : 12;
}

export function setReadingGoal(goal: number): void {
  localStorage.setItem(GOAL_KEY, String(goal));
  syncGoalToFirestore(goal);
}

export function exportLibraryJson(): string {
  return JSON.stringify({ app: 'marca-pagina', version: '1.0.0', books: getSavedBooks() }, null, 2);
}

export function importLibraryJson(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    const rawBooks = Array.isArray(parsed) ? parsed : (parsed.books || []);
    if (!Array.isArray(rawBooks)) {
      return false;
    }
    const sanitizedBooks: SavedBook[] = rawBooks
      .filter((b): b is Record<string, unknown> => typeof b === 'object' && b !== null && typeof b.id === 'string' && b.id.trim() !== '')
      .map((b) => ({
        id: String(b.id),
        title: typeof b.title === 'string' && b.title.trim() ? b.title : 'Sem título',
        authors: Array.isArray(b.authors) && b.authors.length > 0
          ? b.authors.map((a) => String(a || '')).filter(Boolean)
          : ['Autor desconhecido'],
        thumbnail: typeof b.thumbnail === 'string' ? sanitizeImageUrl(b.thumbnail) : '',
        description: typeof b.description === 'string' ? b.description : '',
        categories: Array.isArray(b.categories) && b.categories.length > 0
          ? b.categories.map((c) => String(c || '')).filter(Boolean)
          : ['Fiction'],
        pageCount: typeof b.pageCount === 'number' && !isNaN(b.pageCount) ? b.pageCount : undefined,
        publishedDate: typeof b.publishedDate === 'string' ? b.publishedDate : undefined,
        publisher: typeof b.publisher === 'string' ? b.publisher : undefined,
        previewLink: typeof b.previewLink === 'string' ? b.previewLink : undefined,
        infoLink: typeof b.infoLink === 'string' ? b.infoLink : undefined,
        status: (['quero_ler', 'lendo', 'lido'].includes(b.status as string) ? b.status : 'quero_ler') as ReadingStatus,
        userRating: typeof b.userRating === 'number' ? b.userRating : undefined,
        userNotes: typeof b.userNotes === 'string' ? b.userNotes : undefined,
        dateAdded: typeof b.dateAdded === 'string' ? b.dateAdded : new Date().toISOString(),
        dateFinished: typeof b.dateFinished === 'string' ? b.dateFinished : undefined,
        favorite: Boolean(b.favorite),
        lists: Array.isArray(b.lists) ? b.lists.map(String).filter(Boolean) : [],
      }));

    if (sanitizedBooks.length === 0 && rawBooks.length > 0) {
      return false;
    }

    saveBooks(sanitizedBooks);
    sanitizedBooks.forEach((b) => syncBookToFirestore(b));
    return true;
  } catch (err) {
    console.error('Erro ao importar JSON da biblioteca:', err);
    return false;
  }
}

export function resetToDemoBooks(): void {
  saveBooks(INITIAL_DEMO_BOOKS);
  INITIAL_DEMO_BOOKS.forEach((b) => syncBookToFirestore(b));
}

/* ------------------------------------------------------------------ */
/* Listas personalizadas da estante                                    */
/* ------------------------------------------------------------------ */

export function getReadingLists(): string[] {
  try {
    const raw = localStorage.getItem(LISTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

export function saveReadingLists(lists: string[]): void {
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  window.dispatchEvent(new Event('marca_pagina_lists_updated'));
  syncListsToFirestore(lists);
}

export function createReadingList(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const lists = getReadingLists();
  if (lists.includes(trimmed)) return false;
  lists.push(trimmed);
  saveReadingLists(lists);
  return true;
}

export function renameReadingList(oldName: string, newName: string): boolean {
  const trimmed = newName.trim();
  if (!trimmed || trimmed === oldName) return false;
  const lists = getReadingLists();
  if (lists.includes(trimmed)) return false;
  const updated = lists.map((n) => (n === oldName ? trimmed : n));
  // Atualiza a referência nos livros associados
  const books = getSavedBooks();
  let changed = false;
  for (const b of books) {
    if (b.lists?.includes(oldName)) {
      b.lists = b.lists.map((n) => (n === oldName ? trimmed : n));
      changed = true;
    }
  }
  if (changed) {
    saveBooks(books);
    books.forEach((b) => syncBookToFirestore(b));
  }
  if (JSON.stringify(updated) !== JSON.stringify(lists)) {
    saveReadingLists(updated);
  }
  return true;
}

export function deleteReadingList(name: string): void {
  saveReadingLists(getReadingLists().filter((n) => n !== name));
  const books = getSavedBooks();
  let removed = false;
  for (const b of books) {
    if (b.lists?.includes(name)) {
      b.lists = b.lists.filter((n) => n !== name);
      removed = true;
    }
  }
  if (removed) {
    saveBooks(books);
    books.forEach((b) => syncBookToFirestore(b));
  }
}

export function getBookLists(id: string): string[] {
  const book = getSavedBooks().find((b) => b.id === id);
  return book?.lists || [];
}

export function toggleBookList(id: string, listName: string): SavedBook | null {
  const books = getSavedBooks();
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return null;
  const lists = books[index].lists || [];
  const next = lists.includes(listName)
    ? lists.filter((n) => n !== listName)
    : [...lists, listName];
  books[index].lists = next;
  saveBooks(books);
  syncBookToFirestore(books[index]);
  return books[index];
}

/* ------------------------------------------------------------------ */
/* Metas personalizadas de leitura                                     */
/* ------------------------------------------------------------------ */

function getDefaultGoals(): ReadingGoal[] {
  return [];
}

export function getReadingGoals(): ReadingGoal[] {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (!raw) return getDefaultGoals();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ReadingGoal[]) : getDefaultGoals();
  } catch {
    return getDefaultGoals();
  }
}

function saveReadingGoals(goals: ReadingGoal[]): void {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  window.dispatchEvent(new Event('marca_pagina_goals_updated'));
  syncGoalsToFirestore(goals);
}

export function createReadingGoal(label: string, target: number, unit: ReadingGoal['unit']): ReadingGoal | null {
  const trimmedLabel = label.trim();
  if (!trimmedLabel || target <= 0) return null;
  const goals = getReadingGoals();
  const goal: ReadingGoal = {
    id: `goal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    label: trimmedLabel,
    target,
    unit,
  };
  goals.push(goal);
  saveReadingGoals(goals);
  return goal;
}

export function updateReadingGoal(id: string, label: string, target: number, unit: ReadingGoal['unit']): ReadingGoal | null {
  const goals = getReadingGoals();
  const index = goals.findIndex((g) => g.id === id);
  if (index === -1 || target <= 0) return null;
  const trimmedLabel = label.trim();
  goals[index] = { ...goals[index], label: trimmedLabel || goals[index].label, target, unit };
  saveReadingGoals(goals);
  return goals[index];
}

export function deleteReadingGoal(id: string): void {
  saveReadingGoals(getReadingGoals().filter((g) => g.id !== id));
}

/* Readers for goals progress */
export function countReadBooks(): number {
  return getReadBooks().length;
}

export function countPagesRead(): number {
  return getReadBooks().reduce((acc, b) => acc + (b.pageCount || 0), 0);
}
