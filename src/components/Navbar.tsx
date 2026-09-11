import React, { useState } from 'react';
import { Bookmark, Sparkles, Search, BookOpen, BarChart3, Settings, Menu, X, CheckCircle2, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'discover' | 'search' | 'my-books' | 'stats' | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  readCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, readCount }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, openAuthModal } = useAuth();

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'discover', label: 'Descoberta', icon: <Sparkles className="w-4 h-4 text-brand-500" /> },
    { id: 'search', label: 'Buscar Livros', icon: <Search className="w-4 h-4" /> },
    { id: 'my-books', label: 'Minha Estante', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'stats', label: 'Estatísticas', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name && name.trim()) {
      return name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'U';
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
              className="hidden sm:flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span><strong>{readCount}</strong> {readCount === 1 ? 'lido' : 'lidos'}</span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-stone-100 border border-amber-200 transition-colors cursor-pointer"
                  aria-label="Menu do Usuário"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover border border-amber-300" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                      {getInitials(user.displayName, user.email)}
                    </div>
                  )}
                  <span className="hidden lg:block text-xs font-semibold text-stone-700 max-w-[90px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900 truncate">{user.displayName || 'Leitor'}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleSelect('settings')}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-stone-400" />
                      <span>Configurações</span>
                    </button>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 cursor-pointer"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-amber-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {user ? (
            <div className="px-3.5 py-2.5 mb-2 bg-amber-50/80 rounded-xl border border-amber-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                  {getInitials(user.displayName, user.email)}
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">{user.displayName || 'Leitor'}</p>
                  <p className="text-[10px] text-stone-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 p-1 cursor-pointer"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="pb-2 border-b border-stone-100 flex gap-2">
              <button
                onClick={() => { openAuthModal('login'); setMobileOpen(false); }}
                className="flex-1 py-2 text-center text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
              >
                Entrar
              </button>
              <button
                onClick={() => { openAuthModal('register'); setMobileOpen(false); }}
                className="flex-1 py-2 text-center text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl cursor-pointer"
              >
                Criar Conta
              </button>
            </div>
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-base font-medium cursor-pointer ${
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
