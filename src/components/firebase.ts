// src/components/firebase.ts

import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
//Insert API KEYS
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);       // ✅ Export auth
export const db = getFirestore(app);    // ✅ Export Firestore
const analytics = getAnalytics(app);
