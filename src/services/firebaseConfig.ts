import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    projectId: "digitalmenu-db",
    appId: "1:991749881933:web:425665a8c1be2cdc0a5c04",
    storageBucket: "digitalmenu-db.firebasestorage.app",
    apiKey: "AIzaSyCU0F1YaPj_wCIsnIuQKCaCLrqVvsOQaoc",
    authDomain: "digitalmenu-db.firebaseapp.com",
    messagingSenderId: "991749881933",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;
