import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDnwfMpdEUDM-Lgj2GLrGxypJ72-XEdxkQ",
  authDomain: "skilled-primacy-zln7n.firebaseapp.com",
  projectId: "skilled-primacy-zln7n",
  storageBucket: "skilled-primacy-zln7n.firebasestorage.app",
  messagingSenderId: "961759416704",
  appId: "1:961759416704:web:d40b514e1a58281aebb165"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable Firestore Offline Cache/Persistence for web container environment
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Firestore offline cache precondition failed (e.g., active in another tab)");
    } else if (err.code === "unimplemented") {
      console.warn("Firestore offline cache is unimplemented in this browser");
    } else {
      console.error("Firestore offline cache failed to initialize:", err);
    }
  });
}
