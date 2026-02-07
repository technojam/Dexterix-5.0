"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  EmailAuthProvider,
  signOut
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Helper: Handle Account Linking if needed
  const handleAccountLinking = async (error: any) => {
      // 1. Check if identifying payload exists
      if (error.code === 'auth/account-exists-with-different-credential') {
          const pendingCred = error.customData?._tokenResponse ? GoogleAuthProvider.credential(error.customData._tokenResponse.idToken) : null;
          const email = error.customData?.email;
          if (!email || !pendingCred) {
               toast.error("Account linking failed: Missing details.");
               return;
          }
          
          // 2. Ask user for password to verify ownership
          const userPassword = prompt(`An account already exists for ${email}. Please enter your password to link Google Sign-In:`);
          if (!userPassword) return;

          try {
              // 3. Sign in with Email/Pass
              const userCredential = await signInWithEmailAndPassword(auth, email, userPassword);
              // 4. Link the pending Google Credential
              await linkWithCredential(userCredential.user, pendingCred);
              toast.success("Accounts linked successfully!");
              const idToken = await userCredential.user.getIdToken();
              await createSession(idToken);
          } catch (linkErr: any) {
              toast.error("Linking failed: " + linkErr.message);
          }
      } else {
          toast.error(error.message || "Google Login failed");
      }
  };

  // Handle Redirect Result (for fallback)
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (userCredential) => {
        if (userCredential) {
          setLoading(true);
          const idToken = await userCredential.user.getIdToken();
          await createSession(idToken);
        }
      })
      .catch((err) => {
        console.error("Redirect Login Error:", err);
        handleAccountLinking(err);
        setLoading(false);
      });
  }, []);

  const createSession = async (idToken: string) => {
    // 2. Server-side session creation shared logic
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      body: JSON.stringify({ idToken }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      toast.success("Access Granted");
      
      // Role-based redirection
      if (data.role === 'volunteer') {
          router.push("/admin/checkin");
      } else {
          router.push("/admin");
      }
    } else {
      const data = await res.json();
      toast.error(data.error || "Access Denied: You are not on the allow-list.");
      // Force sign-out so they aren't left in a "half-logged-in" state
      await signOut(auth);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Client-side login with Firebase (Email/Password)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      await createSession(idToken);
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (useRedirect = false) => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      if (useRedirect) {
        await signInWithRedirect(auth, provider);
        // Page will reload, no further action needed here
        return;
      }
      
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();
      await createSession(idToken);
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        toast.error("Popup closed or blocked. Try the Redirect option below.", { duration: 5000 });
      } else {
        handleAccountLinking(err);
      }
      console.error("Login detailed error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05193B] font-lora">
      <Card className="w-full max-w-sm bg-[#0b224d] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <Button 
                type="button" 
                variant="outline"
                className="w-full bg-white text-black hover:bg-gray-100"
                onClick={() => handleGoogleLogin(false)}
                disabled={loading}
              >
                {loading ? "Connecting..." : "Sign in with Google"}
              </Button>
              
              {/* Fallback for blocked popups */}
              <button 
                type="button"
                onClick={() => handleGoogleLogin(true)}
                className="w-full text-center text-xs text-slate-400 hover:text-white underline decoration-dashed underline-offset-4"
              >
                Popup not working? Try Redirect Login
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0b224d] px-2 text-white/50">Or continue with email</span>
                </div>
              </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="admin@technojam.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
              <Input
                type="password"
                placeholder="Wait, I'll type..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white" 
              />
              <Button type="submit" className="w-full bg-[#1e293b] hover:bg-[#334155] text-white" disabled={loading}>
                {loading ? "Signing in..." : "Sign in with Email"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
