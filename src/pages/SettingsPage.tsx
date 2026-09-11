import React, { useState } from 'react';
import { getApiKey, setApiKey, exportLibraryJson, importLibraryJson, resetToDemoBooks } from '../services/storageService';
import { Key, Download, Upload, RotateCcw, Check, Sparkles, AlertTriangle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
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
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="font-serif font-bold text-3xl text-stone-900">Configurações</h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Gerenciamento da Google Books API, backups e dados locais
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/70 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-50 text-brand-700 rounded-xl">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-stone-900">Chave da Google Books API</h2>
            <p className="text-xs text-stone-500">
              Opcional para consultas moderadas. Uma chave própria remove limites de requisição por minuto.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveApiKey} className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Google Books API Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-500 bg-stone-50 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : null}
                <span>{savedSuccess ? 'Salvo!' : 'Salvar Chave'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/70 shadow-xs space-y-6">
        <div>
          <h2 className="font-serif font-bold text-lg text-stone-900">Backup & Sincronização Local</h2>
          <p className="text-xs text-stone-500 mt-1">
            Seus dados ficam 100% salvos no seu navegador (LocalStorage). Exporte um backup JSON quando quiser.
          </p>
        </div>

        {importStatus && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-medium">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleExport}
            className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 hover:border-brand-300 hover:bg-amber-50/50 transition-all text-left"
          >
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-stone-900">Exportar Backup JSON</div>
              <div className="text-[11px] text-stone-500">Baixar acervo e avaliações</div>
            </div>
            <Download className="w-5 h-5 text-brand-600 shrink-0 ml-2" />
          </button>

          <label className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 hover:border-brand-300 hover:bg-amber-50/50 transition-all cursor-pointer text-left">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-stone-900">Restaurar do Arquivo</div>
              <div className="text-[11px] text-stone-500">Importar arquivo JSON</div>
            </div>
            <Upload className="w-5 h-5 text-brand-600 shrink-0 ml-2" />
            <input
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Restaurar Demonstração
            </div>
            <div className="text-[11px] text-stone-500">
              Recarrega o acervo clássico da literatura brasileira para testar os padrões
            </div>
          </div>
          <button
            onClick={handleResetDemo}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar</span>
          </button>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-amber-100/50 border border-amber-200/80 text-stone-700 space-y-2">
        <div className="flex items-center gap-2 font-serif font-bold text-brand-900">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Sobre o Marca-Página</span>
        </div>
        <p className="text-xs leading-relaxed">
          Marca-Página é um gerenciador de leitura inteligente focado na descoberta de livros por padrões e preferências. Integrado diretamente à Google Books API com filtragem em Língua Portuguesa (<code className="bg-amber-200/60 px-1 py-0.5 rounded text-amber-950 font-mono text-[11px]">langRestrict=pt</code>).
        </p>
      </div>
    </div>
  );
};

