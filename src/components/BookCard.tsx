import React, { useState } from 'react';
import type { GoogleBookItem, SavedBook, ReadingStatus } from '../types/book';
import { formatAuthors, formatYear } from '../utils/formatters';
import { sanitizeImageUrl, getBookCoverFallback } from '../utils/imageUtils';
import { CategoryBadge } from './CategoryBadge';
import { Heart, Star, CheckCircle, Clock, Bookmark, Trash2 } from 'lucide-react';

interface BookCardProps {
  book: GoogleBookItem | SavedBook;
  isSaved?: boolean;
  savedData?: SavedBook;
  onStatusChange?: (book: GoogleBookItem | SavedBook, status: ReadingStatus) => void;
  onToggleFavorite?: (id: string) => void;
  onOpenDetails?: (book: GoogleBookItem | SavedBook) => void;
  onRemove?: (id: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book, isSaved, savedData, onStatusChange, onToggleFavorite, onOpenDetails, onRemove
}) => {
  const isG = 'volumeInfo' in book;
  const title = isG ? book.volumeInfo.title : book.title;
  const authors = isG ? book.volumeInfo.authors : book.authors;
  const categories = isG ? (book.volumeInfo.categories || []) : (book.categories || []);
  const pubDate = isG ? book.volumeInfo.publishedDate : book.publishedDate;
  const pages = isG ? book.volumeInfo.pageCount : book.pageCount;
  const rawThumb = isG ? (book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail) : book.thumbnail;

  const [imgSrc, setImgSrc] = useState(sanitizeImageUrl(rawThumb) || getBookCoverFallback(title, authors?.[0]));
  const status: ReadingStatus | undefined = savedData?.status || (!isG ? book.status : undefined);
  const isFav = savedData?.favorite || (!isG ? book.favorite : false);
  const rating = savedData?.userRating || (!isG ? book.userRating : undefined);

  return (
    <div className="group bg-white rounded-xl border border-zinc-200/80 hover:border-zinc-300 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 flex flex-col h-full overflow-hidden">
      {/* COVER */}
      <div className="relative pt-[132%] bg-zinc-100 overflow-hidden cursor-pointer" onClick={() => onOpenDetails?.(book)}>
        <img
          src={imgSrc}
          alt={title}
          onError={() => setImgSrc(getBookCoverFallback(title, authors?.[0]))}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(book.id); }}
            aria-label="Favorito"
            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isFav
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white/80 text-zinc-600 hover:bg-white hover:text-zinc-900'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        )}
        {status && (
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide shadow-xs ${
              status === 'lido'
                ? 'bg-zinc-900 text-white'
                : status === 'lendo'
                ? 'bg-amber-600 text-white'
                : 'bg-blue-600 text-white'
            }`}>
              {status === 'lido' ? 'Lido' : status === 'lendo' ? 'Lendo' : 'Quero'}
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1">
        {categories.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {categories.slice(0, 1).map((cat, i) => (
              <CategoryBadge key={i} category={cat} />
            ))}
          </div>
        )}

        <h3
          onClick={() => onOpenDetails?.(book)}
          className="font-sans font-semibold text-zinc-900 text-xs sm:text-sm line-clamp-2 cursor-pointer hover:text-zinc-600 transition-colors leading-snug"
          title={title}
        >
          {title}
        </h3>

        <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 line-clamp-1">
          {formatAuthors(authors)}
        </p>

        <div className="flex items-center text-[10px] sm:text-[11px] text-zinc-400 gap-1.5 mt-1">
          {pubDate && <span>{formatYear(pubDate)}</span>}
          {pubDate && pages && <span>•</span>}
          {pages && <span>{pages} pág.</span>}
        </div>

        {rating !== undefined && rating > 0 && (
          <div className="flex items-center space-x-0.5 mt-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3 h-3 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'}`}
              />
            ))}
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-auto pt-2.5 border-t border-zinc-100 flex flex-col gap-1">
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1 bg-zinc-50 p-0.5 rounded-lg border border-zinc-100">
            <button
              onClick={() => onStatusChange?.(book, 'lido')}
              className={`py-1 rounded-md text-[9px] sm:text-[10px] font-medium flex items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer ${
                status === 'lido'
                  ? 'bg-zinc-900 text-white shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>Lido</span>
            </button>
            <button
              onClick={() => onStatusChange?.(book, 'lendo')}
              className={`py-1 rounded-md text-[9px] sm:text-[10px] font-medium flex items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer ${
                status === 'lendo'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>Lendo</span>
            </button>
            <button
              onClick={() => onStatusChange?.(book, 'quero_ler')}
              className={`py-1 rounded-md text-[9px] sm:text-[10px] font-medium flex items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer ${
                status === 'quero_ler'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              <Bookmark className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>Quero</span>
            </button>
          </div>

          {isSaved && onRemove && (
            <button
              onClick={() => onRemove(book.id)}
              className="text-[10px] text-zinc-400 hover:text-rose-600 py-0.5 flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-2.5 h-2.5" />
              <span>Remover</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
