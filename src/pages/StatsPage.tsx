import React, { useState, useEffect } from 'react';
import { getSavedBooks, getReadingGoal, setReadingGoal } from '../services/storageService';
import { analyzeReadingPatterns } from '../services/recommendationService';
import { Target, BookOpen, Layers, Star, Award, TrendingUp, Sparkles } from 'lucide-react';
import { CategoryBadge } from '../components/CategoryBadge';

export const StatsPage: React.FC<{ onNavigateToDiscover: () => void }> = ({ onNavigateToDiscover }) => {
  const [books, setBooks] = useState(getSavedBooks);
  const [goal, setGoal] = useState(getReadingGoal);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal);

  useEffect(() => {
    const handleUpdate = () => {
      setBooks(getSavedBooks());
      setGoal(getReadingGoal());
    };
    window.addEventListener('marca_pagina_books_updated', handleUpdate);
    return () => window.removeEventListener('marca_pagina_books_updated', handleUpdate);
  }, []);

  const readBooks = books.filter((b) => b.status === 'lido');
  const readingBooks = books.filter((b) => b.status === 'lendo');
  const wantToReadBooks = books.filter((b) => b.status === 'quero_ler');

  const totalPagesRead = readBooks.reduce((acc, b) => acc + (b.pageCount || 0), 0);
  const ratedBooks = readBooks.filter((b) => b.userRating && b.userRating > 0);
  const averageRating = ratedBooks.length > 0
    ? (ratedBooks.reduce((acc, b) => acc + (b.userRating || 0), 0) / ratedBooks.length).toFixed(1)
    : '0.0';

  const patterns = analyzeReadingPatterns();
  const goalProgress = Math.min(Math.round((readBooks.length / (goal || 1)) * 100), 100);

  const handleSaveGoal = () => {
    if (tempGoal > 0) {
      setGoal(tempGoal);
      setReadingGoal(tempGoal);
      setEditingGoal(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="font-sans font-bold text-2xl sm:text-3xl text-zinc-900 tracking-tight">Estatísticas & Hábitos</h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">Métricas do seu ritmo e perfil de leitura</p>
      </div>

      <div className="bg-zinc-900 text-white rounded-2xl p-6 sm:p-7 border border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-200 border border-zinc-700/50">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Meta Anual de Leitura</div>
              <div className="text-xl font-bold text-white mt-0.5">{readBooks.length} de {goal} livros</div>
            </div>
          </div>
          <div>
            {editingGoal ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(parseInt(e.target.value, 10) || 1)}
                  className="w-16 px-2.5 py-1 bg-zinc-800 text-white text-xs rounded-lg border border-zinc-700 focus:outline-none focus:border-zinc-500"
                />
                <button
                  onClick={handleSaveGoal}
                  className="px-3 py-1 bg-white text-zinc-900 text-xs font-semibold rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setTempGoal(goal); setEditingGoal(true); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/60 transition-colors cursor-pointer"
              >
                Ajustar Meta
              </button>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-400 font-medium">
            <span>Progresso da meta</span>
            <span className="font-semibold text-zinc-200">{goalProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-100 rounded-full transition-all duration-700"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100"><Award className="w-4 h-4" /></div>
          <div><div className="text-[11px] text-zinc-500 font-medium">Lidos</div><div className="text-xl font-bold text-zinc-900">{readBooks.length}</div></div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100"><BookOpen className="w-4 h-4" /></div>
          <div><div className="text-[11px] text-zinc-500 font-medium">Páginas</div><div className="text-xl font-bold text-zinc-900">{totalPagesRead.toLocaleString('pt-BR')}</div></div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100"><Star className="w-4 h-4" /></div>
          <div><div className="text-[11px] text-zinc-500 font-medium">Avaliação Média</div><div className="text-xl font-bold text-zinc-900">{averageRating}</div></div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg border border-purple-100"><TrendingUp className="w-4 h-4" /></div>
          <div><div className="text-[11px] text-zinc-500 font-medium">Fila Ativa</div><div className="text-xl font-bold text-zinc-900">{readingBooks.length + wantToReadBooks.length}</div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-700" />
            <h2 className="font-sans font-bold text-sm sm:text-base text-zinc-900">Distribuição por Gênero</h2>
          </div>
          <button
            onClick={onNavigateToDiscover}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" /> Recomendações
          </button>
        </div>
        {patterns.categories.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">Nenhum livro lido ainda para gerar estatísticas de gênero.</p>
        ) : (
          <div className="space-y-3">
            {patterns.categories.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={cat.name} />
                    <span className="font-medium text-zinc-700">{cat.count} {cat.count === 1 ? 'livro' : 'livros'}</span>
                  </div>
                  <span className="font-semibold text-zinc-600">{cat.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
