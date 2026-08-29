// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0HD3EqYjWNozraZuederUBDEQNBXI5Dg",
  authDomain: "pminternship-2026.firebaseapp.com",
  projectId: "pminternship-2026",
  storageBucket: "pminternship-2026.firebasestorage.app",
  messagingSenderId: "831094392185",
  appId: "1:831094392185:web:1b79684c584892bd03dba8",
  measurementId: "G-1DB43LY1QR"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics safely in browser environment
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Graceful fallback for non-analytics environments
  });
}

export default app;
