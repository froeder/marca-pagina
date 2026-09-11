import React, { useState } from 'react';
import { Bookmark, Sparkles, Search, BookOpen, BarChart3, Settings, Menu, X, LogIn, LogOut, ChevronDown } from 'lucide-react';
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
    { id: 'discover', label: 'Descoberta', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'search', label: 'Buscar', icon: <Search className="w-4 h-4" /> },
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
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div onClick={() => handleSelect('discover')} className="flex items-center space-x-2.5 cursor-pointer group select-none">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
              <Bookmark className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-base sm:text-lg text-zinc-900 tracking-tight">
                Marca-Página
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-wider text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                AI Discovery
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-zinc-900 text-white font-medium shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <span className={active ? 'text-zinc-200' : 'text-zinc-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.id === 'my-books' && readCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${active ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-600'}`}>
                      {readCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 transition-all cursor-pointer text-xs"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-[10px]">
                      {getInitials(user.displayName, user.email)}
                    </div>
                  )}
                  <span className="hidden sm:inline font-medium text-zinc-800 max-w-[100px] truncate">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Usuário'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-zinc-200/80 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-zinc-100">
                      <p className="font-semibold text-zinc-900 truncate">{user.displayName || 'Leitor'}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { handleSelect('settings'); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Configurações</span>
                    </button>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-all cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 cursor-pointer"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200/80 bg-white px-4 pt-2 pb-4 space-y-1 shadow-md">
          {user ? (
            <div className="px-3 py-2 mb-2 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                  {getInitials(user.displayName, user.email)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-900">{user.displayName || 'Leitor'}</p>
                  <p className="text-[10px] text-zinc-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="pb-2 mb-2 border-b border-zinc-100 flex gap-2">
              <button
                onClick={() => { openAuthModal('login'); setMobileOpen(false); }}
                className="flex-1 py-2 text-center text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
              >
                Entrar
              </button>
              <button
                onClick={() => { openAuthModal('register'); setMobileOpen(false); }}
                className="flex-1 py-2 text-center text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg cursor-pointer"
              >
                Criar Conta
              </button>
            </div>
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                currentTab === item.id ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-50'
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
