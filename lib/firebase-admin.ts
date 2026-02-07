// Setup for Next.js Middleware/API using firebase-admin
import "server-only";
import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// You should put your service account keys in environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Handle private key newlines correctly
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

export function getAdminApp() {
    const isPlaceholder = !serviceAccount.privateKey || 
                          serviceAccount.privateKey.includes("your-private-key") || 
                          serviceAccount.privateKey.length < 50; // simple check

    if (isPlaceholder) {
        console.warn("Firebase Private Key is missing or invalid (placeholder). Auth Service disabled.");
        // Return null or undefined, or a mock? 
        // initializeApp will fail if we pass invalid creds.
        // We must avoid calling initializeApp with bad creds.
        // But if we return null, getAuth(null) will throw.
        // Strategy: Check getApps(). If 0, and invalid key, DO NOT initialize. 
        // If getApps() has apps, return getApps()[0].
        // If no apps and invalid key, we are in trouble if we MUST return an App.
        
        if (getApps().length > 0) {
            return getApp();
        }
        
        // Return null to signal failure - caller must handle or we mock
        return null; 
    }

    if (!getApps().length) {
        return initializeApp({
            credential: cert(serviceAccount),
        });
    }
    return getApp();
}

const app = getAdminApp();
// Export auth only if app is valid, otherwise export a mock or null (which might break consumers, but better than build crash)
export const adminAuth = app ? getAuth(app) : null;
