import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Debug helper (runs only in browser)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("Firebase Config Check:", {
        apiKey: firebaseConfig.apiKey ? "Present (" + firebaseConfig.apiKey.substring(0, 5) + "...)" : "MISSING",
        authDomain: firebaseConfig.authDomain ? firebaseConfig.authDomain : "MISSING",
        projectId: firebaseConfig.projectId
    });

    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "mock-api-key") {
        console.error("CRITICAL: Firebase API Key is missing. Ensure FIREBASE_API_KEY is set in .env");
    }
    if (!firebaseConfig.authDomain) {
        console.error("CRITICAL: Firebase Auth Domain is missing.");
    }
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
