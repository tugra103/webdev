
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence  } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDDDedXVLAJjLDdG_JWssnQKoN8Ks5R404",
  authDomain: "drr0-f7899.firebaseapp.com",
  projectId: "drr0-f7899",
  storageBucket: "drr0-f7899.firebasestorage.app",
  messagingSenderId: "338401368594",
  appId: "1:338401368594:web:56c7dd050cb52d6008d6cb"
};

// ✅ Singleton — HMR'da tekrar init etmez
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// ✅ Persistence'ı burada bir kez set et, AuthContext'te tekrar etme
setPersistence(auth, browserLocalPersistence);
