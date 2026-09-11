import React from 'react';
import { normalizeCategoryName, getCategoryColor } from '../utils/categoryUtils';

interface CategoryBadgeProps {
  category: string;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  className = '',
  onClick,
  selected = false,
}) => {
  const displayName = normalizeCategoryName(category);
  const color = getCategoryColor(category);

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer ${
          selected
            ? 'bg-[#422F1D] text-[#FAF6F0] border-[#422F1D] shadow-xs'
            : `${color.bg} ${color.border} hover:border-[#BA9B77] hover:text-[#2D241E]`
        } ${className}`}
      >
        {displayName}
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

