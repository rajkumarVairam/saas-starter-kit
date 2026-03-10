import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { API_AUTH_PREFIX, DEFAULT_LOGIN_REDIRECT } from "./routes";

// API routes that require authentication (session-based, not Bearer token).
// Bearer-token routes (/api/v1/*, /api/oauth/*) handle their own auth inline.
const PROTECTED_API_ROUTES = [
  "/api/subscription",
  "/api/generate-theme",
  "/api/enhance-prompt",
];

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const pathname = request.nextUrl.pathname;

  // Always allow the auth API through
  if (pathname.startsWith(API_AUTH_PREFIX)) {
    return NextResponse.next();
  }

  // Safety net for protected API routes — return 401 if no session
  if (PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protected page routes
  if (!session) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }

  if (session) {
    // Redirect /settings root to profile (most logical default)
    if (pathname === "/settings") {
      return NextResponse.redirect(new URL("/settings/profile", request.url));
    }

    // Admin routes — check email against ADMIN_EMAILS
    if (pathname.startsWith("/admin")) {
      const adminEmails = (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      const userEmail = session.user.email?.toLowerCase() ?? "";
      if (adminEmails.length === 0 || !adminEmails.includes(userEmail)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/settings/:path*",
    "/admin/:path*",
    "/oauth/:path*",
    "/success",
    "/api/subscription",
    "/api/generate-theme",
    "/api/enhance-prompt",
  ],
};
