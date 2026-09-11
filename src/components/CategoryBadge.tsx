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
            ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
            : `${color.bg} ${color.border} hover:border-zinc-400 hover:text-zinc-900`
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

