import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC678v_t-VStVBNKEfb04a8T1QBDU2U00Y",
  authDomain: "playfolio-248e5.firebaseapp.com",
  projectId: "playfolio-248e5",
  storageBucket: "playfolio-248e5.firebasestorage.app",
  messagingSenderId: "465674586128",
  appId: "1:465674586128:web:7b2afbc5e6cab0f1576295"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
