import React from 'react';
import { Sparkles, Search, BookOpen, BarChart3, Settings } from 'lucide-react';
import type { NavTab } from './Navbar';

interface BottomTabBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  readCount: number;
}

type TabIcon = React.ComponentType<{ className?: string }>;

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ currentTab, onSelectTab, readCount }) => {
  const tabs: Array<{ id: NavTab; label: string; icon: TabIcon }> = [
    { id: 'discover', label: 'Descoberta', icon: Sparkles },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'my-books', label: 'Estante', icon: BookOpen },
    { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
    { id: 'settings', label: 'Config.', icon: Settings },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6DCCF] shadow-[0_-8px_24px_-12px_rgba(66,47,29,0.2)]"
      aria-label="Navegação principal"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-stretch justify-around h-16 sm:h-[68px]">
        {tabs.map((tab) => {
          const active = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              className="relative flex-1 max-w-[120px] flex flex-col items-center justify-center gap-1 cursor-pointer select-none"
            >
              <span
                className={`relative flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${
                  active ? 'bg-[#422F1D] shadow-xs' : 'bg-transparent'
                }`}
              >
                {tab.id === 'my-books' && readCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#A05E35] text-[#FAF6F0] text-[9px] font-bold flex items-center justify-center border-2 border-white">
                    {readCount > 99 ? '99+' : readCount}
                  </span>
                )}
                <Icon
                  className={`w-5 h-5 transition-colors ${active ? 'text-[#D3BC9E]' : 'text-[#8C7D73]'}`}
                />
              </span>
              <span
                className={`text-[10px] leading-none transition-colors ${
                  active ? 'text-[#2D241E] font-semibold' : 'text-[#8C7D73] font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)] bg-white" />
    </nav>
  );
};