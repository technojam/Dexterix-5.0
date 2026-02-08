"use server";

import { auth } from "@/lib/firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { cookies } from "next/headers";
import { getAdminApp } from "@/lib/firebase-admin";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    // 1. Authenticate using Client SDK (on server)
    // This verifies credentials against Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Get ID Token
    const idToken = await user.getIdToken();

    // 3. Create Session Cookie using Admin SDK
    const adminApp = getAdminApp();
    if (!adminApp) {
        return { error: "Server authentication configuration missing." };
    }
    const adminAuth = getAdminAuth(adminApp);
    
    // Set session expiration to 5 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // 4. Set Cookie
    (await cookies()).set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    // 5. Success
  } catch (error: any) {
    console.error("Login error:", error);
    return { error: "Invalid credentials or authentication failed." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  (await cookies()).delete("session");
  redirect("/admin/login");
}
