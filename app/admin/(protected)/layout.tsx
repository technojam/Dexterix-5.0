import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminApp } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import "server-only";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    redirect("/admin/login");
  }

  const adminApp = getAdminApp();
  if (!adminApp) {
      console.error("Firebase Admin not configured correctly.");
      redirect("/admin/login"); 
  }

  try {
    const adminAuth = getAuth(adminApp);
    // Verify the session cookie. In this case, we check for revocation too (second param true).
    await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
    console.error("Session verification failed:", error);
    redirect("/admin/login");
  }

  return <>{children}</>;
}
