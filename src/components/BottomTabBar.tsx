import React from 'react';
import { Sparkles, Search, BookOpen, BarChart3, Settings } from 'lucide-react';
import type { NavTab } from './Navbar';

interface BottomTabBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  readCount: number;
}

type TabIcon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ currentTab, onSelectTab, readCount }) => {
  const tabs: Array<{ id: NavTab; label: string; icon: TabIcon }> = [
    { id: 'discover', label: 'Descoberta', icon: Sparkles },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'my-books', label: 'Estante', icon: BookOpen },
    { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 50,
      }}
      className="bg-[#FAF7F2] border-t border-[#E6DCCF] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] select-none"
      aria-label="Navegação principal (Bottom Bar)"
    >
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const active = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                onSelectTab(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              className={`group flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 ${
                active ? 'text-[#422F1D]' : 'text-[#8C7D73] hover:text-[#422F1D]'
              }`}
            >
              <span className="relative flex items-center justify-center">
                <span
                  className={`flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${
                    active ? 'bg-[#EBDDCB] text-[#422F1D]' : 'bg-transparent text-[#8C7D73] group-hover:bg-[#F2ECE4]'
                  }`}
                >
                  <Icon
                    className="w-5 h-5 transition-transform group-hover:scale-110"
                    strokeWidth={active ? 2.4 : 1.8}
                  />
                </span>

                {tab.id === 'my-books' && readCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-[#A05E35] text-[#FAF6F0] text-[9px] font-bold flex items-center justify-center border-2 border-[#FAF7F2] shadow-xs">
                    {readCount > 99 ? '99+' : readCount}
                  </span>
                )}
              </span>

              <span
                className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
                  active ? 'font-bold text-[#422F1D]' : 'font-medium text-[#8C7D73]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Suporte a barra de gestos de celulares (iPhone / Android) */}
      <div className="h-[env(safe-area-inset-bottom,0px)] bg-[#FAF7F2]" />
    </nav>
  );
};

