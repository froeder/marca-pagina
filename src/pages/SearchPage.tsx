import React, { useState, useEffect } from 'react';
import type { GoogleBookItem, SavedBook, ReadingStatus } from '../types/book';
import { searchBooks } from '../services/googleBooksApi';
import { getSavedBooks, addOrUpdateFromGoogleBook, updateBookStatus, toggleFavorite, updateBookReview } from '../services/storageService';
import { BookCard } from '../components/BookCard';
import { BookDetailModal } from '../components/BookDetailModal';
import { Search, Loader2, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

const SUGGESTED_QUERIES = [
  'Literatura Brasileira',
  'Machado de Assis',
  'Clarice Lispector',
  'Ficção Científica',
  'Desenvolvimento Pessoal',
  'Filosofia Clássica',
  'História do Brasil',
  'Psicologia & Mente',
];
export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GoogleBookItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<GoogleBookItem | SavedBook | null>(null);

  useEffect(() => {
    setSavedBooks(getSavedBooks());
    const handleUpdate = () => setSavedBooks(getSavedBooks());
    window.addEventListener('marca_pagina_books_updated', handleUpdate);
    return () => window.removeEventListener('marca_pagina_books_updated', handleUpdate);
  }, []);

  const handleSearch = async (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await searchBooks(term, 24);
      setResults(response.items);
    } catch {
      setError('Erro ao consultar a Google Books API. Verifique sua conexão ou chave de API.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleStatusChange = (book: GoogleBookItem | SavedBook, status: ReadingStatus) => {
    if ('volumeInfo' in book) {
      addOrUpdateFromGoogleBook(book, status);
    } else {
      updateBookStatus(book.id, status);
    }
    setSavedBooks(getSavedBooks());
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    setSavedBooks(getSavedBooks());
  };

  const handleSaveReview = (id: string, rating?: number, notes?: string) => {
    updateBookReview(id, rating, notes);
    setSavedBooks(getSavedBooks());
  };

  const getSavedData = (id: string) => savedBooks.find((b) => b.id === id);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="text-center max-w-2xl mx-auto pt-2">
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-900">
          Buscar no Acervo
        </h1>
        <p className="text-stone-600 text-sm sm:text-base mt-2">
          Consulte milhões de títulos em Português indexados pela Google Books API.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={onSubmit} className="relative flex items-center shadow-lg rounded-2xl bg-white border border-amber-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200 transition-all">
          <Search className="w-5 h-5 text-stone-400 ml-4 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o título, autor ou assunto (ex: Dom Casmurro, Ficção Científica)..."
            className="w-full py-4 px-3.5 text-stone-900 placeholder:text-stone-400 bg-transparent text-sm sm:text-base focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="mr-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-xs text-stone-500 font-medium mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" /> Sugestões rápidas:
          </span>
          {SUGGESTED_QUERIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setQuery(item);
                handleSearch(item);
              }}
              className="text-xs px-2.5 py-1 rounded-full bg-white border border-amber-200/80 hover:border-brand-300 hover:bg-brand-50 text-stone-700 transition-colors shadow-2xs"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-sm font-medium text-stone-500">Buscando na Google Books API com langRestrict=pt...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center max-w-lg mx-auto">
            <AlertCircle className="w-6 h-6 text-rose-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-rose-700">{error}</p>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 max-w-md mx-auto">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="font-serif font-semibold text-stone-800 text-lg">Nenhum livro encontrado</p>
            <p className="text-xs text-stone-500 mt-1">Tente pesquisar com outros termos ou autores.</p>
          </div>
        ) : results.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {results.length} livros encontrados para "{query}"
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {results.map((book) => {
                const savedData = getSavedData(book.id);
                return (
                  <BookCard
                    key={book.id}
                    book={book}
                    isSaved={!!savedData}
                    savedData={savedData}
                    onStatusChange={handleStatusChange}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenDetails={(b) => setSelectedBook(b)}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          savedData={getSavedData(selectedBook.id)}
          onClose={() => setSelectedBook(null)}
          onStatusChange={handleStatusChange}
          onSaveReview={handleSaveReview}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};

