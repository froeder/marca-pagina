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
      <div className="bg-white border border-dashed border-[#D3BC9E] rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-[#F4ECE1] rounded-xl text-[#5F442A] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-sm sm:text-base text-[#2D241E]">
              Descoberta por Padrões Literários
            </h3>
            <p className="text-xs sm:text-sm text-[#7D6E65] mt-1 leading-relaxed">
              Marque livros que você já leu como <strong className="text-[#422F1D]">"Lido"</strong> na sua estante. O sistema analisará seus hábitos de leitura para sugerir novas obras em Português pela Google Books API.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const primary = topCategories[0];

  return (
    <div className="bg-white rounded-2xl border border-[#E6DCCF] p-5 sm:p-6 shadow-[0_1px_3px_rgba(44,31,19,0.03)] relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F2ECE4]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#F4ECE1] flex items-center justify-center text-[#5F442A] shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7D73]">
                Padrão Ativo
              </span>
              <span className="text-[11px] bg-[#F4ECE1] text-[#5F442A] px-2 py-0.2 rounded-md font-medium">
                {totalRead} {totalRead === 1 ? 'livro analisado' : 'livros analisados'}
              </span>
            </div>
            <h2 className="font-sans text-base sm:text-lg font-semibold text-[#2D241E] mt-0.5">
              Gênero predominante: <span className="text-[#422F1D] font-bold">{primary?.displayName || 'Geral'}</span>
            </h2>
          </div>
        </div>

        <button
          onClick={onRefreshRecommendations}
          disabled={isLoading}
          className="self-start md:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#F4ECE1] hover:bg-[#E6D7C3] text-[#422F1D] text-xs font-medium transition-all disabled:opacity-50 cursor-pointer"
          title="Recarregar recomendações da API"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar Sugestões</span>
        </button>
      </div>

      {/* Category distribution pills */}
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-medium text-[#7D6E65]">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#8C7D73]" /> Distribuição de preferências:
          </span>
          <span className="text-[11px] text-[#A89B91] hidden sm:inline">Clique para alternar o filtro ativo</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {topCategories.map((cat) => {
            const isSelected =
              activeCategory === cat.name ||
              activeCategory === cat.displayName ||
              (!activeCategory && (primary?.name === cat.name || primary?.displayName === cat.displayName));
            return (
              <div key={cat.name} className="flex items-center">
                <CategoryBadge
                  category={cat.displayName || cat.name}
                  selected={isSelected}
                  isLoading={isLoading}
                  onClick={() => onSelectCategory(cat.displayName || cat.name)}
                />
                <span className="ml-1 text-[11px] font-medium text-[#8C7D73]">
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

