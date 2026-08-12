import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCpN2-6gjHqykIYU0XjC-qRKmhmmWpqPWs",
  authDomain: "juliet-s-make-up-galore.firebaseapp.com",
  projectId: "juliet-s-make-up-galore",
  storageBucket: "juliet-s-make-up-galore.firebasestorage.app",
  messagingSenderId: "437369466907",
  appId: "1:437369466907:web:50c25217c7256dd544c8be",
  measurementId: "G-GRKR1PKTKV"
};

const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);