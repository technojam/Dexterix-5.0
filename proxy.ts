import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  // ----------------------------------------------------------------------
  // 1. FIREWALL & SECURITY (WAF-Lite)
  // ----------------------------------------------------------------------
  
  // 1.1 Block Suspicious User Agents (Scanners/Bots)
  const userAgent = req.headers.get("user-agent")?.toLowerCase() || "";
  const blockedAgents = ["burp", "sqlmap", "nmap", "nikto", "metasploit", "acunetix", "nessus", "openvas"];
  if (blockedAgents.some(agent => userAgent.includes(agent))) {
     return new NextResponse(null, { status: 403, statusText: "Forbidden" });
  }

  // 1.2 HTTP Method Restriction
  const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"];
  if (!allowedMethods.includes(req.method)) {
    return new NextResponse(null, { status: 405, statusText: "Method Not Allowed" });
  }

  // 1.3 URL Attack Pattern Detection (Basic SQLi/XSS/Traversal)
  // Decoded path/search for inspection
  const url = req.nextUrl.toString().toLowerCase();
  const dangerousPatterns = [
    "select%20", "union%20", "insert%20",        // SQLi
    "<script", "%3cscript", "javascript:",       // XSS
    "../", "..\\", "%2e%2e%2f", "%2e%2e%5c",     // Path Traversal
    "/etc/passwd", "win.ini", "boot.ini"         // System Files
  ];

  // Exclude some patterns if they are legitimate parts of query (e.g. "select" in a search term is tricky, 
  // but "select%20" implies a command). Use caution.
  // For safety, we only block high-confidence attack signatures in this layer.
  if (dangerousPatterns.some(p => url.includes(p))) {
    console.warn(`[Firewall] Blocked suspicious pattern in URL: ${req.nextUrl.pathname}`);
    return new NextResponse(null, { status: 403, statusText: "Forbidden" });
  }

  // ----------------------------------------------------------------------
  // 2. ROUTING & AUTHENTICATION
  // ----------------------------------------------------------------------

  let response: NextResponse;

  const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
  const isApiAdminPath = req.nextUrl.pathname.startsWith("/api/admin");
  const isLoginPage = req.nextUrl.pathname === "/admin/login";

  // 2.1 Admin Access Control
  if (isLoginPage) {
    // If accessing login page while already logged in -> Redirect to Dashboard
    const session = req.cookies.get("session")?.value;
    if (session) {
       response = NextResponse.redirect(new URL("/admin", req.url));
    } else {
       response = NextResponse.next();
    }
  } else if ((isAdminPath || isApiAdminPath) && !isLoginPage) {
    // Protected Admin Routes
    const session = req.cookies.get("session")?.value;

    if (!session) {
      if (isApiAdminPath) {
        response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      } else {
        response = NextResponse.redirect(new URL("/admin/login", req.url));
      }
    } else {
      // Allow request to proceed (Authorization happens in Layout/API)
      response = NextResponse.next();
    }
  } else {
    // Public Routes
    response = NextResponse.next();
  }

  // ----------------------------------------------------------------------
  // 3. GLOBAL SECURITY HEADERS (Applied to ALL responses)
  // ----------------------------------------------------------------------
  
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://dexterix5.documents.azure.com;"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "Permissions-Policy", 
    "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()"
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
