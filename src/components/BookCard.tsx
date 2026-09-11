import React, { useState } from 'react';
import type { GoogleBookItem, SavedBook, ReadingStatus } from '../types/book';
import { formatAuthors, formatYear } from '../utils/formatters';
import { sanitizeImageUrl, getBookCoverFallback } from '../utils/imageUtils';
import { CategoryBadge } from './CategoryBadge';
import { Heart, Star, CheckCircle, Clock, Bookmark } from 'lucide-react';

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
    <div className="group bg-white rounded-xl border border-amber-100 shadow-xs hover:shadow-lg transition-all flex flex-col h-full overflow-hidden">
      <div className="relative pt-[130%] bg-stone-100 overflow-hidden cursor-pointer" onClick={() => onOpenDetails?.(book)}>
        <img
          src={imgSrc}
          alt={title}
          onError={() => setImgSrc(getBookCoverFallback(title, authors?.[0]))}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(book.id); }}
            className={`absolute top-2 right-2 p-1.5 rounded-full ${isFav ? 'bg-rose-500 text-white' : 'bg-white/80 text-stone-600'}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        )}
        {status && (
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${status === 'lido' ? 'bg-emerald-600' : status === 'lendo' ? 'bg-amber-600' : 'bg-blue-600'}`}>
              {status === 'lido' ? 'Lido' : status === 'lendo' ? 'Lendo' : 'Quero'}
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        {categories.length > 0 && (
          <div className="mb-1 flex flex-wrap gap-1">
            {categories.slice(0, 1).map((cat, i) => (
              <CategoryBadge key={i} category={cat} />
            ))}
          </div>
        )}

        <h3 onClick={() => onOpenDetails?.(book)} className="font-serif font-bold text-stone-900 text-sm line-clamp-2 cursor-pointer hover:text-brand-600">
          {title}
        </h3>
        <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{formatAuthors(authors)}</p>

        <div className="flex items-center text-[11px] text-stone-400 gap-1.5 mt-1">
          {pubDate && <span>{formatYear(pubDate)}</span>}
          {pubDate && pages && <span>•</span>}
          {pages && <span>{pages} pág.</span>}
        </div>

        {rating !== undefined && rating > 0 && (
          <div className="flex items-center space-x-1 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-3 h-3 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`} />
            ))}
          </div>
        )}

        <div className="mt-auto pt-2.5 border-t border-stone-100 flex flex-col gap-1">
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => onStatusChange?.(book, 'lido')}
              className={`py-1 rounded text-[10px] font-semibold border flex flex-col items-center ${status === 'lido' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-stone-50 text-stone-600 border-stone-200'}`}
            >
              <CheckCircle className="w-3 h-3 mb-0.5" /> Lido
            </button>
            <button
              onClick={() => onStatusChange?.(book, 'lendo')}
              className={`py-1 rounded text-[10px] font-semibold border flex flex-col items-center ${status === 'lendo' ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-stone-50 text-stone-600 border-stone-200'}`}
            >
              <Clock className="w-3 h-3 mb-0.5" /> Lendo
            </button>
            <button
              onClick={() => onStatusChange?.(book, 'quero_ler')}
              className={`py-1 rounded text-[10px] font-semibold border flex flex-col items-center ${status === 'quero_ler' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-stone-50 text-stone-600 border-stone-200'}`}
            >
              <Bookmark className="w-3 h-3 mb-0.5" /> Quero
            </button>
          </div>
          {isSaved && onRemove && (
            <button onClick={() => onRemove(book.id)} className="text-[10px] text-stone-400 hover:text-rose-600 text-center">
              Remover
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
