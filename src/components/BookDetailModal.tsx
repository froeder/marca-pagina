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
export const BookDetailModalInner: React.FC<{
  book: GoogleBookItem | SavedBook;
  savedData?: SavedBook;
  onClose: () => void;
  onStatusChange: (b: GoogleBookItem | SavedBook, s: ReadingStatus) => void;
  onSaveReview?: (id: string, rating?: number, notes?: string) => void;
  onToggleFavorite?: (id: string) => void;
}> = ({
  book, savedData, onClose, onStatusChange, onSaveReview, onToggleFavorite
}) => {
  const isG = 'volumeInfo' in book;
  const title = isG ? book.volumeInfo.title : book.title;
  const authors = isG ? book.volumeInfo.authors : book.authors;
  const categories = isG ? (book.volumeInfo.categories || []) : (book.categories || []);
  const description = isG ? (book.volumeInfo.description || 'Sem sinopse disponível.') : (book.description || 'Sem sinopse disponível.');
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
    <div className="fixed inset-0 z-50 bg-[#1C130A]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 border border-[#E6DCCF]">
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#F4ECE1] hover:bg-[#E6D7C3] text-[#6A5A50] hover:text-[#2D241E] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          <div className="w-28 sm:w-32 shrink-0 self-center sm:self-start">
            <img
              src={imgSrc}
              alt={title}
              onError={() => setImgSrc(getBookCoverFallback(title, authors?.[0]))}
              className="w-full aspect-2/3 object-cover rounded-xl shadow-md border border-[#E6DCCF]"
            />
            {previewLink && (
              <a
                href={previewLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 text-center text-[11px] font-medium py-1.5 px-2 bg-[#F4ECE1] hover:bg-[#E6D7C3] text-[#5F442A] rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Prévia</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {categories.slice(0, 2).map((c, i) => (
                  <CategoryBadge key={i} category={c} />
                ))}
              </div>
            )}

            <h2 className="font-sans font-bold text-base sm:text-lg text-[#2D241E] leading-snug">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D6E65] font-medium mt-0.5">
              {formatAuthors(authors)}
            </p>

            <div className="text-[11px] text-[#A89B91] mt-1 flex items-center gap-1.5">
              {pubDate && <span>{formatYear(pubDate)}</span>}
              {pubDate && pages && <span>•</span>}
              {pages && <span>{pages} páginas</span>}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1 bg-[#F8F5EE] p-1 rounded-lg border border-[#E6DCCF]">
              <button
                onClick={() => onStatusChange(book, 'lido')}
                className={`py-1 rounded-md text-[10px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  currentStatus === 'lido'
                    ? 'bg-[#422F1D] text-[#FAF6F0] font-semibold shadow-xs'
                    : 'text-[#6A5A50] hover:text-[#2D241E] hover:bg-[#EAE3D8]'
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                <span>Lido</span>
              </button>
              <button
                onClick={() => onStatusChange(book, 'lendo')}
                className={`py-1 rounded-md text-[10px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  currentStatus === 'lendo'
                    ? 'bg-[#C87A3D] text-white font-semibold shadow-xs'
                    : 'text-[#6A5A50] hover:text-[#2D241E] hover:bg-[#EAE3D8]'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Lendo</span>
              </button>
              <button
                onClick={() => onStatusChange(book, 'quero_ler')}
                className={`py-1 rounded-md text-[10px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  currentStatus === 'quero_ler'
                    ? 'bg-[#7F5E3B] text-white font-semibold shadow-xs'
                    : 'text-[#6A5A50] hover:text-[#2D241E] hover:bg-[#EAE3D8]'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                <span>Quero</span>
              </button>
            </div>

            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(book.id)}
                className={`mt-2 text-xs font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  isFav
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-[#F8F5EE] text-[#6A5A50] border-[#E6DCCF] hover:bg-[#F4ECE1] hover:text-[#2D241E]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isFav ? 'Favoritado' : 'Favoritar'}</span>
              </button>
            )}
          </div>
        </div>

        {/* SINOPSE */}
        <div className="my-4 pt-3 border-t border-[#F2ECE4]">
          <h4 className="font-sans font-semibold text-[#2D241E] text-xs uppercase tracking-wider mb-1.5">
            Sinopse
          </h4>
          <div
            className="text-xs sm:text-sm text-[#5F442A] max-h-32 overflow-y-auto leading-relaxed pr-1"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>

        {/* REVIEW SECTION */}
        <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E6DCCF]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#2D241E]">Avaliação & Anotações</span>
            {savedAlert && <span className="text-[11px] text-emerald-600 font-semibold">Salvo com sucesso!</span>}
          </div>

          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s === rating ? 0 : s)}
                className="cursor-pointer p-0.5 hover:scale-110 transition-transform"
              >
                <Star className={`w-4 h-4 ${s <= rating ? 'text-amber-500 fill-amber-500' : 'text-[#D3BC9E]'}`} />
              </button>
            ))}
          </div>

          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escreva suas anotações pessoais sobre este livro..."
            className="w-full text-xs p-2.5 rounded-lg border border-[#E6DCCF] bg-white text-[#2D241E] placeholder-[#A89B91] focus:outline-none focus:ring-1 focus:ring-[#422F1D] focus:border-[#422F1D] resize-none"
          />

          <div className="flex justify-end mt-2">
            <button
              onClick={() => {
                onSaveReview?.(book.id, rating, notes);
                setSavedAlert(true);
                setTimeout(() => setSavedAlert(false), 2000);
              }}
              className="px-3 py-1.5 bg-[#422F1D] hover:bg-[#2C1F13] text-[#FAF6F0] text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Salvar Anotações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BookDetailModal: React.FC<Props> = (props) => {
  if (!props.book) return null;
  return <BookDetailModalInner {...props} book={props.book} />;
};


