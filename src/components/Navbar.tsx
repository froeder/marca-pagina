import React, { useState } from 'react';
import { Bookmark, Sparkles, Search, BookOpen, BarChart3, Settings, Menu, X, CheckCircle2 } from 'lucide-react';

export type NavTab = 'discover' | 'search' | 'my-books' | 'stats' | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  readCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, readCount }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'discover', label: 'Descoberta por Padrões', icon: <Sparkles className="w-4 h-4 text-brand-500" /> },
    { id: 'search', label: 'Buscar Livros', icon: <Search className="w-4 h-4" /> },
    { id: 'my-books', label: 'Minha Estante', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'stats', label: 'Estatísticas', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/70 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div onClick={() => handleSelect('discover')} className="flex items-center space-x-3 cursor-pointer group select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Bookmark className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <span className="font-serif font-bold text-xl text-stone-900 tracking-tight flex items-center gap-1">
                Marca-Página
              </span>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-brand-600 -mt-1">
                Descoberta Literária
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active ? 'bg-amber-100/90 text-brand-900 font-semibold shadow-xs' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                  }`}
                >
                  <span className={active ? 'text-brand-600' : 'text-stone-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSelect('my-books')}
              className="hidden sm:flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span><strong>{readCount}</strong> {readCount === 1 ? 'lido' : 'lidos'}</span>
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-amber-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-base font-medium ${
                currentTab === item.id ? 'bg-amber-100 text-brand-900 font-semibold' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
