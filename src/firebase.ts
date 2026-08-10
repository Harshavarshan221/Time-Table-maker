import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const getEnvVar = (val?: string) => {
  if (!val) return undefined;
  return val.replace(/["']/g, '').trim();
};

const firebaseConfig = {
  apiKey: getEnvVar(import.meta.env.VITE_FIREBASE_API_KEY) || "",
  authDomain: getEnvVar(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || "my-tt-f0b15.firebaseapp.com",
  projectId: getEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID) || "my-tt-f0b15",
  storageBucket: getEnvVar(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || "my-tt-f0b15.appspot.com",
  messagingSenderId: getEnvVar(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || "",
  appId: getEnvVar(import.meta.env.VITE_FIREBASE_APP_ID) || "",
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
