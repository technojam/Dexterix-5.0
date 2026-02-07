import "server-only";
import { getApps, initializeApp, cert, getApp, App } from "firebase-admin/app";
import { getAuth, Auth, DecodedIdToken } from "firebase-admin/auth";

/**
 * Interface for Auth Service (Dependency Inversion Principle)
 * Handles server-side auth verification and session management.
 */
export interface IAuthService {
  verifyIdToken(token: string): Promise<DecodedIdToken>;
  createSessionCookie(idToken: string, expiresIn: number): Promise<string>;
  verifySessionCookie(sessionCookie: string): Promise<boolean>;
  getUserFromSession(sessionCookie: string): Promise<DecodedIdToken | null>;
}

export class FirebaseAuthService implements IAuthService {
  private app: App | undefined;
  private auth: Auth | undefined;

  constructor() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    let isPlaceholder = !privateKey;
    let reason = "";

    if (privateKey) {
        if (privateKey.toLowerCase().includes("private_key_here")) {
             isPlaceholder = true;
             reason = "Contains 'private_key_here'";
        } else if (privateKey.includes("your-private-key")) {
             isPlaceholder = true;
             reason = "Contains 'your-private-key'";
        } else if (privateKey.length < 100) {
             isPlaceholder = true;
             reason = `Key too short (${privateKey.length} chars). First 20: ${privateKey.substring(0, 20)}...`;
        }
    } else {
        reason = "Key is undefined or empty";
    }

    if (projectId && clientEmail && privateKey && !isPlaceholder) {
        const serviceAccount = {
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        };

        if (!getApps().length) {
          try {
              this.app = initializeApp({
                credential: cert(serviceAccount),
              });
              console.log("✅ Firebase Admin initialized successfully.");
          } catch (e) {
              console.error("❌ Failed to initialize Firebase Admin:", e);
          }
        } else {
          try {
             this.app = getApp();
          } catch{
              // minimal fallback
          }`⚠️  FIREBASE_PRIVATE_KEY invalid: ${reason}`
        }
        
        if (this.app) {
             this.auth = getAuth(this.app);
        }
    } else {
        const missing = [];
        if (!projectId) missing.push("FIREBASE_PROJECT_ID");
        if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
        if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");
        
        console.warn(`⚠️  Missing Firebase Admin keys in .env: ${missing.join(", ")}. Authentication service will fail.`);
        if (isPlaceholder) console.warn("⚠️  FIREBASE_PRIVATE_KEY appears to be a placeholder or too short.");
    }
  }

  private ensureAuth() {
      if (!this.auth) {
          throw new Error("Firebase Admin Auth not initialized. Check server logs and .env");
      }
      return this.auth;
  }

  async verifyIdToken(token: string): Promise<DecodedIdToken> {
    const decodedToken = await this.ensureAuth().verifyIdToken(token);
    return decodedToken;
  }

  async createSessionCookie(idToken: string, expiresIn: number): Promise<string> {
    return await this.ensureAuth().createSessionCookie(idToken, { expiresIn });
  }

  async verifySessionCookie(sessionCookie: string): Promise<boolean> {
    try {
      await this.ensureAuth().verifySessionCookie(sessionCookie, true);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getUserFromSession(sessionCookie: string): Promise<DecodedIdToken | null> {
      try {
          return await this.ensureAuth().verifySessionCookie(sessionCookie, true);
      } catch (error) {
          return null;
      }
  }
}

// Singleton Instance
export const authService = new FirebaseAuthService();
