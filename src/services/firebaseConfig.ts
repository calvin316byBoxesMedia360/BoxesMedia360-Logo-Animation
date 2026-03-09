import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// NOTE: Using boxesos-crmtest until los-cuates-digital-menu fully propagates in Firebase CLI
// Switch to los-cuates-digital-menu config below once CLI sees the project:
// apiKey: "AIzaSyCdaEVng5Vxv0KFESFnRGDI32OWvywhgQM"
// projectId: "los-cuates-digital-menu"
// storageBucket: "los-cuates-digital-menu.firebasestorage.app"
// messagingSenderId: "357846943748"
// appId: "1:357846943748:web:5bb5c6287e09b9677bcd51"
const firebaseConfig = {
    apiKey: "AIzaSyASiL3PIBovXTxrv9k5Ga8n4gtlu6EW2Cs",
    authDomain: "boxesos-crmtest.firebaseapp.com",
    projectId: "boxesos-crmtest",
    storageBucket: "boxesos-crmtest.firebasestorage.app",
    messagingSenderId: "938762407896",
    appId: "1:938762407896:web:bbf03de149edb26bcb6cad",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;
