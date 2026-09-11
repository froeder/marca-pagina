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
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer ${
          selected
            ? 'bg-brand-500 text-white border-brand-600 shadow-sm'
            : `${color.bg} ${color.border} hover:opacity-80`
        } ${className}`}
      >
        {displayName}
      </button>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color.bg} ${color.border} ${className}`}
    >
      {displayName}
    </span>
  );
};
