import React, { useState } from 'react';
import type { GoogleBookItem, SavedBook, ReadingStatus } from '../types/book';
import { formatAuthors, formatYear } from '../utils/formatters';
import { sanitizeImageUrl, getBookCoverFallback } from '../utils/imageUtils';
import { CategoryBadge } from './CategoryBadge';
import { X, ExternalLink, Star, CheckCircle, Clock, Bookmark, Heart, BookOpen } from 'lucide-react';

interface Props {
  book: GoogleBookItem | SavedBook | null;
  savedData?: SavedBook;
  onClose: () => void;
  onStatusChange: (b: GoogleBookItem | SavedBook, s: ReadingStatus) => void;
  onSaveReview?: (id: string, rating?: number, notes?: string) => void;
  onToggleFavorite?: (id: string) => void;
}
export const BookDetailModal: React.FC<Props> = ({
  book, savedData, onClose, onStatusChange, onSaveReview, onToggleFavorite
}) => {
  if (!book) return null;
  const isG = 'volumeInfo' in book;
  const title = isG ? book.volumeInfo.title : book.title;
  const authors = isG ? book.volumeInfo.authors : book.authors;
  const categories = isG ? (book.volumeInfo.categories || []) : (book.categories || []);
  const description = isG ? (book.volumeInfo.description || 'Sem sinopse.') : (book.description || 'Sem sinopse.');
  const pubDate = isG ? book.volumeInfo.publishedDate : book.publishedDate;
  const pages = isG ? book.volumeInfo.pageCount : book.pageCount;
  const previewLink = isG ? book.volumeInfo.previewLink : book.previewLink;
  const rawThumb = isG ? (book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail) : book.thumbnail;

  const [imgSrc, setImgSrc] = useState(sanitizeImageUrl(rawThumb) || getBookCoverFallback(title, authors?.[0]));
  const currentStatus = savedData?.status || (!isG ? book.status : undefined);
  const isFav = savedData?.favorite || (!isG ? book.favorite : false);
  const [rating, setRating] = useState(savedData?.userRating || (!isG ? book.userRating || 0 : 0));
  const [notes, setNotes] = useState(savedData?.userNotes || (!isG ? book.userNotes || '' : ''));
  const [savedAlert, setSavedAlert] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl p-4 border border-amber-100">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full bg-stone-100 text-stone-600"><X className="w-4 h-4" /></button>
        <div className="flex gap-3">
          <div className="w-24 shrink-0">
            <img src={imgSrc} alt={title} onError={() => setImgSrc(getBookCoverFallback(title, authors?.[0]))} className="w-full aspect-2/3 object-cover rounded shadow" />
            {previewLink && (
              <a href={previewLink} target="_blank" rel="noreferrer" className="mt-1 text-center text-[10px] font-semibold py-0.5 bg-amber-50 text-brand-700 rounded flex items-center justify-center gap-1 border border-amber-200">
                <BookOpen className="w-3 h-3" /> Prévia <ExternalLink className="w-2 h-2" />
              </a>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1 mb-1">{categories.slice(0, 2).map((c, i) => <CategoryBadge key={i} category={c} />)}</div>
            <h2 className="font-serif font-bold text-sm text-stone-900 line-clamp-2">{title}</h2>
            <p className="text-xs text-brand-700 font-medium truncate">{formatAuthors(authors)}</p>
            <div className="text-[10px] text-stone-400 mt-0.5">{pubDate && formatYear(pubDate)} {pages && `• ${pages} p.`}</div>
            <div className="mt-2 grid grid-cols-3 gap-1">
              <button onClick={() => onStatusChange(book, 'lido')} className={`py-0.5 rounded text-[10px] font-semibold border flex items-center justify-center gap-0.5 ${currentStatus === 'lido' ? 'bg-emerald-600 text-white' : 'bg-stone-50'}`}><CheckCircle className="w-3 h-3" /> Lido</button>
              <button onClick={() => onStatusChange(book, 'lendo')} className={`py-0.5 rounded text-[10px] font-semibold border flex items-center justify-center gap-0.5 ${currentStatus === 'lendo' ? 'bg-amber-600 text-white' : 'bg-stone-50'}`}><Clock className="w-3 h-3" /> Lendo</button>
              <button onClick={() => onStatusChange(book, 'quero_ler')} className={`py-0.5 rounded text-[10px] font-semibold border flex items-center justify-center gap-0.5 ${currentStatus === 'quero_ler' ? 'bg-blue-600 text-white' : 'bg-stone-50'}`}><Bookmark className="w-3 h-3" /> Quero</button>
            </div>
            {onToggleFavorite && (
              <button onClick={() => onToggleFavorite(book.id)} className={`mt-1 text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded border ${isFav ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-stone-50 text-stone-600'}`}>
                <Heart className={`w-3 h-3 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} /> {isFav ? 'Favorito' : 'Favoritar'}
              </button>
            )}
          </div>
        </div>
        <div className="my-2">
          <h4 className="font-serif font-bold text-stone-900 text-xs uppercase">Sinopse</h4>
          <div className="text-xs text-stone-600 max-h-20 overflow-y-auto" dangerouslySetInnerHTML={{ __html: description }} />
        </div>
        <div className="p-2 bg-stone-50 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-stone-700">Nota & Resenha</span>
            {savedAlert && <span className="text-[11px] text-emerald-600 font-bold">Salvo!</span>}
          </div>
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => setRating(s === rating ? 0 : s)}>
                <Star className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
              </button>
            ))}
          </div>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anotações..." className="w-full text-xs p-1 rounded border border-stone-300 bg-white" />
          <div className="flex justify-end mt-1">
            <button onClick={() => { onSaveReview?.(book.id, rating, notes); setSavedAlert(true); setTimeout(() => setSavedAlert(false), 2000); }} className="px-2 py-0.5 bg-brand-600 text-white text-[11px] font-semibold rounded">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

