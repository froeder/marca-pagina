import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured, translateFirebaseError } from '../services/firebase';

export type AuthModalMode = 'login' | 'register' | 'forgot-password';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  authModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (error) => {
        console.error('Erro no listener de autenticação:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [configured]);

  const openAuthModal = (mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase não está configurado.');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      closeAuthModal();
    } catch (err: unknown) {
      console.error('Erro ao fazer login com e-mail:', err);
      const firebaseError = err as { code?: string; message?: string };
      throw new Error(translateFirebaseError(firebaseError.code || ''));
    }
  };

  const signupWithEmail = async (email: string, pass: string, displayName?: string) => {
    if (!auth) throw new Error('Firebase não está configurado.');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (displayName && displayName.trim()) {
        await updateProfile(userCredential.user, { displayName: displayName.trim() });
      }
      closeAuthModal();
    } catch (err: unknown) {
      console.error('Erro ao cadastrar usuário:', err);
      const firebaseError = err as { code?: string; message?: string };
      throw new Error(translateFirebaseError(firebaseError.code || ''));
    }
  };

  const loginWithGoogle = async () => {
    if (!auth || !googleProvider) throw new Error('Firebase não está configurado.');
    try {
      await signInWithPopup(auth, googleProvider);
      closeAuthModal();
    } catch (err: unknown) {
      console.error('Erro no login com Google:', err);
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        return; // Usuário apenas fechou a janela
      }
      throw new Error(translateFirebaseError(firebaseError.code || ''));
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase não está configurado.');
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      throw new Error(translateFirebaseError(firebaseError.code || ''));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: configured,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
