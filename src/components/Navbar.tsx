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
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E6DCCF] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div onClick={() => handleSelect('discover')} className="flex items-center space-x-2.5 cursor-pointer group select-none">
            <div className="w-8 h-8 rounded-lg bg-[#422F1D] text-[#FAF6F0] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
              <Bookmark className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-base sm:text-lg text-[#2D241E] tracking-tight">
                Marca-Página
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-wider text-[#7F5E3B] bg-[#F4ECE1] border border-[#E6D7C3] px-1.5 py-0.5 rounded">
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
                      ? 'bg-[#422F1D] text-[#FAF6F0] font-medium shadow-xs'
                      : 'text-[#6A5A50] hover:text-[#2D241E] hover:bg-[#F2ECE4]'
                  }`}
                >
                  <span className={active ? 'text-[#D3BC9E]' : 'text-[#8C7D73]'}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.id === 'my-books' && readCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${active ? 'bg-[#5F442A] text-[#FAF6F0]' : 'bg-[#EAE3D8] text-[#5F442A]'}`}>
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
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#E6DCCF] hover:border-[#D3BC9E] bg-white hover:bg-[#F8F5EE] transition-all cursor-pointer text-xs"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#422F1D] text-[#FAF6F0] flex items-center justify-center font-bold text-[10px]">
                      {getInitials(user.displayName, user.email)}
                    </div>
                  )}
                  <span className="hidden sm:inline font-medium text-[#2D241E] max-w-[100px] truncate">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Usuário'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#8C7D73]" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-[#E6DCCF] py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-[#F2ECE4]">
                      <p className="font-semibold text-[#2D241E] truncate">{user.displayName || 'Leitor'}</p>
                      <p className="text-[10px] text-[#7D6E65] truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { handleSelect('settings'); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-[#422F1D] hover:bg-[#F8F5EE] flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#8C7D73]" />
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#422F1D] hover:bg-[#2C1F13] text-[#FAF6F0] rounded-lg text-xs font-medium transition-all cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-[#D3BC9E]" />
                <span>Entrar</span>
              </button>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded-lg text-[#6A5A50] hover:bg-[#F2ECE4] cursor-pointer"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#E6DCCF] bg-white px-4 pt-2 pb-4 space-y-1 shadow-md">
          {user ? (
            <div className="px-3 py-2 mb-2 bg-[#FAF7F2] rounded-lg border border-[#E6DCCF] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#422F1D] text-[#FAF6F0] flex items-center justify-center font-bold text-xs">
                  {getInitials(user.displayName, user.email)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#2D241E]">{user.displayName || 'Leitor'}</p>
                  <p className="text-[10px] text-[#7D6E65]">{user.email}</p>
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
            <div className="pb-2 mb-2 border-b border-[#F2ECE4] flex gap-2">
              <button
                onClick={() => { openAuthModal('login'); setMobileOpen(false); }}
                className="flex-1 py-2 text-center text-xs font-medium text-[#422F1D] bg-[#F4ECE1] hover:bg-[#E6D7C3] rounded-lg cursor-pointer"
              >
                Entrar
              </button>
              <button
                onClick={() => { openAuthModal('register'); setMobileOpen(false); }}
                className="flex-1 py-2 text-center text-xs font-medium text-[#FAF6F0] bg-[#422F1D] hover:bg-[#2C1F13] rounded-lg cursor-pointer"
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
                currentTab === item.id ? 'bg-[#422F1D] text-[#FAF6F0]' : 'text-[#5F442A] hover:bg-[#FAF7F2]'
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
