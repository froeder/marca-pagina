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
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 flex flex-col selection:bg-brand-200 selection:text-brand-900">
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

      <footer className="mt-auto border-t border-amber-200/60 bg-white/70 backdrop-blur-xs py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center space-x-2 font-serif font-bold text-stone-800">
            <div className="w-6 h-6 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <Bookmark className="w-3.5 h-3.5" />
            </div>
            <span>Marca-Página</span>
          </div>

          <div className="flex items-center gap-1 text-center">
            <span>Descoberta inteligente de livros alimentada por</span>
            <span className="font-semibold text-stone-700 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" /> Google Books API
            </span>
          </div>

          <div className="text-[11px] text-stone-400">
            Filtro de idioma nativo em Português
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


