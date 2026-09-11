import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

export const FIRESTORE_DATABASE_ID = import.meta.env.VITE_FIREBASE_DATABASE_ID || 'marca-paginas';

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.trim() !== '' &&
    !firebaseConfig.apiKey.includes('sua_api_key') &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId.trim() !== '' &&
    !firebaseConfig.projectId.includes('seu-projeto')
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    try {
      db = FIRESTORE_DATABASE_ID && FIRESTORE_DATABASE_ID !== '(default)'
        ? getFirestore(app, FIRESTORE_DATABASE_ID)
        : getFirestore(app);
    } catch (dbErr) {
      console.warn('Tentando fallback para Firestore default database:', dbErr);
      db = getFirestore(app);
    }
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.error('Erro ao inicializar Firebase / Firestore:', err);
  }
}

export { app, auth, db, googleProvider };

export function translateFirebaseError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido.';
    case 'auth/user-disabled':
      return 'Esta conta de usuário foi desativada.';
    case 'auth/user-not-found':
      return 'Nenhum usuário encontrado com este e-mail.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado em outra conta.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Escolha uma senha com pelo menos 6 caracteres.';
    case 'auth/popup-closed-by-user':
      return 'A janela de autenticação do Google foi fechada antes de concluir.';
    case 'auth/popup-blocked':
      return 'O navegador bloqueou o popup de login. Por favor, libere popups para este site.';
    case 'auth/cancelled-popup-request':
      return 'A solicitação de login foi cancelada.';
    case 'auth/operation-not-allowed':
      return 'O provedor Google não está ativado no Firebase Console (Authentication > Sign-in method).';
    case 'auth/unauthorized-domain':
      return 'Domínio não autorizado! Adicione o domínio da sua hospedagem (ex: vercel.app) no Firebase Console (Authentication > Settings > Authorized domains).';
    case 'auth/account-exists-with-different-credential':
      return 'Já existe uma conta com este e-mail usando outro método de login.';
    case 'auth/invalid-api-key':
      return 'Chave de API do Firebase inválida. Verifique as variáveis de ambiente de produção.';
    case 'auth/network-request-failed':
      return 'Falha de conexão. Verifique sua internet e tente novamente.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas sem sucesso. Aguarde alguns instantes e tente de novo.';
    case 'auth/requires-recent-login':
      return 'Esta ação requer que você faça login novamente.';
    default:
      return errorCode
        ? `Erro de autenticação (${errorCode}). Tente novamente.`
        : 'Ocorreu um erro ao processar a autenticação. Tente novamente.';
  }
}
