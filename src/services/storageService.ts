import type { SavedBook, ReadingStatus, GoogleBookItem } from '../types/book';
import { sanitizeImageUrl } from '../utils/imageUtils';
export { getApiKey, setApiKey } from './googleBooksApi';

const STORAGE_KEY = 'marca_pagina_saved_books';
const GOAL_KEY = 'marca_pagina_reading_goal';

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
  return books[index];
}

export function updateBookReview(id: string, userRating?: number, userNotes?: string): SavedBook | null {
  const books = getSavedBooks();
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return null;
  if (userRating !== undefined) books[index].userRating = userRating;
  if (userNotes !== undefined) books[index].userNotes = userNotes;
  saveBooks(books);
  return books[index];
}

export function toggleFavorite(id: string): SavedBook | null {
  const books = getSavedBooks();
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return null;
  books[index].favorite = !books[index].favorite;
  saveBooks(books);
  return books[index];
}

export function removeBook(id: string): void {
  saveBooks(getSavedBooks().filter((b) => b.id !== id));
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
    return true;
  } catch {
    return false;
  }
}

export function resetToDemoBooks(): void {
  saveBooks(INITIAL_DEMO_BOOKS);
}
