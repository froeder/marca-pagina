import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import {
  X, Mail, Lock, User as UserIcon, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2, Loader2, ArrowLeft, KeyRound
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    setAuthModalMode,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    resetPassword,
    isConfigured,
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!isConfigured) {
      setError('O Firebase ainda não está configurado no .env');
      return;
    }
    if (authModalMode === 'forgot-password') {
      if (!email.trim()) return setError('Informe seu e-mail.');
      try {
        setSubmitting(true);
        await resetPassword(email);
        setSuccessMessage('E-mail de recuperação enviado!');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao enviar e-mail.');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    if (authModalMode === 'register') {
      if (!name.trim()) return setError('Informe seu nome.');
      if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.');
      if (password !== confirmPassword) return setError('As senhas não coincidem.');
      try {
        setSubmitting(true);
        await signupWithEmail(email, password, name);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    if (!email.trim() || !password) return setError('Preencha seu e-mail e sua senha.');
    try {
      setSubmitting(true);
      await loginWithEmail(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isConfigured) return setError('O Firebase não está configurado no .env.');
    setError(null);
    try {
      setSubmitting(true);
      await loginWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao autenticar com Google.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C130A]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E6DCCF] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* TOP BANNER */}
        <div className="bg-[#382A24] px-6 py-5 text-[#FAF6F0] flex items-center justify-between border-b border-[#2C1F13]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-[#D3BC9E]" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-base leading-tight">
                {authModalMode === 'login' && 'Entrar na Conta'}
                {authModalMode === 'register' && 'Criar Nova Conta'}
                {authModalMode === 'forgot-password' && 'Recuperar Senha'}
              </h2>
              <p className="text-xs text-[#D3BC9E] font-medium">Marca-Página Literário</p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#D3BC9E] hover:text-[#FAF6F0] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TAB CONTROLS */}
        {authModalMode !== 'forgot-password' && (
          <div className="flex border-b border-[#E6DCCF] bg-[#FAF7F2] p-1">
            <button
              type="button"
              onClick={() => { setAuthModalMode('login'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                authModalMode === 'login'
                  ? 'bg-white text-[#2D241E] shadow-xs border border-[#E6DCCF]'
                  : 'text-[#7D6E65] hover:text-[#2D241E]'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setAuthModalMode('register'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                authModalMode === 'register'
                  ? 'bg-white text-[#2D241E] shadow-xs border border-[#E6DCCF]'
                  : 'text-[#7D6E65] hover:text-[#2D241E]'
              }`}
            >
              Criar Conta
            </button>
          </div>
        )}

        <div className="p-6 space-y-4">
          {!isConfigured && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Credenciais do Firebase pendentes</span>
              </div>
              <p className="text-[11px] text-[#7D6E65]">
                Preencha as variáveis em <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">.env</code> para habilitar o login em nuvem.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {authModalMode !== 'forgot-password' && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2 bg-white hover:bg-[#FAF7F2] text-[#2D241E] font-medium text-xs sm:text-sm rounded-xl border border-[#E6DCCF] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continuar com Google</span>
              </button>
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#E6DCCF] w-full" />
                <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-[#8C7D73] font-semibold">ou com e-mail</span>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {authModalMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#2D241E] mb-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#8C7D73] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2 rounded-xl border border-[#E6DCCF] bg-white text-[#2D241E] focus:outline-none focus:ring-1 focus:ring-[#422F1D] focus:border-[#422F1D]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#2D241E] mb-1">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7D73] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2 rounded-xl border border-[#E6DCCF] bg-white text-[#2D241E] focus:outline-none focus:ring-1 focus:ring-[#422F1D] focus:border-[#422F1D]"
                />
              </div>
            </div>

            {authModalMode !== 'forgot-password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#2D241E]">Senha</label>
                  {authModalMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setAuthModalMode('forgot-password')}
                      className="text-[11px] text-[#7D6E65] hover:text-[#2D241E] font-medium cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C7D73] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs sm:text-sm pl-9 pr-10 py-2 rounded-xl border border-[#E6DCCF] bg-white text-[#2D241E] focus:outline-none focus:ring-1 focus:ring-[#422F1D] focus:border-[#422F1D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7D73] hover:text-[#2D241E] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {authModalMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#2D241E] mb-1">Confirmar Senha</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#8C7D73] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2 rounded-xl border border-[#E6DCCF] bg-white text-[#2D241E] focus:outline-none focus:ring-1 focus:ring-[#422F1D] focus:border-[#422F1D]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 bg-[#422F1D] hover:bg-[#2C1F13] text-[#FAF6F0] font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {authModalMode === 'login' && (submitting ? 'Entrando...' : 'Entrar na Conta')}
                {authModalMode === 'register' && (submitting ? 'Criando Conta...' : 'Cadastrar e Começar')}
                {authModalMode === 'forgot-password' && (submitting ? 'Enviando...' : 'Enviar Link de Redefinição')}
              </span>
            </button>
          </form>

          {authModalMode === 'forgot-password' && (
            <button
              type="button"
              onClick={() => { setAuthModalMode('login'); setError(null); setSuccessMessage(null); }}
              className="w-full flex items-center justify-center gap-2 text-xs font-medium text-[#7D6E65] hover:text-[#2D241E] py-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para o Login</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
