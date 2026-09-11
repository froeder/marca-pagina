import React, { useState, useEffect, useCallback } from 'react';
import type { GoogleBookItem, SavedBook, ReadingStatus, CategoryStat } from '../types/book';
import { analyzeReadingPatterns, discoverBooksByPattern } from '../services/recommendationService';
import { getSavedBooks, addOrUpdateFromGoogleBook, updateBookStatus, toggleFavorite, updateBookReview } from '../services/storageService';
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
    setLoading(true);
    setErrorMsg(null);
    const targetCat = categoryOverride !== undefined ? categoryOverride : (activeCategory || undefined);
    if (categoryOverride !== undefined) {
      setActiveCategory(categoryOverride);
    }
    discoverBooksByPattern(targetCat)
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

  const handleSaveReview = (id: string, rating?: number, notes?: string) => {
    updateBookReview(id, rating, notes);
    setSavedBooks(getSavedBooks());
  };

  const getSavedData = (id: string) => savedBooks.find((b) => b.id === id);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-stone-900 to-amber-950 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Motor de Recomendação Inteligente</span>
          </div>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Descoberta por Padrões
          </h1>
          <p className="mt-3 text-stone-300 text-sm sm:text-base leading-relaxed">
            Seu histórico de leitura define seu próximo livro favorito. Analisamos os assuntos mais frequentes dos livros que você já leu e buscamos sugestões em Português na Google Books API.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onNavigateToSearch}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-brand-500/30"
            >
              <Compass className="w-4 h-4" />
              <span>Buscar & Adicionar Livros</span>
            </button>
            <button
              onClick={onNavigateToMyBooks}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all border border-white/10"
            >
              <Library className="w-4 h-4" />
              <span>Ver Minha Estante ({savedBooks.length})</span>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif font-bold text-2xl text-stone-900 flex items-center gap-2">
              <span>Sugestões Personalizadas</span>
              <span className="text-xs font-sans font-semibold bg-brand-100 text-brand-800 px-2.5 py-0.5 rounded-full">
                {recommendedBooks.length} obras encontradas
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Livros em Português descobertos a partir do seu perfil de leitura
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-sm font-medium text-stone-500">
              Consultando a Google Books API com base nos seus padrões...
            </p>
          </div>
        ) : errorMsg ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
            <p className="text-sm font-medium text-rose-700">{errorMsg}</p>
            <button onClick={() => loadRecommendations()} className="mt-3 text-xs font-semibold px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
              Tentar Novamente
            </button>
          </div>
        ) : recommendedBooks.length === 0 ? (
          <div className="p-10 bg-white rounded-2xl border border-stone-200 text-center space-y-3">
            <p className="font-serif text-lg font-semibold text-stone-800">
              Nenhuma nova recomendação encontrada para o padrão atual.
            </p>
            <button onClick={onNavigateToSearch} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700">
              Ir para Busca de Livros <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
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
        />
      )}
    </div>
  );
};

