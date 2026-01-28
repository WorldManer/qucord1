import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAl_xONt86Dj2DrGvlfY_vWoWRq-SfzAZI",
  authDomain: "qucord-f77c5.firebaseapp.com",
  projectId: "qucord-f77c5",
  storageBucket: "qucord-f77c5.firebasestorage.app",
  messagingSenderId: "88919830687",
  appId: "1:88919830687:web:5ad9c12049ed24adb072aa",
  measurementId: "G-RJVPL8ZESR"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
