import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration from user
const firebaseConfig = {
  apiKey: "AIzaSyA0FzIIpfSCqcGm78bPzhqMtOQ-iEuHq6Q",
  authDomain: "studio-2695786469-dc293.firebaseapp.com",
  projectId: "studio-2695786469-dc293",
  storageBucket: "studio-2695786469-dc293.firebasestorage.app",
  messagingSenderId: "558695624108",
  appId: "1:558695624108:web:ed74000f7ad96c3f4ede09",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export the app instance if needed
export default app;
