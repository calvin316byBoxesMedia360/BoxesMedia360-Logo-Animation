import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    projectId: "boxesos-crmtest",
    appId: "1:938762407896:web:bbf03de149edb26bcb6cad",
    storageBucket: "boxesos-crmtest.firebasestorage.app",
    apiKey: "AIzaSyASiL3PIBovXTxrv9k5Ga8n4gtlu6EW2Cs",
    authDomain: "boxesos-crmtest.firebaseapp.com",
    messagingSenderId: "938762407896",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;
