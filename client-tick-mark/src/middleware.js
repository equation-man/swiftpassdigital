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

export default auth(async function middleware(req) {
  const nextUrl = req.nextUrl;
  const pathname = nextUrl.pathname;
  const user = req.auth?.user;
  const isLoggedIn = !!user?.token;

  const isApiAuthRoute = nextUrl.pathname.startsWith(isAuthPrefix);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isPublicRoute = publicRoutePatterns.some((pattern) =>
    pattern.test(nextUrl.pathname)
  );

  // Skip static files (important!)
  if (
    pathname.startsWith("/icons") ||
    pathname === "/manifest.json" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }
  // Skip all API routes.
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Allow all /api/auth requests to pass
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Logged in users visiting login or register
  if (isAuthRoute) {
    if (isLoggedIn) {
      const userId = user?.organization_id;
      const dashboardUrl = `/organizations/${userId}`;
      return NextResponse.redirect(new URL(dashboardUrl, req.url));
    }
    return NextResponse.next();
  }

  // Unauthenticated users visiting protected routes
  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
  }

  // Default: allow access
  return NextResponse.next();
}, {
  callbacks: {
    authorized: async ({ auth }) => !!auth?.user?.token,
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
});


export const config = {
  matcher: [
    //"/((?!_next/static|_next/image|favicon.ico|assets|icons|api/auth).*)",
    // Skip Next.js internals and static files
    //'/((?!_next/|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    //'/(api|trpc)(.*)',
    // Prevents recursion on /api/auth/* in production
    '/((?!_next/|api/auth|.*\\..*).*)',
  ],
};

