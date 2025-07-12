// src/components/firebase.ts

import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACMCPN5dVUj2O9kpq3kH_RtR_fl96pQaY",
  authDomain: "timelink-2c725.firebaseapp.com",
  projectId: "timelink-2c725",
  storageBucket: "timelink-2c725.firebasestorage.app",
  messagingSenderId: "716400087923",
  appId: "1:716400087923:web:6b436886fe1e692244ab06",
  measurementId: "G-C8KLDQSX67"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);       // ✅ Export auth
export const db = getFirestore(app);    // ✅ Export Firestore
const analytics = getAnalytics(app);
