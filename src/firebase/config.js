import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAwBzfiPyy0x5kVZD68bDsn7kPsOTF1R6w",
    authDomain: "sorteio-presente.firebaseapp.com",
    projectId: "sorteio-presente",
    storageBucket: "sorteio-presente.firebasestorage.app",
    messagingSenderId: "468128834933",
    appId: "1:468128834933:web:282019808687d0ff3f9f3c"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
