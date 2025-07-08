import { initializeApp, getApps, getApp, type FirebaseOptions, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase ONLY on the client side
const app: FirebaseApp | null = typeof window !== 'undefined' && firebaseConfig.apiKey
  ? !getApps().length ? initializeApp(firebaseConfig) : getApp()
  : null;

const auth: Auth = app ? getAuth(app) : ({} as Auth);
const firestore: Firestore = app ? getFirestore(app) : ({} as Firestore);
const storage: FirebaseStorage = app ? getStorage(app) : ({} as FirebaseStorage);

export { app, auth, firestore, storage };
