import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyCpN2-6gjHqykIYU0XjC-qRKmhmmWpqPWs",
  authDomain: "juliet-s-make-up-galore.firebaseapp.com",
  projectId: "juliet-s-make-up-galore",
  storageBucket: "juliet-s-make-up-galore.firebasestorage.app",
  messagingSenderId: "437369466907",
  appId: "1:437369466907:web:50c25217c7256dd544c8be",
  measurementId: "G-GRKR1PKTKV",
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);

export const storage = getStorage(app);

// Firebase App Check
export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(
    "PASTE_YOUR_RECAPTCHA_ENTERPRISE_SITE_KEY_HERE"
  ),
  isTokenAutoRefreshEnabled: true,
});