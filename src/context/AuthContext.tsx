import React, { useEffect, useState } from 'react';
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
import { initFirestoreSync, stopFirestoreSync } from '../services/storageService';
import { AuthContext, type AuthModalMode } from './useAuth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const configured = isFirebaseConfigured();
  const [loading, setLoading] = useState(() => !(configured && auth));
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');

  useEffect(() => {
    if (!configured || !auth) return;

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        if (currentUser) {
          initFirestoreSync(currentUser.uid);
        } else {
          stopFirestoreSync();
        }
      },
      (error) => {
        console.error('Erro no listener de autenticação:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      stopFirestoreSync();
    };
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
      throw new Error(translateFirebaseError(firebaseError.code || ''), { cause: err });
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
      throw new Error(translateFirebaseError(firebaseError.code || ''), { cause: err });
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
      throw new Error(translateFirebaseError(firebaseError.code || ''), { cause: err });
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
      throw new Error(translateFirebaseError(firebaseError.code || ''), { cause: err });
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
