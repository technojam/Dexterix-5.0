import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key-change-it");

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // 1. Security Headers (Firewall-like logic)
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://dexterix5.documents.azure.com;"
  );
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  res.headers.set(
    "Permissions-Policy", 
    "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()"
  );

  // 1.1 HTTP Method Restriction (Verbs Protection)
  const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"];
  if (!allowedMethods.includes(req.method)) {
    return new NextResponse(null, { status: 405, statusText: "Method Not Allowed" });
  }

  // 1.2 Block Suspicious User Agents (Anti-Scanner/Bot)
  const userAgent = req.headers.get("user-agent")?.toLowerCase() || "";
  const blockedAgents = ["burp", "sqlmap", "nmap", "nikto", "metasploit", "acunetix"];
  if (blockedAgents.some(agent => userAgent.includes(agent))) {
     return new NextResponse(null, { status: 403, statusText: "Forbidden" });
  }

  // 2. Admin Authentication check
  const url = req.nextUrl;
  const isAdminPath = url.pathname.startsWith("/admin");
  const isApiAdminPath = url.pathname.startsWith("/api/admin");
  const isExcluded = url.pathname === "/admin/login" || url.pathname === "/api/admin/auth";

  if ((isAdminPath || isApiAdminPath) && !isExcluded) {
    const session = req.cookies.get("admin_session")?.value;

    if (!session) {
      if (isApiAdminPath) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    
    // Note: Full verification of the session cookie via Firebase Admin SDK
    // cannot happen here in Edge Middleware (Node.js runtime required).
    // We rely on the API Routes (Serverless) to double-check, but this check
    // prevents casual access.
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
