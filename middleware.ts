import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// הגנה על מסכי ה-dashboard. routes ציבוריים: דף נחיתה, webhooks, leads, cron, auth.
const PUBLIC_PREFIXES = [
  "/login",
  "/lp/",
  "/api/auth",
  "/api/webhooks",
  "/api/leads",
  "/api/cron",
  "/_next",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // בדיקת session cookie של NextAuth (אימות מלא נעשה בשכבת ה-page/route)
  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token");

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)).*)"],
};
