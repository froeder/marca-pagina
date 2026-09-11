import React, { useState, useEffect, useMemo } from 'react';
import type { SavedBook, ReadingStatus, GoogleBookItem } from '../types/book';
import {
  getSavedBooks, updateBookStatus, removeBook, toggleFavorite, updateBookReview,
  getReadingLists, createReadingList, renameReadingList, deleteReadingList,
  toggleBookList,
} from '../services/storageService';
import { BookCard } from '../components/BookCard';
import { BookDetailModal } from '../components/BookDetailModal';
import { BookOpen, Search, CheckCircle, Clock, Bookmark, Heart, Sparkles, Filter, Plus, Pencil, Trash2, Layers, FileText, X } from 'lucide-react';

type FilterTab = 'todos' | 'lido' | 'lendo' | 'quero_ler' | 'favoritos';
export const MyBooksPage: React.FC<{ onNavigateToSearch: () => void; onNavigateToDiscover: () => void }> = ({
  onNavigateToSearch,
  onNavigateToDiscover,
}) => {
  const [books, setBooks] = useState<SavedBook[]>(getSavedBooks);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('todos');
  const [activeList, setActiveList] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<GoogleBookItem | SavedBook | null>(null);
  const [lists, setLists] = useState<string[]>(getReadingLists);
  const [newListName, setNewListName] = useState('');
  const [editingList, setEditingList] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState('');
  const [showLists, setShowLists] = useState(false);

  const loadBooks = () => setBooks(getSavedBooks());
  const loadLists = () => setLists(getReadingLists());

  useEffect(() => {
    window.addEventListener('marca_pagina_books_updated', loadBooks);
    window.addEventListener('marca_pagina_lists_updated', loadLists);
    return () => {
      window.removeEventListener('marca_pagina_books_updated', loadBooks);
      window.removeEventListener('marca_pagina_lists_updated', loadLists);
    };
  }, []);

  const handleStatusChange = (book: GoogleBookItem | SavedBook, status: ReadingStatus) => {
    updateBookStatus(book.id, status);
    loadBooks();
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    loadBooks();
  };

  const handleRemove = (id: string) => {
    removeBook(id);
    loadBooks();
  };

  const handleSaveReview = (id: string, rating?: number, notes?: string) => {
    updateBookReview(id, rating, notes);
    loadBooks();
  };

  const handleAddList = () => {
    if (createReadingList(newListName)) {
      setNewListName('');
      loadLists();
    }
  };

  const handleRenameList = (oldName: string) => {
    if (renameReadingList(oldName, renamingValue)) {
      setEditingList(null);
      setRenamingValue('');
      loadLists();
      loadBooks();
    }
  };

  const handleDeleteList = (name: string) => {
    deleteReadingList(name);
    if (activeList === name) setActiveList(null);
    loadLists();
    loadBooks();
  };

  const handleToggleList = (bookId: string, listName: string) => {
    toggleBookList(bookId, listName);
    loadBooks();
  };

  const counts = useMemo(() => {
    return {
      todos: books.length,
      lido: books.filter((b) => b.status === 'lido').length,
      lendo: books.filter((b) => b.status === 'lendo').length,
      quero_ler: books.filter((b) => b.status === 'quero_ler').length,
      favoritos: books.filter((b) => b.favorite).length,
    };
  }, [books]);

  const pagesRead = useMemo(
    () => books.filter((b) => b.status === 'lido').reduce((acc, b) => acc + (b.pageCount || 0), 0),
    [books]
  );
  const pagesInProgress = useMemo(
    () => books.filter((b) => b.status === 'lendo').reduce((acc, b) => acc + (b.pageCount || 0), 0),
    [books]
  );

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      if (activeFilter === 'lido' && book.status !== 'lido') return false;
      if (activeFilter === 'lendo' && book.status !== 'lendo') return false;
      if (activeFilter === 'quero_ler' && book.status !== 'quero_ler') return false;
      if (activeFilter === 'favoritos' && !book.favorite) return false;
      if (activeList && !(book.lists || []).includes(activeList)) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = book.title.toLowerCase().includes(q);
        const matchAuthor = book.authors.some((a) => a.toLowerCase().includes(q));
        const matchCat = book.categories.some((c) => c.toLowerCase().includes(q));
        return matchTitle || matchAuthor || matchCat;
      }
      return true;
    });
  }, [books, activeFilter, activeList, searchTerm]);

  const listCounts = useMemo(() => {
    const res: Record<string, { count: number; pages: number; read: number }> = {};
    for (const name of lists) {
      const inList = books.filter((b) => (b.lists || []).includes(name));
      res[name] = {
        count: inList.length,
        pages: inList.filter((b) => b.status === 'lido').reduce((acc, b) => acc + (b.pageCount || 0), 0),
        read: inList.filter((b) => b.status === 'lido').length,
      };
    }
    return res;
  }, [books, lists]);

  const isViewingList = activeList !== null;
  const listPages = useMemo(
    () => (activeList ? (listCounts[activeList]?.pages || 0) : 0),
    [activeList, listCounts]
  );

  const tabs: Array<{ id: FilterTab; label: string; count: number; icon: React.ReactNode }> = [
    { id: 'todos', label: 'Todos', count: counts.todos, icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'lido', label: 'Lidos', count: counts.lido, icon: <CheckCircle className="w-3.5 h-3.5 text-[#422F1D]" /> },
    { id: 'lendo', label: 'Lendo', count: counts.lendo, icon: <Clock className="w-3.5 h-3.5 text-[#C87A3D]" /> },
    { id: 'quero_ler', label: 'Quero Ler', count: counts.quero_ler, icon: <Bookmark className="w-3.5 h-3.5 text-[#7F5E3B]" /> },
    { id: 'favoritos', label: 'Favoritos', count: counts.favoritos, icon: <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-bold text-2xl sm:text-3xl text-[#2D241E] tracking-tight">Minha Estante</h1>
          <p className="text-xs sm:text-sm text-[#7D6E65] mt-1">
            Gerencie suas leituras e acompanhe as obras que treinam o motor de descoberta
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLists(!showLists)}
            aria-expanded={showLists}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              showLists ? 'bg-[#422F1D] text-[#FAF6F0] border-[#422F1D]' : 'bg-[#F4ECE1] hover:bg-[#E6D7C3] text-[#5F442A] border-[#E6DCCF]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Listas {lists.length > 0 ? `(${lists.length})` : ''}</span>
          </button>
          <button
            onClick={onNavigateToDiscover}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4ECE1] hover:bg-[#E6D7C3] text-[#5F442A] text-xs font-medium transition-colors cursor-pointer border border-[#E6DCCF]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7F5E3B]" />
            <span>Descoberta</span>
          </button>
          <button
            onClick={onNavigateToSearch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#422F1D] hover:bg-[#2C1F13] text-[#FAF6F0] text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#D3BC9E]" />
            <span>Adicionar Livros</span>
          </button>
        </div>
      </div>

      {/* RESUMO DE LEITURA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#382A24] text-[#FAF6F0] rounded-2xl p-5 border border-[#2C1F13] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4D3B33] flex items-center justify-center text-[#D3BC9E] border border-[#5F483E]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D3BC9E]">Páginas lidas</div>
              <div className="text-2xl font-bold text-[#FAF6F0] mt-0.5">{pagesRead.toLocaleString('pt-BR')}</div>
            </div>
          </div>
          <p className="text-[11px] text-[#D3BC9E] mt-2.5">
            {isViewingList
              ? `Você vê a lista "${activeList}" — ${listPages.toLocaleString('pt-BR')} pág. lidas`
              : `${pagesInProgress.toLocaleString('pt-BR')} pág. em leituras atuais`}
          </p>
        </div>

        <div className="col-span-1 sm:col-span-2 bg-white rounded-2xl p-5 border border-[#E6DCCF] shadow-2xs">
          <div className="text-[11px] text-[#7D6E65] font-medium mb-2">Páginas lidas por lista</div>
          {lists.length === 0 ? (
            <p className="text-xs text-[#A89B91]">Crie listas para acompanhar as páginas por tema ou projeto.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {lists.map((name) => (
                <button
                  key={name}
                  onClick={() => setActiveList(activeList === name ? null : name)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    activeList === name
                      ? 'bg-[#422F1D] text-[#FAF6F0] border-[#422F1D]'
                      : 'bg-[#F8F5EE] text-[#5F442A] border-[#E6DCCF] hover:bg-[#F4ECE1]'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  {name}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${activeList === name ? 'bg-[#5F442A] text-[#FAF6F0]' : 'bg-[#F4ECE1] text-[#5F442A]'}`}>
                    {listCounts[name]?.pages.toLocaleString('pt-BR') || '0'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GERENCIADOR DE LISTAS */}
      {showLists && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6DCCF] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#5F442A]" />
            <h2 className="font-sans font-bold text-sm text-[#2D241E]">Minhas Listas</h2>
            <span className="text-[11px] text-[#A89B91]">Um livro pode estar em várias listas</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddList(); }}
              placeholder="Nova lista (ex: TBR 2026, Didáticos...)"
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#E6DCCF] bg-[#FAF7F2]/50 focus:outline-none focus:ring-1 focus:ring-[#422F1D] focus:border-[#422F1D] text-[#2D241E]"
            />
            <button
              onClick={handleAddList}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#422F1D] hover:bg-[#2C1F13] text-[#FAF6F0] text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Criar
            </button>
          </div>

          {lists.length > 0 && (
            <ul className="space-y-1.5">
              {lists.map((name) => (
                <li key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F8F5EE] border border-[#E6DCCF]">
                  {editingList === name ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={renamingValue}
                        onChange={(e) => setRenamingValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRenameList(name); }}
                        className="flex-1 text-xs px-2 py-1 rounded border border-[#E6DCCF] bg-white text-[#2D241E] focus:outline-none focus:border-[#422F1D]"
                      />
                      <button onClick={() => handleRenameList(name)} className="text-xs font-medium text-[#422F1D] cursor-pointer px-2 py-1 hover:bg-[#F4ECE1] rounded">OK</button>
                      <button onClick={() => { setEditingList(null); setRenamingValue(''); }} className="text-xs text-[#A89B91] cursor-pointer px-2 py-1 hover:bg-[#F4ECE1] rounded"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setActiveList(activeList === name ? null : name)}
                        className={`flex items-center gap-2 flex-1 text-left cursor-pointer ${activeList === name ? 'text-[#422F1D] font-semibold' : 'text-[#2D241E]'}`}
                      >
                        <Layers className="w-3.5 h-3.5 text-[#7F5E3B]" />
                        <span className="text-sm">{name}</span>
                      </button>
                      <span className="text-[11px] text-[#7D6E65]">
                        {listCounts[name]?.count || 0} livros • {listCounts[name]?.read || 0} lidos • {listCounts[name]?.pages.toLocaleString('pt-BR') || '0'} pág.
                      </span>
                      <button
                        onClick={() => { setEditingList(name); setRenamingValue(name); }}
                        aria-label={`Renomear ${name}`}
                        className="p-1.5 rounded-lg text-[#6A5A50] hover:text-[#2D241E] hover:bg-[#F4ECE1] cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteList(name)}
                        aria-label={`Excluir ${name}`}
                        className="p-1.5 rounded-lg text-[#A89B91] hover:text-rose-600 hover:bg-[#FBE9E7] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-xl border border-[#E6DCCF] shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveFilter(t.id); setActiveList(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === t.id
                  ? 'bg-[#422F1D] text-[#FAF6F0] shadow-xs'
                  : 'text-[#6A5A50] hover:bg-[#F8F5EE] hover:text-[#2D241E]'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${activeFilter === t.id ? 'bg-[#5F442A] text-[#FAF6F0]' : 'bg-[#F4ECE1] text-[#5F442A]'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[#8C7D73] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por título ou autor..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E6DCCF] focus:outline-none focus:ring-1 focus:ring-[#422F1D] focus:border-[#422F1D] bg-[#FAF7F2]/50 text-[#2D241E]"
          />
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-xl border border-[#E6DCCF]">
          <Filter className="w-8 h-8 text-[#D3BC9E] mx-auto mb-2.5" />
          <p className="font-sans font-semibold text-[#2D241E] text-sm">
            {isViewingList ? `Nenhum livro na lista "${activeList}"` : 'Nenhum livro nesta categoria'}
          </p>
          <p className="text-xs text-[#7D6E65] mt-0.5">
            {isViewingList
              ? 'Sirva no card de um livro e adicione-o a esta lista.'
              : 'Busque novos títulos para adicionar à sua estante.'}
          </p>
          <button
            onClick={onNavigateToSearch}
            className="mt-3.5 px-3.5 py-1.5 rounded-lg bg-[#422F1D] text-[#FAF6F0] text-xs font-medium hover:bg-[#2C1F13] cursor-pointer transition-colors"
          >
            Buscar Livros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isSaved={true}
              savedData={book}
              lists={lists}
              onToggleList={handleToggleList}
              onStatusChange={handleStatusChange}
              onToggleFavorite={handleToggleFavorite}
              onRemove={handleRemove}
              onOpenDetails={(b) => setSelectedBook(b)}
            />
          ))}
        </div>
      )}

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          savedData={books.find((b) => b.id === selectedBook.id)}
          onClose={() => setSelectedBook(null)}
          onStatusChange={handleStatusChange}
          onSaveReview={handleSaveReview}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};

