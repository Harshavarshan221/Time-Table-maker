import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const getEnvVar = (val?: string) => {
  if (!val) return undefined;
  return val.replace(/["']/g, '').trim();
};

const firebaseConfig = {
  apiKey: getEnvVar(import.meta.env.VITE_FIREBASE_API_KEY) || "AIzaSyDemoPlaceholderKeyForTimeTableApp",
  authDomain: getEnvVar(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || "time-table-maker.firebaseapp.com",
  projectId: getEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID) || "time-table-maker",
  storageBucket: getEnvVar(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || "time-table-maker.appspot.com",
  messagingSenderId: getEnvVar(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || "123456789012",
  appId: getEnvVar(import.meta.env.VITE_FIREBASE_APP_ID) || "1:123456789012:web:demo1234567890",
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch (e) {
    return getFirestore(app);
  }
})();
