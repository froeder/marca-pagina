import React from 'react';
import type { CategoryStat } from '../types/book';
import { Sparkles, TrendingUp, Layers, RefreshCw } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';

interface PatternsInsightCardProps {
  totalRead: number;
  topCategories: CategoryStat[];
  activeCategory: string | null;
  onSelectCategory: (categoryName: string) => void;
  onRefreshRecommendations: () => void;
  isLoading: boolean;
}

export const PatternsInsightCard: React.FC<PatternsInsightCardProps> = ({
  totalRead,
  topCategories,
  activeCategory,
  onSelectCategory,
  onRefreshRecommendations,
  isLoading,
}) => {
  if (totalRead === 0) {
    return (
      <div className="bg-white border border-dashed border-zinc-300 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-zinc-100 rounded-xl text-zinc-800 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-sm sm:text-base text-zinc-900">
              Descoberta por Padrões Literários
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 leading-relaxed">
              Marque livros que você já leu como <strong>"Lido"</strong> na sua estante. O sistema analisará seus hábitos de leitura para sugerir novas obras em Português pela Google Books API.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const primary = topCategories[0];

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Padrão Ativo
              </span>
              <span className="text-[11px] bg-zinc-100 text-zinc-600 px-2 py-0.2 rounded-md font-medium">
                {totalRead} {totalRead === 1 ? 'livro analisado' : 'livros analisados'}
              </span>
            </div>
            <h2 className="font-sans text-base sm:text-lg font-semibold text-zinc-900 mt-0.5">
              Gênero predominante: <span className="text-zinc-950 font-bold">{primary?.displayName || 'Geral'}</span>
            </h2>
          </div>
        </div>

        <button
          onClick={onRefreshRecommendations}
          disabled={isLoading}
          className="self-start md:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200/70 text-zinc-800 text-xs font-medium transition-all disabled:opacity-50 cursor-pointer"
          title="Recarregar recomendações da API"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar Sugestões</span>
        </button>
      </div>

      {/* Category distribution pills */}
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-400" /> Distribuição de preferências:
          </span>
          <span className="text-[11px] text-zinc-400 hidden sm:inline">Clique para alternar o filtro ativo</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {topCategories.map((cat) => {
            const isSelected = (activeCategory || primary?.name) === cat.name;
            return (
              <div key={cat.name} className="flex items-center">
                <CategoryBadge
                  category={cat.name}
                  selected={isSelected}
                  onClick={() => onSelectCategory(cat.name)}
                />
                <span className="ml-1 text-[11px] font-medium text-zinc-400">
                  {cat.count}x ({cat.percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

