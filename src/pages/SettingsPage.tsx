import React, { useState } from 'react';
import { getApiKey, setApiKey, exportLibraryJson, importLibraryJson, resetToDemoBooks } from '../services/storageService';
import { useAuth } from '../context/useAuth';
import { APP_VERSION, BUILD_DATE } from '../version';
import {
  Key, Download, Upload, RotateCcw, Check, Sparkles, AlertTriangle,
  User, LogOut, Flame, CheckCircle2, AlertCircle, Tag, Calendar, ShieldCheck
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-sans font-bold text-2xl sm:text-3xl text-[#2D241E] tracking-tight">Configurações</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EDE4D8] text-[#5C4533] border border-[#DFCFC0]">
              <Tag className="w-3 h-3 text-[#7F5E3B]" />
              v{APP_VERSION}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7D6E65] mt-1">
            Gerenciamento de Conta Firebase, Google Books API, dados locais e versão do sistema
          </p>
        </div>
      </div>

      {/* FIREBASE & ACCOUNT CARD */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6DCCF] shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FDF0E2] text-[#9A551E] rounded-xl border border-[#F6DCBF]">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-sm sm:text-base text-[#2D241E]">Conta & Firebase</h2>
              <p className="text-xs text-[#7D6E65]">Autenticação e sincronização de usuários</p>
            </div>
          </div>
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F0F4EC] border border-[#DCE5D3] text-[#4B6B38] text-xs font-semibold rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FAF1DF] border border-[#EEDDBF] text-[#87581B] text-xs font-semibold rounded-full">
              <AlertCircle className="w-3.5 h-3.5" /> .env Pendente
            </span>
          )}
        </div>

        {user ? (
          <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#E6DCCF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-11 h-11 rounded-full border border-[#D3BC9E]" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#422F1D] text-[#FAF6F0] flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="font-bold text-sm text-[#2D241E]">{user.displayName || 'Leitor'}</p>
                <p className="text-xs text-[#7D6E65]">{user.email}</p>
                <p className="text-[10px] text-[#A89B91] mt-0.5">UID: {user.uid.slice(0, 12)}...</p>
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
          <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#E6DCCF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#2D241E]">Nenhum usuário conectado</p>
              <p className="text-[11px] text-[#7D6E65]">Faça login ou crie uma conta para sincronizar suas leituras.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 bg-[#422F1D] hover:bg-[#2C1F13] text-[#FAF6F0] rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Entrar
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-3.5 py-1.5 bg-white hover:bg-[#FAF7F2] border border-[#E6DCCF] text-[#2D241E] rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Criar Conta
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 bg-[#FAF7F2] rounded-xl p-4 border border-[#E6DCCF] text-xs text-[#2D241E]">
            <p className="font-semibold text-[#2D241E] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#7F5E3B]" />
              Como configurar as credenciais do Firebase:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#7D6E65]">
              <li>Crie um projeto no <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-[#422F1D] underline font-medium">console.firebase.google.com</a>.</li>
              <li>Ative o <strong>Authentication</strong> (provedores E-mail/Senha e Google).</li>
              <li>Crie um banco no <strong>Cloud Firestore</strong> e configure as regras de segurança (<code className="bg-white px-1 py-0.5 rounded font-mono text-[#2D241E] border border-[#E6DCCF]">firestore.rules</code>).</li>
              <li>Preencha as variáveis de ambiente no arquivo <code className="bg-white px-1 py-0.5 rounded font-mono text-[#2D241E] border border-[#E6DCCF]">.env</code>.</li>
            </ol>
            <div className="mt-2 text-[10px] font-mono bg-white p-2.5 rounded-lg border border-[#E6DCCF] text-[#5F442A] overflow-x-auto">
              VITE_FIREBASE_API_KEY=sua_api_key<br />
              VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com<br />
              VITE_FIREBASE_PROJECT_ID=seu-projeto-id
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6DCCF] shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#F4ECE1] text-[#7F5E3B] rounded-xl border border-[#E6D7C3]">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-sm sm:text-base text-[#2D241E]">Chave da Google Books API</h2>
            <p className="text-xs text-[#7D6E65]">
              Opcional para consultas moderadas. Uma chave própria remove limites de requisição por minuto.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveApiKey} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-[#2D241E] mb-1">
              Google Books API Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-[#E6DCCF] focus:outline-none focus:border-[#422F1D] bg-[#FAF7F2] font-mono text-[#2D241E]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-[#422F1D] hover:bg-[#2C1F13] text-[#FAF6F0] text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                <span>{savedSuccess ? 'Salvo!' : 'Salvar Chave'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6DCCF] shadow-2xs space-y-5">
        <div>
          <h2 className="font-sans font-bold text-sm sm:text-base text-[#2D241E]">Backup & Sincronização Local</h2>
          <p className="text-xs text-[#7D6E65] mt-0.5">
            Seus dados ficam 100% salvos no seu navegador (LocalStorage). Exporte um backup JSON quando quiser.
          </p>
        </div>

        {importStatus && (
          <div className="p-3 bg-[#FAF7F2] border border-[#E6DCCF] text-[#2D241E] rounded-lg text-xs font-medium">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-between p-3.5 rounded-xl border border-[#E6DCCF] hover:border-[#D3BC9E] hover:bg-[#FAF7F2] transition-all text-left cursor-pointer"
          >
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-[#2D241E]">Exportar Backup JSON</div>
              <div className="text-[11px] text-[#7D6E65]">Baixar acervo e avaliações</div>
            </div>
            <Download className="w-4 h-4 text-[#7F5E3B] shrink-0 ml-2" />
          </button>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E6DCCF] hover:border-[#D3BC9E] hover:bg-[#FAF7F2] transition-all cursor-pointer text-left">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-[#2D241E]">Restaurar do Arquivo</div>
              <div className="text-[11px] text-[#7D6E65]">Importar arquivo JSON</div>
            </div>
            <Upload className="w-4 h-4 text-[#7F5E3B] shrink-0 ml-2" />
            <input
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-3.5 border-t border-[#F2ECE4] flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Restaurar Demonstração
            </div>
            <div className="text-[11px] text-[#7D6E65]">
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

      <div className="p-5 rounded-2xl bg-[#F4ECE1]/70 border border-[#E6DCCF] text-[#2D241E] space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-sans font-semibold text-[#2D241E] text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#7F5E3B]" />
            <span>Sobre o Marca-Página</span>
          </div>
          <p className="text-xs leading-relaxed text-[#7D6E65]">
            Marca-Página é um gerenciador de leitura inteligente focado na descoberta de livros por padrões e preferências. Integrado diretamente à Google Books API com filtragem em Língua Portuguesa (<code className="bg-[#E6D7C3]/60 px-1 py-0.5 rounded text-[#2D241E] font-mono text-[11px]">langRestrict=pt</code>).
          </p>
        </div>

        <div className="pt-3 border-t border-[#E6DCCF]/60 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-[#5C4533]">
          <div className="bg-white/80 border border-[#E6DCCF] rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-1.5 bg-[#EDE4D8] text-[#7F5E3B] rounded-lg">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-[#9C8C80]">Versão do App</div>
              <div className="font-bold text-[#2D241E] text-xs">v{APP_VERSION}</div>
            </div>
          </div>

          <div className="bg-white/80 border border-[#E6DCCF] rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-1.5 bg-[#EDE4D8] text-[#7F5E3B] rounded-lg">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-[#9C8C80]">Último Build</div>
              <div className="font-medium text-[#2D241E] text-xs">{BUILD_DATE}</div>
            </div>
          </div>

          <div className="bg-white/80 border border-[#E6DCCF] rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-1.5 bg-[#EDE4D8] text-[#7F5E3B] rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-[#9C8C80]">Ambiente</div>
              <div className="font-medium text-[#2D241E] text-xs capitalize">{import.meta.env.MODE === 'production' ? 'Produção' : 'Desenvolvimento'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

