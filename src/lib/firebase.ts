
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "sohbet-odas-zfrqc",
  appId: "1:966575380934:web:6a7e53fe6336859b2d7ac7",
  storageBucket: "sohbet-odas-zfrqc.firebasestorage.app",
  apiKey: "AIzaSyA-fOSZR_D_I5F4OS_TVT_HwEgkZI5GgrY",
  authDomain: "sohbet-odas-zfrqc.firebaseapp.com",
  messagingSenderId: "966575380934",
  databaseURL: "https://sohbet-odas-zfrqc-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export { app, auth, db, storage };
