import React, { useState } from 'react';
import { Bookmark, ChevronDown, Loader2, LogIn, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export type NavTab = 'discover' | 'search' | 'my-books' | 'stats' | 'settings';

interface NavbarProps {
  onSelectTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectTab }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, loading: authLoading, logout, openAuthModal } = useAuth();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
      setUserMenuOpen(false);
    }
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name && name.trim()) {
      return name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'U';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E6DCCF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div
            onClick={() => onSelectTab('discover')}
            className="flex items-center space-x-2.5 cursor-pointer group select-none"
          >
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

          <div className="flex items-center space-x-2">
            {authLoading ? (
              <div className="w-20 h-8 rounded-lg bg-[#E6DCCF]/40 animate-pulse" />
            ) : user ? (
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
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-[#E6DCCF] py-1 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-[#F2ECE4]">
                      <p className="font-semibold text-[#2D241E] truncate">{user.displayName || 'Leitor'}</p>
                      <p className="text-[10px] text-[#7D6E65] truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { onSelectTab('settings'); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-[#422F1D] hover:bg-[#F8F5EE] flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#8C7D73]" />
                      <span>Configurações</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full px-3 py-2 text-left font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isLoggingOut ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                      ) : (
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      <span>{isLoggingOut ? 'Saindo...' : 'Sair da Conta'}</span>
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
          </div>
        </div>
      </div>
    </header>
  );
};