import React, { useState, useEffect, useCallback } from 'react';
import type { GoogleBookItem, SavedBook, ReadingStatus, CategoryStat } from '../types/book';
import { analyzeReadingPatterns, discoverBooksByPattern } from '../services/recommendationService';
import { getSavedBooks, addOrUpdateFromGoogleBook, updateBookStatus, toggleFavorite, updateBookReview, removeBook } from '../services/storageService';
import { PatternsInsightCard } from '../components/PatternsInsightCard';
import { BookCard } from '../components/BookCard';
import { BookDetailModal } from '../components/BookDetailModal';
import { Sparkles, Compass, Library, Loader2, ArrowRight } from 'lucide-react';

interface DiscoverPageProps {
  onNavigateToSearch: () => void;
  onNavigateToMyBooks: () => void;
}
export const DiscoverPage: React.FC<DiscoverPageProps> = ({ onNavigateToSearch, onNavigateToMyBooks }) => {
  const initialPatterns = analyzeReadingPatterns();
  const [loading, setLoading] = useState(true);
  const [totalRead, setTotalRead] = useState(initialPatterns.totalRead);
  const [topCategories, setTopCategories] = useState<CategoryStat[]>(initialPatterns.categories);
  const [activeCategory, setActiveCategory] = useState<string | null>(initialPatterns.rawPrimaryCategory);
  const [recommendedBooks, setRecommendedBooks] = useState<GoogleBookItem[]>([]);
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>(getSavedBooks);
  const [selectedBook, setSelectedBook] = useState<GoogleBookItem | SavedBook | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadRecommendations = useCallback((categoryOverride?: string) => {
    if (categoryOverride !== undefined) {
      setActiveCategory(categoryOverride);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    discoverBooksByPattern(activeCategory || undefined)
      .then((result) => {
        setRecommendedBooks(result.recommendedBooks);
      })
      .catch(() => {
        setErrorMsg('Não foi possível carregar sugestões da Google Books API neste momento.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeCategory]);

  useEffect(() => {
    let isSubscribed = true;
    discoverBooksByPattern(activeCategory || undefined)
      .then((result) => {
        if (isSubscribed) {
          setRecommendedBooks(result.recommendedBooks);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isSubscribed) {
          setErrorMsg('Não foi possível carregar sugestões da Google Books API neste momento.');
          setLoading(false);
        }
      });

    const handleStorageUpdate = () => {
      setSavedBooks(getSavedBooks());
      const p = analyzeReadingPatterns();
      setTotalRead(p.totalRead);
      setTopCategories(p.categories);
    };

    window.addEventListener('marca_pagina_books_updated', handleStorageUpdate);
    return () => {
      isSubscribed = false;
      window.removeEventListener('marca_pagina_books_updated', handleStorageUpdate);
    };
  }, [activeCategory]);

  const handleStatusChange = (book: GoogleBookItem | SavedBook, status: ReadingStatus) => {
    if ('volumeInfo' in book) {
      addOrUpdateFromGoogleBook(book, status);
    } else {
      updateBookStatus(book.id, status);
    }
    setSavedBooks(getSavedBooks());
    if (status === 'lido') {
      setTimeout(() => loadRecommendations(), 300);
    }
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    setSavedBooks(getSavedBooks());
  };

  const handleRemove = (id: string) => {
    removeBook(id);
    setSavedBooks(getSavedBooks());
    if (selectedBook && selectedBook.id === id) {
      setSelectedBook(null);
    }
    const current = analyzeReadingPatterns();
    setTotalRead(current.totalRead);
    setTopCategories(current.categories);
  };

  const handleSaveReview = (id: string, rating?: number, notes?: string) => {
    updateBookReview(id, rating, notes);
    setSavedBooks(getSavedBooks());
  };

  const getSavedData = (id: string) => savedBooks.find((b) => b.id === id);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-[#382A24] text-[#FAF6F0] p-6 sm:p-8 shadow-sm border border-[#2C1F13]">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#4D3B33] text-[#D3BC9E] text-xs font-medium uppercase tracking-wider mb-3 border border-[#5F483E]">
            <Sparkles className="w-3.5 h-3.5 text-[#D3BC9E]" />
            <span>Motor de Recomendação Inteligente</span>
          </div>
          <h1 className="font-sans font-bold text-2xl sm:text-3xl lg:text-4xl text-[#FAF6F0] tracking-tight">
            Descoberta por Padrões
          </h1>
          <p className="mt-2.5 text-[#D3BC9E] text-xs sm:text-sm leading-relaxed">
            Seu histórico de leitura define sua próxima grande descoberta. Analisamos os assuntos mais frequentes dos livros que você já leu e buscamos sugestões precisas na Google Books API.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={onNavigateToSearch}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#FAF6F0] hover:bg-white text-[#2D241E] text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Buscar Livros</span>
            </button>
            <button
              onClick={onNavigateToMyBooks}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#4D3B33] hover:bg-[#5F483E] text-[#FAF6F0] text-xs font-medium transition-all border border-[#5F483E] cursor-pointer"
            >
              <Library className="w-3.5 h-3.5" />
              <span>Minha Estante ({savedBooks.length})</span>
            </button>
          </div>
        </div>
      </div>

      <PatternsInsightCard
        totalRead={totalRead}
        topCategories={topCategories}
        activeCategory={activeCategory}
        onSelectCategory={(catName) => loadRecommendations(catName)}
        onRefreshRecommendations={() => loadRecommendations()}
        isLoading={loading}
      />

      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-sans font-bold text-lg sm:text-xl text-[#2D241E] flex items-center gap-2">
              <span>Sugestões Personalizadas</span>
              <span className="text-[11px] font-mono font-medium bg-[#F4ECE1] text-[#5F442A] px-2 py-0.5 rounded-md border border-[#E6DCCF]">
                {recommendedBooks.length} obras
              </span>
            </h2>
            <p className="text-xs text-[#7D6E65] mt-0.5">
              Obras recomendadas a partir do seu perfil de leitura
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-2.5">
            <Loader2 className="w-6 h-6 text-[#422F1D] animate-spin" />
            <p className="text-xs font-medium text-[#7D6E65]">
              Consultando a Google Books API com base nos seus padrões...
            </p>
          </div>
        ) : errorMsg ? (
          <div className="p-5 bg-rose-50/70 border border-rose-200 rounded-xl text-center">
            <p className="text-xs font-medium text-rose-700">{errorMsg}</p>
            <button
              onClick={() => loadRecommendations()}
              className="mt-3 text-xs font-medium px-3.5 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : recommendedBooks.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border border-[#E6DCCF] text-center space-y-2.5">
            <p className="text-sm font-medium text-[#2D241E]">
              Nenhuma recomendação encontrada para o padrão atual.
            </p>
            <button
              onClick={onNavigateToSearch}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#422F1D] hover:underline cursor-pointer"
            >
              Ir para Busca de Livros <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {recommendedBooks.map((book) => {
              const savedData = getSavedData(book.id);
              return (
                <BookCard
                  key={book.id}
                  book={book}
                  isSaved={!!savedData}
                  savedData={savedData}
                  onStatusChange={handleStatusChange}
                  onToggleFavorite={handleToggleFavorite}
                  onRemove={handleRemove}
                  onOpenDetails={(b) => setSelectedBook(b)}
                />
              );
            })}
          </div>
        )}
      </div>

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          savedData={getSavedData(selectedBook.id)}
          onClose={() => setSelectedBook(null)}
          onStatusChange={handleStatusChange}
          onSaveReview={handleSaveReview}
          onToggleFavorite={handleToggleFavorite}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
};

