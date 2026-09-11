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
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 flex flex-col selection:bg-zinc-900 selection:text-white font-sans antialiased">
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

      <footer className="mt-auto border-t border-zinc-200/80 bg-white/60 backdrop-blur-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center space-x-2 font-medium text-zinc-900">
            <div className="w-5 h-5 rounded-md bg-zinc-900 flex items-center justify-center text-white">
              <Bookmark className="w-3 h-3" />
            </div>
            <span className="tracking-tight font-semibold">Marca-Página</span>
          </div>

          <div className="flex items-center gap-1.5 text-center text-zinc-500">
            <span>Descoberta inteligente de livros alimentada por</span>
            <span className="font-semibold text-zinc-800 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-zinc-900" /> Google Books API
            </span>
          </div>

          <div className="text-[11px] text-zinc-400">
            Filtro de catálogo em Português
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



