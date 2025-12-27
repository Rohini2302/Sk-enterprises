import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBzOm4BCWApqHAzURx6O2jqkyO380APpMw",
  authDomain: "sk-enterprises-acc01.firebaseapp.com",
  databaseURL: "https://sk-enterprises-acc01-default-rtdb.firebaseio.com",
  projectId: "sk-enterprises-acc01",
  storageBucket: "sk-enterprises-acc01.firebasestorage.app",
  messagingSenderId: "135881782932",
  appId: "1:135881782932:web:1e1aee91d73f09892f6681",
  measurementId: "G-C9E8LC0YVC"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app); // Realtime Database for auth
export const db_firestore = getFirestore(app); // Firestore for other services
export const auth = getAuth(app);
