import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "sohbet-odas-zfrqc",
  appId: "1:966575380934:web:6a7e53fe6336859b2d7ac7",
  storageBucket: "sohbet-odas-zfrqc.firebasestorage.app",
  apiKey: "AIzaSyBf_fp93ufZ9Jwd9Tunwzr1HZy1JGG_D64",
  authDomain: "sohbet-odas-zfrqc.firebaseapp.com",
  messagingSenderId: "966575380934"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
