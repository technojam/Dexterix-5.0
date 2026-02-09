"use server";

import { auth } from "@/lib/firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { cookies } from "next/headers";
import { getAdminApp } from "@/lib/firebase-admin";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) { // eslint-disable-line @typescript-eslint/no-explicit-any
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

    // 5. Role-based Redirect
    const volunteerEmails = (process.env.VOLUNTEER_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    const userEmail = user.email?.toLowerCase() || "";

    if (volunteerEmails.includes(userEmail)) {
        redirect("/admin/checkin");
    } else {
        redirect("/admin");
    }

  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Login error:", error);
    // If redirect() throws (which it serves as a way to navigate), let it pass
    if (error.message === "NEXT_REDIRECT") {
        throw error;
    }
    return { error: "Invalid credentials or authentication failed." };
  }
}

export async function logoutAction() {
  (await cookies()).delete("session");
  return { success: true };
}
