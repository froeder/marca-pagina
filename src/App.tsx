import { useState, useEffect } from 'react';
import { Navbar, type NavTab } from './components/Navbar';
import { DiscoverPage } from './pages/DiscoverPage';
import { SearchPage } from './pages/SearchPage';
import { MyBooksPage } from './pages/MyBooksPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthModal } from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { getReadBooks } from './services/storageService';
import { Bookmark, Sparkles } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('discover');
  const [readCount, setReadCount] = useState(getReadBooks().length);

  useEffect(() => {
    const updateCount = () => setReadCount(getReadBooks().length);
    window.addEventListener('marca_pagina_books_updated', updateCount);
    return () => window.removeEventListener('marca_pagina_books_updated', updateCount);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#2D241E] flex flex-col selection:bg-[#422F1D] selection:text-[#FAF6F0] font-sans antialiased">
      <Navbar currentTab={activeTab} onSelectTab={setActiveTab} readCount={readCount} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'discover' && (
          <DiscoverPage
            onNavigateToSearch={() => setActiveTab('search')}
            onNavigateToMyBooks={() => setActiveTab('my-books')}
          />
        )}

        {activeTab === 'search' && <SearchPage />}

        {activeTab === 'my-books' && (
          <MyBooksPage
            onNavigateToSearch={() => setActiveTab('search')}
            onNavigateToDiscover={() => setActiveTab('discover')}
          />
        )}

        {activeTab === 'stats' && (
          <StatsPage onNavigateToDiscover={() => setActiveTab('discover')} />
        )}

        {activeTab === 'settings' && <SettingsPage />}
      </main>

      <footer className="mt-auto border-t border-[#E6DCCF] bg-white/70 backdrop-blur-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7D6E65]">
          <div className="flex items-center space-x-2 font-medium text-[#2D241E]">
            <div className="w-5 h-5 rounded-md bg-[#422F1D] flex items-center justify-center text-[#FAF6F0]">
              <Bookmark className="w-3 h-3" />
            </div>
            <span className="tracking-tight font-semibold">Marca-Página</span>
          </div>

          <div className="flex items-center gap-1.5 text-center text-[#7D6E65]">
            <span>Descoberta literária inteligente alimentada por</span>
            <span className="font-semibold text-[#422F1D] inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#A05E35]" /> Google Books API
            </span>
          </div>

          <div className="text-[11px] text-[#A89B91]">
            Catálogo em Língua Portuguesa
          </div>
        </div>
      </footer>

      <AuthModal />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;



