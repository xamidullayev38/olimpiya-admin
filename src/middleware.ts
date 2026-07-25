import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

// Faqat shu prefikslar himoyalanadi — /login ochiq qoladi.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/participants",
  "/zones",
  "/meal-tracking",
  "/reports",
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get(AUTH_COOKIE)?.value;
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/participants/:path*",
    "/zones/:path*",
    "/meal-tracking/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
