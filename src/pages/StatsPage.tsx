import React, { useState, useEffect } from 'react';
import { getSavedBooks, getReadingGoal, setReadingGoal } from '../services/storageService';
import { analyzeReadingPatterns } from '../services/recommendationService';
import { Target, BookOpen, Layers, Star, Award, TrendingUp, Sparkles } from 'lucide-react';
import { CategoryBadge } from '../components/CategoryBadge';

export const StatsPage: React.FC<{ onNavigateToDiscover: () => void }> = ({ onNavigateToDiscover }) => {
  const [books, setBooks] = useState(getSavedBooks());
  const [goal, setGoal] = useState(getReadingGoal());
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal);

  useEffect(() => {
    setBooks(getSavedBooks());
    setGoal(getReadingGoal());
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
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="font-serif font-bold text-3xl text-stone-900">Estatísticas & Hábitos</h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">Métricas do seu ritmo de leitura</p>
      </div>

      <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-400 border border-brand-500/30">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-400">Meta Anual</div>
              <div className="text-2xl font-serif font-bold mt-0.5">{readBooks.length} de {goal} livros</div>
            </div>
          </div>
          <div>
            {editingGoal ? (
              <div className="flex items-center gap-2">
                <input type="number" min="1" max="365" value={tempGoal} onChange={(e) => setTempGoal(parseInt(e.target.value, 10) || 1)} className="w-16 px-2 py-1 bg-stone-800 text-white text-sm rounded border border-stone-700" />
                <button onClick={handleSaveGoal} className="px-3 py-1 bg-brand-500 text-xs font-semibold rounded">Salvar</button>
              </div>
            ) : (
              <button onClick={() => { setTempGoal(goal); setEditingGoal(true); }} className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200">Ajustar Meta</button>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-stone-400 font-medium"><span>Progresso</span><span className="font-bold text-brand-300">{goalProgress}%</span></div>
          <div className="w-full h-3 bg-stone-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-amber-400 rounded-full transition-all duration-700" style={{ width: `${goalProgress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-amber-200/70 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Award className="w-5 h-5" /></div>
          <div><div className="text-[11px] text-stone-500">Lidos</div><div className="text-xl font-serif font-bold text-stone-900">{readBooks.length}</div></div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-amber-200/70 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl"><BookOpen className="w-5 h-5" /></div>
          <div><div className="text-[11px] text-stone-500">Páginas</div><div className="text-xl font-serif font-bold text-stone-900">{totalPagesRead.toLocaleString('pt-BR')}</div></div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-amber-200/70 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Star className="w-5 h-5" /></div>
          <div><div className="text-[11px] text-stone-500">Média</div><div className="text-xl font-serif font-bold text-stone-900">{averageRating}</div></div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-amber-200/70 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
          <div><div className="text-[11px] text-stone-500">Fila</div><div className="text-xl font-serif font-bold text-stone-900">{readingBooks.length + wantToReadBooks.length}</div></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Layers className="w-5 h-5 text-brand-600" /><h2 className="font-serif font-bold text-lg text-stone-900">Distribuição por Gênero</h2></div>
          <button onClick={onNavigateToDiscover} className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Recomendações</button>
        </div>
        {patterns.categories.length === 0 ? (
          <p className="text-xs text-stone-500 text-center py-4">Nenhum livro lido ainda.</p>
        ) : (
          <div className="space-y-3">
            {patterns.categories.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><CategoryBadge category={cat.name} /><span className="font-semibold text-stone-700">{cat.count}</span></div>
                  <span className="font-bold text-stone-500">{cat.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
