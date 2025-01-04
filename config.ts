import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// import dotenv from "dotenv";
// dotenv.config();

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "social-ai-c516e.firebaseapp.com",
  projectId: "social-ai-c516e",
  storageBucket: "social-ai-c516e.firebasestorage.app",
  messagingSenderId: "1052191046697",
  appId: "1:1052191046697:web:91560a3bd5926cf2677038",
  measurementId: "G-5BR25B9CJX",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

console.log(import.meta.env.FIREBASE_DATABASE_URL)

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getDatabase(firebaseApp);
