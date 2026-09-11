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
        <h1 className="font-sans font-bold text-2xl sm:text-3xl text-[#2D241E] tracking-tight">Estatísticas & Hábitos</h1>
        <p className="text-xs sm:text-sm text-[#7D6E65] mt-1">Métricas do seu ritmo e perfil de leitura</p>
      </div>

      <div className="bg-[#382A24] text-[#FAF6F0] rounded-2xl p-6 sm:p-7 border border-[#2C1F13] shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4D3B33] flex items-center justify-center text-[#D3BC9E] border border-[#5F483E]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D3BC9E]">Meta Anual de Leitura</div>
              <div className="text-xl font-bold text-[#FAF6F0] mt-0.5">{readBooks.length} de {goal} livros</div>
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
                  className="w-16 px-2.5 py-1 bg-[#4D3B33] text-[#FAF6F0] text-xs rounded-lg border border-[#5F483E] focus:outline-none focus:border-[#D3BC9E]"
                />
                <button
                  onClick={handleSaveGoal}
                  className="px-3 py-1 bg-[#FAF6F0] text-[#2D241E] text-xs font-semibold rounded-lg hover:bg-white transition-colors cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setTempGoal(goal); setEditingGoal(true); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#4D3B33] hover:bg-[#5F483E] text-[#FAF6F0] border border-[#5F483E] transition-colors cursor-pointer"
              >
                Ajustar Meta
              </button>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#D3BC9E] font-medium">
            <span>Progresso da meta</span>
            <span className="font-semibold text-[#FAF6F0]">{goalProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-[#4D3B33] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D3BC9E] rounded-full transition-all duration-700"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] shadow-2xs flex items-center gap-3">
          <div className="p-2 bg-[#F0F4EC] text-[#4B6B38] rounded-lg border border-[#DCE5D3]"><Award className="w-4 h-4" /></div>
          <div><div className="text-[11px] text-[#7D6E65] font-medium">Lidos</div><div className="text-xl font-bold text-[#2D241E]">{readBooks.length}</div></div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] shadow-2xs flex items-center gap-3">
          <div className="p-2 bg-[#F4ECE1] text-[#7F5E3B] rounded-lg border border-[#E6D7C3]"><BookOpen className="w-4 h-4" /></div>
          <div><div className="text-[11px] text-[#7D6E65] font-medium">Páginas</div><div className="text-xl font-bold text-[#2D241E]">{totalPagesRead.toLocaleString('pt-BR')}</div></div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] shadow-2xs flex items-center gap-3">
          <div className="p-2 bg-[#FAF1DF] text-[#87581B] rounded-lg border border-[#EEDDBF]"><Star className="w-4 h-4" /></div>
          <div><div className="text-[11px] text-[#7D6E65] font-medium">Avaliação Média</div><div className="text-xl font-bold text-[#2D241E]">{averageRating}</div></div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#E6DCCF] shadow-2xs flex items-center gap-3">
          <div className="p-2 bg-[#F7EBE5] text-[#8C381B] rounded-lg border border-[#ECD5C8]"><TrendingUp className="w-4 h-4" /></div>
          <div><div className="text-[11px] text-[#7D6E65] font-medium">Fila Ativa</div><div className="text-xl font-bold text-[#2D241E]">{readingBooks.length + wantToReadBooks.length}</div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6DCCF] shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#5F442A]" />
            <h2 className="font-sans font-bold text-sm sm:text-base text-[#2D241E]">Distribuição por Gênero</h2>
          </div>
          <button
            onClick={onNavigateToDiscover}
            className="text-xs font-medium text-[#7D6E65] hover:text-[#2D241E] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A05E35]" /> Recomendações
          </button>
        </div>
        {patterns.categories.length === 0 ? (
          <p className="text-xs text-[#7D6E65] text-center py-6">Nenhum livro lido ainda para gerar estatísticas de gênero.</p>
        ) : (
          <div className="space-y-3">
            {patterns.categories.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={cat.name} />
                    <span className="font-medium text-[#2D241E]">{cat.count} {cat.count === 1 ? 'livro' : 'livros'}</span>
                  </div>
                  <span className="font-semibold text-[#5F442A]">{cat.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#F4ECE1] rounded-full overflow-hidden">
                  <div className="h-full bg-[#422F1D] rounded-full" style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
