import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Application routes
const DEFAULT_LOGOUT_REDIRECT = "/login";
const DEFAULT_LOGIN_REDIRECT = "/login";
const PUBLIC_FILE = /\.(.*)$/;
const authRoutes = ["/login", "/register"];
const publicRoutePatterns = [
  /^\/$/,                  // homepage
  /^\/event\/[^\/]+$/,     // dynamic /event/{id}
  /^\/verify\/[^\/]+$/,    // dynamic /verify/{id}
  /^\/verify\/failed$/,    // static /verify/failed
  /^\/payments\-policy$/,
  /^\/terms\-of\-service$/,
  /^\/how\-it\-works$/,
];
const isAuthPrefix = "/api/auth";

export async function proxy(request) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const nextUrl = request.nextUrl;
  const pathname = nextUrl.pathname;
  const isApiAuthRoute = nextUrl.pathname.startsWith(isAuthPrefix);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isPublicRoute = publicRoutePatterns.some((pattern) =>
    pattern.test(nextUrl.pathname)
  );

  // Logged in users visiting login or register
  if (isAuthRoute) {
    if (isLoggedIn) {
      const userId = session.user?.user?.organization_id;
      const dashboardUrl = `/organizations/${userId}`;
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
    return NextResponse.next();
  }

  // Unauthenticated users visiting protected routes
  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, request.url));
  }
  
  if (isApiAuthRoute) return NextResponse.next();

  // Default: allow access
  return NextResponse.next();
}

export const config = {
	matcher: [
		'/((?!_next/|api/auth|.*\\..*).*)',
	],
}
