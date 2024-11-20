import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyCmpgQsZxaCIc0eHSLmTSjIn0Vy233Lmhw",
    authDomain: "fanzon-688cf.firebaseapp.com",
    projectId: "fanzon-688cf",
    storageBucket: "fanzon-688cf.firebasestorage.app",
    messagingSenderId: "309701664220",
    appId: "1:309701664220:web:3e07a6a3b5c89d022fc319",
    measurementId: "G-F9H21SMWK5"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);