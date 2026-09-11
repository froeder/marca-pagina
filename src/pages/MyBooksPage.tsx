import React, { useState, useEffect, useMemo } from 'react';
import type { SavedBook, ReadingStatus, GoogleBookItem } from '../types/book';
import { getSavedBooks, updateBookStatus, removeBook, toggleFavorite, updateBookReview } from '../services/storageService';
import { BookCard } from '../components/BookCard';
import { BookDetailModal } from '../components/BookDetailModal';
import { BookOpen, Search, CheckCircle, Clock, Bookmark, Heart, Sparkles, Filter } from 'lucide-react';

type FilterTab = 'todos' | 'lido' | 'lendo' | 'quero_ler' | 'favoritos';
export const MyBooksPage: React.FC<{ onNavigateToSearch: () => void; onNavigateToDiscover: () => void }> = ({
  onNavigateToSearch,
  onNavigateToDiscover,
}) => {
  const [books, setBooks] = useState<SavedBook[]>(getSavedBooks);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<GoogleBookItem | SavedBook | null>(null);

  const loadBooks = () => setBooks(getSavedBooks());

  useEffect(() => {
    window.addEventListener('marca_pagina_books_updated', loadBooks);
    return () => window.removeEventListener('marca_pagina_books_updated', loadBooks);
  }, []);

  const handleStatusChange = (book: GoogleBookItem | SavedBook, status: ReadingStatus) => {
    updateBookStatus(book.id, status);
    loadBooks();
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    loadBooks();
  };

  const handleRemove = (id: string) => {
    removeBook(id);
    loadBooks();
  };

  const handleSaveReview = (id: string, rating?: number, notes?: string) => {
    updateBookReview(id, rating, notes);
    loadBooks();
  };

  const counts = useMemo(() => {
    return {
      todos: books.length,
      lido: books.filter((b) => b.status === 'lido').length,
      lendo: books.filter((b) => b.status === 'lendo').length,
      quero_ler: books.filter((b) => b.status === 'quero_ler').length,
      favoritos: books.filter((b) => b.favorite).length,
    };
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      if (activeFilter === 'lido' && book.status !== 'lido') return false;
      if (activeFilter === 'lendo' && book.status !== 'lendo') return false;
      if (activeFilter === 'quero_ler' && book.status !== 'quero_ler') return false;
      if (activeFilter === 'favoritos' && !book.favorite) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = book.title.toLowerCase().includes(q);
        const matchAuthor = book.authors.some((a) => a.toLowerCase().includes(q));
        const matchCat = book.categories.some((c) => c.toLowerCase().includes(q));
        return matchTitle || matchAuthor || matchCat;
      }
      return true;
    });
  }, [books, activeFilter, searchTerm]);

  const tabs: Array<{ id: FilterTab; label: string; count: number; icon: React.ReactNode }> = [
    { id: 'todos', label: 'Todos', count: counts.todos, icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'lido', label: 'Lidos', count: counts.lido, icon: <CheckCircle className="w-3.5 h-3.5 text-[#422F1D]" /> },
    { id: 'lendo', label: 'Lendo', count: counts.lendo, icon: <Clock className="w-3.5 h-3.5 text-[#C87A3D]" /> },
    { id: 'quero_ler', label: 'Quero Ler', count: counts.quero_ler, icon: <Bookmark className="w-3.5 h-3.5 text-[#7F5E3B]" /> },
    { id: 'favoritos', label: 'Favoritos', count: counts.favoritos, icon: <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-bold text-2xl sm:text-3xl text-[#2D241E] tracking-tight">Minha Estante</h1>
          <p className="text-xs sm:text-sm text-[#7D6E65] mt-1">
            Gerencie suas leituras e acompanhe as obras que treinam o motor de descoberta
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToDiscover}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4ECE1] hover:bg-[#E6D7C3] text-[#5F442A] text-xs font-medium transition-colors cursor-pointer border border-[#E6DCCF]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7F5E3B]" />
            <span>Descoberta</span>
          </button>
          <button
            onClick={onNavigateToSearch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#422F1D] hover:bg-[#2C1F13] text-[#FAF6F0] text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#D3BC9E]" />
            <span>Adicionar Livros</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-xl border border-[#E6DCCF] shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveFilter(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === t.id
                  ? 'bg-[#422F1D] text-[#FAF6F0] shadow-xs'
                  : 'text-[#6A5A50] hover:bg-[#F8F5EE] hover:text-[#2D241E]'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${activeFilter === t.id ? 'bg-[#5F442A] text-[#FAF6F0]' : 'bg-[#F4ECE1] text-[#5F442A]'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[#8C7D73] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por título ou autor..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E6DCCF] focus:outline-none focus:ring-1 focus:ring-[#422F1D] focus:border-[#422F1D] bg-[#FAF7F2]/50 text-[#2D241E]"
          />
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-xl border border-[#E6DCCF]">
          <Filter className="w-8 h-8 text-[#D3BC9E] mx-auto mb-2.5" />
          <p className="font-sans font-semibold text-[#2D241E] text-sm">Nenhum livro nesta categoria</p>
          <p className="text-xs text-[#7D6E65] mt-0.5">Busque novos títulos para adicionar à sua estante.</p>
          <button
            onClick={onNavigateToSearch}
            className="mt-3.5 px-3.5 py-1.5 rounded-lg bg-[#422F1D] text-[#FAF6F0] text-xs font-medium hover:bg-[#2C1F13] cursor-pointer transition-colors"
          >
            Buscar Livros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isSaved={true}
              savedData={book}
              onStatusChange={handleStatusChange}
              onToggleFavorite={handleToggleFavorite}
              onRemove={handleRemove}
              onOpenDetails={(b) => setSelectedBook(b)}
            />
          ))}
        </div>
      )}

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          savedData={books.find((b) => b.id === selectedBook.id)}
          onClose={() => setSelectedBook(null)}
          onStatusChange={handleStatusChange}
          onSaveReview={handleSaveReview}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};

