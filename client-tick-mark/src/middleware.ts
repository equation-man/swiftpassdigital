import { auth } from "@/auth"
import { NextResponse } from "next/server";

// Application routes.
const DEFAULT_LOGOUT_REDIRECT = "/login";
const DEFAULT_LOGIN_REDIRECT = "/login";
const authRoutes = ["/login", "/register"];
const publicRoutes = ["/", "/event/:path", "/verify/:path", "/verify/failed"];
const isAuthPrefix = "/api/auth";

// Define public routes with regex
const publicRoutePatterns: RegExp[] = [
  /^\/$/,                   // homepage
  /^\/event\/[^\/]+$/,       // dynamic /event/{id}
  /^\/verify\/[^\/]+$/,      // dynamic /verify/{id}
  /^\/verify\/failed$/,      // static /verify/failed
];

export default auth(async function middleware(req: NextRequest) {
    // Custom middleware logic goes here.
    const nextUrl = req.nextUrl;
    const user = req.auth?.user;
    const isLoggedIn = !!user?.token;


    const isApiAuthRoute = nextUrl.pathname.startsWith(isAuthPrefix);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);
    // Check for public route patterns
    const isPublicRoute = publicRoutePatterns.some((pattern) => pattern.test(nextUrl.pathname));
    // Static public route.
    //const isPublicRoutes = publicRoutes.includes(nextUrl.pathname);


    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    // Logged in users visiting login or register.
    if (isAuthRoute) {
        // Redirect logged in users away from /login and /register routes.
        if (isLoggedIn) {
            const userId = user?.organization_id || user?.organization_id;
            const dashboardUrl = `/organizations/${userId}`;
            return NextResponse.redirect(new URL(dashboardUrl, req.url))
        }
        return NextResponse.next();
    }

    // Unauthenticated users visiting protected routes.
    if (!isLoggedIn && !isPublicRoute) {
        // Handle redirects for users not yer logged in
        const callbackUrl = nextUrl.pathname;
        const encodedCallbackUrl = encodeURIComponent(callbackUrl)
        return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, req.url));
    }

    // Default
    return NextResponse.next();
    },{
        callbacks: {
            authorized: async ({ auth }) => !!auth?.user?.token,
        },
        pages: {
            signIn: "/login",
            signOut: "/login",
        }
})

export const config = {
 matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next/|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
