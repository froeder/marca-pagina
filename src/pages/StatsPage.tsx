import React, { useState, useEffect } from 'react';
import {
  getSavedBooks, getReadingGoals, createReadingGoal, updateReadingGoal, deleteReadingGoal,
  countReadBooks, countPagesRead,
} from '../services/storageService';
import { analyzeReadingPatterns } from '../services/recommendationService';
import { Target, BookOpen, Layers, Star, Award, TrendingUp, Sparkles, Plus, Trash2, Check } from 'lucide-react';
import { CategoryBadge } from '../components/CategoryBadge';
import type { ReadingGoal, ReadingGoalUnit } from '../types/book';

export const StatsPage: React.FC<{ onNavigateToDiscover: () => void }> = ({ onNavigateToDiscover }) => {
  const [books, setBooks] = useState(getSavedBooks);
  const [goals, setGoals] = useState<ReadingGoal[]>(getReadingGoals);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editTarget, setEditTarget] = useState<number>(1);
  const [editUnit, setEditUnit] = useState<ReadingGoalUnit>('books');

  useEffect(() => {
    const handleUpdate = () => {
      setBooks(getSavedBooks());
      setGoals(getReadingGoals());
    };
    window.addEventListener('marca_pagina_books_updated', handleUpdate);
    window.addEventListener('marca_pagina_goals_updated', handleUpdate);
    return () => {
      window.removeEventListener('marca_pagina_books_updated', handleUpdate);
      window.removeEventListener('marca_pagina_goals_updated', handleUpdate);
    };
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

  const startCreate = () => {
    setEditingId('__new__');
    setEditLabel('');
    setEditTarget(1);
    setEditUnit('books');
  };

  const saveGoal = () => {
    const label = editLabel.trim();
    if (!label || editTarget <= 0) return;
    if (editingId === '__new__') {
      createReadingGoal(label, editTarget, editUnit);
    } else if (editingId) {
      updateReadingGoal(editingId, label, editTarget, editUnit);
    }
    setEditingId(null);
    setGoals(getReadingGoals());
  };

  const handleDeleteGoal = (id: string) => {
    deleteReadingGoal(id);
    setGoals(getReadingGoals());
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="font-sans font-bold text-2xl sm:text-3xl text-[#2D241E] tracking-tight">Estatísticas & Hábitos</h1>
        <p className="text-xs sm:text-sm text-[#7D6E65] mt-1">Métricas do seu ritmo e perfil de leitura</p>
      </div>

      <div className="bg-[#382A24] text-[#FAF6F0] rounded-2xl p-6 sm:p-7 border border-[#2C1F13] shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4D3B33] flex items-center justify-center text-[#D3BC9E] border border-[#5F483E]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D3BC9E]">Metas Personalizadas</div>
              <div className="text-sm text-[#D3BC9E] mt-0.5">Defina metas por livros ou páginas</div>
            </div>
          </div>
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF6F0] hover:bg-white text-[#2D241E] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Meta
          </button>
        </div>
{goals.length === 0 && editingId !== '__new__' ? (
          <p className="text-xs text-[#D3BC9E] bg-[#4D3B33] border border-[#5F483E] rounded-lg px-3 py-2.5">
            Você ainda não tem metas personalizadas. Crie uma meta de livros ou de páginas para acompanhar seu progresso.
          </p>
        ) : (
          <ul className="space-y-3">
            {goals.map((g) => {
              const progressValue = g.unit === 'books' ? countReadBooks() : countPagesRead();
              const pct = Math.min(Math.round((progressValue / (g.target || 1)) * 100), 100);
              const isEditing = editingId === g.id;
              const isDone = progressValue >= g.target;
              return (
                <li key={g.id} className="bg-[#4D3B33] border border-[#5F483E] rounded-xl p-3.5">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        placeholder="Nome da meta"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-[#3A2E29] text-[#FAF6F0] border border-[#5F483E] focus:outline-none focus:border-[#D3BC9E]"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={editTarget}
                          onChange={(e) => setEditTarget(parseInt(e.target.value, 10) || 1)}
                          className="w-20 text-xs px-2.5 py-1.5 rounded-lg bg-[#3A2E29] text-[#FAF6F0] border border-[#5F483E] focus:outline-none focus:border-[#D3BC9E]"
                        />
                        <select
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value as ReadingGoalUnit)}
                          className="text-xs px-2 py-1.5 rounded-lg bg-[#3A2E29] text-[#FAF6F0] border border-[#5F483E] focus:outline-none focus:border-[#D3BC9E] cursor-pointer"
                        >
                          <option value="books">livros</option>
                          <option value="pages">páginas</option>
                        </select>
                        <button
                          onClick={saveGoal}
                          className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FAF6F0] text-[#2D241E] text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1.5 rounded-lg text-[#D3BC9E] hover:text-white text-xs hover:bg-[#5F483E] transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-semibold text-[#FAF6F0] truncate">{g.label}</span>
                          {isDone && (
                            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#D3BC9E] text-[#2D241E]">
                              Concluída
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => { setEditingId(g.id); setEditLabel(g.label); setEditTarget(g.target); setEditUnit(g.unit); }}
                            aria-label={`Editar ${g.label}`}
                            className="p-1.5 rounded-lg text-[#D3BC9E] hover:text-white hover:bg-[#5F483E] transition-colors cursor-pointer"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGoal(g.id);
                            }}
                            aria-label={`Excluir ${g.label}`}
                            className="p-1.5 rounded-lg text-[#D3BC9E] hover:text-rose-400 hover:bg-[#5F483E] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#D3BC9E] mb-1.5">
                        {progressValue.toLocaleString('pt-BR')} de {g.target.toLocaleString('pt-BR')} {g.unit === 'books' ? 'livros' : 'páginas'}
                      </div>
                      <div className="w-full h-2 bg-[#382A24] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${isDone ? 'bg-emerald-400' : 'bg-[#D3BC9E]'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </>
                  )}
                </li>
              );
            })}
{editingId === '__new__' && (
              <li className="bg-[#4D3B33] border border-[#5F483E] rounded-xl p-3.5 space-y-2">
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveGoal(); }}
                  placeholder="Nome da meta (ex: 12 livros em 2026, 10.000 páginas...)"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-[#3A2E29] text-[#FAF6F0] border border-[#5F483E] focus:outline-none focus:border-[#D3BC9E]"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={editTarget}
                    onChange={(e) => setEditTarget(parseInt(e.target.value, 10) || 1)}
                    className="w-20 text-xs px-2.5 py-1.5 rounded-lg bg-[#3A2E29] text-[#FAF6F0] border border-[#5F483E] focus:outline-none focus:border-[#D3BC9E]"
                  />
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value as ReadingGoalUnit)}
                    className="text-xs px-2 py-1.5 rounded-lg bg-[#3A2E29] text-[#FAF6F0] border border-[#5F483E] focus:outline-none focus:border-[#D3BC9E] cursor-pointer"
                  >
                    <option value="books">livros</option>
                    <option value="pages">páginas</option>
                  </select>
                  <button
                    onClick={saveGoal}
                    className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FAF6F0] text-[#2D241E] text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1.5 rounded-lg text-[#D3BC9E] hover:text-white text-xs hover:bg-[#5F483E] transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </li>
            )}
          </ul>
        )}
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
