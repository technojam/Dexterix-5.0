import { NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    // 1. Verify User Identity and extract Email
    const decodedToken = await authService.verifyIdToken(idToken);
    const userEmail = decodedToken.email;

    if (!userEmail) {
        return NextResponse.json({ error: "Email is required for admin access" }, { status: 400 });
    }

    // 2. Authorization Check (Allow List)
    const allowedEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    const volunteerEmails = (process.env.VOLUNTEER_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    
    // Safety: If env var is empty, no one can login (fail safe)
    if (allowedEmails.length === 0 && volunteerEmails.length === 0) {
        console.warn("ADMIN_EMAILS and VOLUNTEER_EMAILS are empty.");
        return NextResponse.json({ error: "Admin login configuration missing." }, { status: 403 });
    }

    const userEmailLower = userEmail.toLowerCase();
    let role = "unauthorized";
    
    if (allowedEmails.includes(userEmailLower)) {
        role = "admin";
    } else if (volunteerEmails.includes(userEmailLower)) {
        role = "volunteer";
    }

    if (role === "unauthorized") {
        console.warn(`Unauthorized Access Attempt: ${userEmail}`);
        return NextResponse.json({ error: "You are not authorized to access the admin panel." }, { status: 403 });
    }

    // 3. Create session cookie
    const expiresIn = 60 * 60 * 1 * 1000; // 1 hour
    
    // We try to create a session cookie. The service internally should verify or use the token 
    // to exchange it. The firebase-admin SDK creates a session cookie from a valid ID token.
    const sessionCookie = await authService.createSessionCookie(idToken, expiresIn);

    if (sessionCookie) {
        const response = NextResponse.json({ success: true, role });
        response.cookies.set("admin_session", sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "strict"
        });
        
        // Non-httpOnly cookie for client-side routing logic
        response.cookies.set("admin_role", role, {
            maxAge: expiresIn,
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "strict"
        });

        return response;
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}

