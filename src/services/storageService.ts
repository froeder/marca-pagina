import type { SavedBook, ReadingStatus, GoogleBookItem } from '../types/book';
import { sanitizeImageUrl } from '../utils/imageUtils';
import { doc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

export { getApiKey, setApiKey } from './googleBooksApi';

const STORAGE_KEY = 'marca_pagina_saved_books';
const GOAL_KEY = 'marca_pagina_reading_goal';

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
      if (!snapshot.empty) {
        const firestoreBooks: SavedBook[] = [];
        snapshot.forEach((docSnap) => {
          firestoreBooks.push(docSnap.data() as SavedBook);
        });
        firestoreBooks.sort((a, b) => new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreBooks));
        window.dispatchEvent(new Event('marca_pagina_books_updated'));
      } else {
        const localBooks = getSavedBooks();
        if (localBooks.length > 0) {
          localBooks.forEach((b) => {
            syncBookToFirestore(b, userId);
          });
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
    return Array.isArray(parsed) ? parsed : [];
  } catch {
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
  const thumbnail = sanitizeImageUrl(
    googleBook.volumeInfo.imageLinks?.thumbnail ||
    googleBook.volumeInfo.imageLinks?.smallThumbnail || ''
  );

  const bookData: SavedBook = {
    id: googleBook.id,
    title: googleBook.volumeInfo.title || 'Sem título',
    authors: googleBook.volumeInfo.authors || ['Autor desconhecido'],
    thumbnail,
    description: googleBook.volumeInfo.description || '',
    categories: googleBook.volumeInfo.categories || ['Fiction'],
    pageCount: googleBook.volumeInfo.pageCount,
    publishedDate: googleBook.volumeInfo.publishedDate,
    publisher: googleBook.volumeInfo.publisher,
    previewLink: googleBook.volumeInfo.previewLink,
    infoLink: googleBook.volumeInfo.infoLink,
    status,
    userRating: rating,
    userNotes: notes,
    dateAdded: existingIndex >= 0 ? books[existingIndex].dateAdded : new Date().toISOString(),
    dateFinished: status === 'lido' ? new Date().toISOString() : undefined,
    favorite: existingIndex >= 0 ? books[existingIndex].favorite : false,
  };

  if (existingIndex >= 0) {
    books[existingIndex] = { ...books[existingIndex], ...bookData };
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
    const books = Array.isArray(parsed) ? parsed : (parsed.books || []);
    if (!Array.isArray(books)) {
      return false;
    }
    saveBooks(books);
    books.forEach((b) => syncBookToFirestore(b));
    return true;
  } catch {
    return false;
  }
}

export function resetToDemoBooks(): void {
  saveBooks(INITIAL_DEMO_BOOKS);
  INITIAL_DEMO_BOOKS.forEach((b) => syncBookToFirestore(b));
}
