import React from 'react';
import { normalizeCategoryName, getCategoryColor } from '../utils/categoryUtils';
import { Loader2 } from 'lucide-react';

interface CategoryBadgeProps {
  category: string;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  isLoading?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  className = '',
  onClick,
  selected = false,
  isLoading = false,
}) => {
  const displayName = normalizeCategoryName(category);
  const color = getCategoryColor(category);

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading && selected}
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer disabled:cursor-default ${
          selected
            ? 'bg-[#422F1D] text-[#FAF6F0] border-[#422F1D] shadow-xs'
            : `${color.bg} ${color.border} hover:border-[#BA9B77] hover:text-[#2D241E]`
        } ${className}`}
      >
        <span>{displayName}</span>
        {selected && isLoading && <Loader2 className="w-2.5 h-2.5 text-[#D3BC9E] animate-spin" />}
      </button>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${color.bg} ${color.border} ${className}`}
    >
      {displayName}
    </span>
  );
};

