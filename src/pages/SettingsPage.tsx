import React, { useState } from 'react';
import { getApiKey, setApiKey, exportLibraryJson, importLibraryJson, resetToDemoBooks } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import {
  Key, Download, Upload, RotateCcw, Check, Sparkles, AlertTriangle,
  User, LogOut, Flame, CheckCircle2, AlertCircle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, isConfigured, openAuthModal, logout } = useAuth();
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey() || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(apiKeyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExport = () => {
    const json = exportLibraryJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marca-pagina-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importLibraryJson(content);
      if (success) {
        setImportStatus('Biblioteca restaurada com sucesso!');
      } else {
        setImportStatus('Falha ao importar: arquivo JSON inválido.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (window.confirm('Deseja recarregar o acervo padrão de demonstração?')) {
      resetToDemoBooks();
      setImportStatus('Dados de demonstração recarregados com sucesso!');
      setTimeout(() => setImportStatus(null), 3000);
    }
  };
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="font-sans font-bold text-2xl sm:text-3xl text-zinc-900 tracking-tight">Configurações</h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Gerenciamento de Conta Firebase, Google Books API e dados locais
        </p>
      </div>

      {/* FIREBASE & ACCOUNT CARD */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-sm sm:text-base text-zinc-900">Conta & Firebase</h2>
              <p className="text-xs text-zinc-500">Autenticação e sincronização de usuários</p>
            </div>
          </div>
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold rounded-full">
              <AlertCircle className="w-3.5 h-3.5" /> .env Pendente
            </span>
          )}
        </div>

        {user ? (
          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-11 h-11 rounded-full border border-zinc-300" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="font-bold text-sm text-zinc-900">{user.displayName || 'Leitor'}</p>
                <p className="text-xs text-zinc-600">{user.email}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">UID: {user.uid.slice(0, 12)}...</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta</span>
            </button>
          </div>
        ) : isConfigured ? (
          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-zinc-900">Nenhum usuário conectado</p>
              <p className="text-[11px] text-zinc-500">Faça login ou crie uma conta para sincronizar suas leituras.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Entrar
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Criar Conta
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 bg-zinc-50 rounded-xl p-4 border border-zinc-200 text-xs text-zinc-700">
            <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-zinc-500" />
              Como configurar as credenciais do Firebase:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-600">
              <li>Crie um projeto no <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-zinc-900 underline font-medium">console.firebase.google.com</a>.</li>
              <li>Ative o <strong>Authentication</strong> (provedores E-mail/Senha e Google).</li>
              <li>Preencha as variáveis de ambiente no arquivo <code className="bg-white px-1 py-0.5 rounded font-mono text-zinc-900 border border-zinc-200">.env</code>.</li>
            </ol>
            <div className="mt-2 text-[10px] font-mono bg-white p-2.5 rounded-lg border border-zinc-200 text-zinc-600 overflow-x-auto">
              VITE_FIREBASE_API_KEY=sua_api_key<br />
              VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com<br />
              VITE_FIREBASE_PROJECT_ID=seu-projeto-id
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 text-zinc-700 rounded-xl border border-zinc-200">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-sm sm:text-base text-zinc-900">Chave da Google Books API</h2>
            <p className="text-xs text-zinc-500">
              Opcional para consultas moderadas. Uma chave própria remove limites de requisição por minuto.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveApiKey} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Google Books API Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-900 bg-zinc-50 font-mono"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                <span>{savedSuccess ? 'Salvo!' : 'Salvar Chave'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200 shadow-2xs space-y-5">
        <div>
          <h2 className="font-sans font-bold text-sm sm:text-base text-zinc-900">Backup & Sincronização Local</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Seus dados ficam 100% salvos no seu navegador (LocalStorage). Exporte um backup JSON quando quiser.
          </p>
        </div>

        {importStatus && (
          <div className="p-3 bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-medium">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-left cursor-pointer"
          >
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-zinc-900">Exportar Backup JSON</div>
              <div className="text-[11px] text-zinc-500">Baixar acervo e avaliações</div>
            </div>
            <Download className="w-4 h-4 text-zinc-600 shrink-0 ml-2" />
          </button>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer text-left">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-zinc-900">Restaurar do Arquivo</div>
              <div className="text-[11px] text-zinc-500">Importar arquivo JSON</div>
            </div>
            <Upload className="w-4 h-4 text-zinc-600 shrink-0 ml-2" />
            <input
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-3.5 border-t border-zinc-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Restaurar Demonstração
            </div>
            <div className="text-[11px] text-zinc-500">
              Recarrega o acervo clássico da literatura brasileira para testar os padrões
            </div>
          </div>
          <button
            onClick={handleResetDemo}
            className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200/60 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar</span>
          </button>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-zinc-100/70 border border-zinc-200 text-zinc-700 space-y-1.5">
        <div className="flex items-center gap-2 font-sans font-semibold text-zinc-900 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
          <span>Sobre o Marca-Página</span>
        </div>
        <p className="text-xs leading-relaxed text-zinc-600">
          Marca-Página é um gerenciador de leitura inteligente focado na descoberta de livros por padrões e preferências. Integrado diretamente à Google Books API com filtragem em Língua Portuguesa (<code className="bg-zinc-200/70 px-1 py-0.5 rounded text-zinc-900 font-mono text-[11px]">langRestrict=pt</code>).
        </p>
      </div>
    </div>
  );
};

