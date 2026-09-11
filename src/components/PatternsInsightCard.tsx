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
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-brand-500/10 rounded-xl text-brand-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Descoberta por Padrões aguardando histórico
            </h3>
            <p className="text-sm text-stone-600 mt-1">
              Marque livros que você já leu como <strong>"Lido"</strong>. O algoritmo identificará seus gêneros e tópicos favoritos para gerar recomendações personalizadas em Português via Google Books API.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const primary = topCategories[0];

  return (
    <div className="bg-white rounded-2xl border border-amber-200/80 p-6 shadow-sm relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-100/40 to-amber-100/30 rounded-full blur-3xl -z-0 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  Padrão Identificado
                </span>
                <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                  Baseado em {totalRead} {totalRead === 1 ? 'livro lido' : 'livros lidos'}
                </span>
              </div>
              <h2 className="font-serif text-xl font-bold text-stone-900 mt-0.5">
                Seu gênero principal é <span className="text-brand-600 font-extrabold">{primary?.displayName || 'Geral'}</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onRefreshRecommendations}
            disabled={isLoading}
            className="self-start md:self-auto flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-brand-50 hover:text-brand-600 text-stone-700 text-xs font-semibold transition-all disabled:opacity-50"
            title="Recarregar recomendações da API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar Sugestões</span>
          </button>
        </div>

        {/* Category distribution bars */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-stone-600">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-stone-400" /> Distribuição das suas preferências:
            </span>
            <span className="text-stone-400">Clique para filtrar por outro padrão</span>
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
                    className="text-xs font-medium py-1 px-3 shadow-xs"
                  />
                  <span className="ml-1 text-[11px] font-semibold text-stone-500">
                    {cat.count}x ({cat.percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
