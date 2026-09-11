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
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>(getSavedBooks);
  const [selectedBook, setSelectedBook] = useState<GoogleBookItem | SavedBook | null>(null);

  useEffect(() => {
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
        <h1 className="font-sans font-bold text-2xl sm:text-3xl text-[#2D241E] tracking-tight">
          Buscar no Acervo
        </h1>
        <p className="text-[#7D6E65] text-xs sm:text-sm mt-1.5">
          Consulte milhões de títulos em Português indexados pela Google Books API.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={onSubmit} className="relative flex items-center shadow-sm rounded-xl bg-white border border-[#E6DCCF] focus-within:border-[#422F1D] focus-within:ring-1 focus-within:ring-[#422F1D] transition-all">
          <Search className="w-4 h-4 text-[#8C7D73] ml-3.5 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o título, autor ou assunto (ex: Machado de Assis, Ficção)..."
            className="w-full py-3 px-3 text-[#2D241E] placeholder:text-[#A89B91] bg-transparent text-xs sm:text-sm focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="mr-2 px-4 py-2 rounded-lg bg-[#422F1D] hover:bg-[#2C1F13] text-[#FAF6F0] font-medium text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Buscar'}
          </button>
        </form>

        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-[11px] text-[#7D6E65] font-medium mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#A05E35]" /> Sugestões:
          </span>
          {SUGGESTED_QUERIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setQuery(item);
                handleSearch(item);
              }}
              className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#F4ECE1] hover:bg-[#E6D7C3] text-[#5F442A] border border-[#E6DCCF] transition-colors cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-2.5">
            <Loader2 className="w-6 h-6 text-[#422F1D] animate-spin" />
            <p className="text-xs font-medium text-[#7D6E65]">Buscando na Google Books API com langRestrict=pt...</p>
          </div>
        ) : error ? (
          <div className="p-5 bg-rose-50/70 border border-rose-200 rounded-xl text-center max-w-lg mx-auto">
            <AlertCircle className="w-5 h-5 text-rose-600 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-rose-700">{error}</p>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-xl border border-[#E6DCCF] max-w-md mx-auto">
            <BookOpen className="w-8 h-8 text-[#D3BC9E] mx-auto mb-2" />
            <p className="font-sans font-semibold text-[#2D241E] text-sm">Nenhum livro encontrado</p>
            <p className="text-xs text-[#7D6E65] mt-0.5">Tente pesquisar com outros termos ou autores.</p>
          </div>
        ) : results.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-[#7D6E65]">
                {results.length} livros encontrados para "{query}"
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
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

