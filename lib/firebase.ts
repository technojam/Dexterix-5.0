import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Debug helper (runs only in browser)
if (typeof window !== "undefined") {
    console.log("Firebase Config Check:", {
        apiKey: firebaseConfig.apiKey ? "Present (" + firebaseConfig.apiKey.substring(0, 5) + "...)" : "MISSING",
        authDomain: firebaseConfig.authDomain ? firebaseConfig.authDomain : "MISSING",
        projectId: firebaseConfig.projectId
    });

    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "mock-api-key") {
        console.error("CRITICAL: Firebase API Key is missing. Ensure NEXT_PUBLIC_FIREBASE_API_KEY is set in .env");
    }
    if (!firebaseConfig.authDomain) {
        console.error("CRITICAL: Firebase Auth Domain is missing.");
    }
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
