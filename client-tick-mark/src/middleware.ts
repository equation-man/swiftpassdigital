import { auth } from "@/auth"
import { NextResponse } from "next/server";

// Application routes.
const DEFAULT_LOGOUT_REDIRECT = "/login";
const DEFAULT_LOGIN_REDIRECT = "/login";
const authRoutes = ["/login", "/register"];
const publicRoutes = ["/", "/event/:path"];
const isAuthPrefix = "/api/auth";

export default auth(async function middleware(req: NextRequest) {
    // Custom middleware logic goes here.
    const nexturl = req.nextUrl;
    const isLoggedIn = !req.auth?.user.token;

    const isApiAuthRoute = nexturl.pathname.startsWith(isAuthPrefix);
    const isPublicRoutes = publicRoutes.includes(nexturl.pathname);
    const isAuthRoute = authRoutes.includes(nexturl.pathname);

    if (isApiAuthRoute) {
        return null;
    }

    if (isAuthRoute) {
        // Handle redirection to organization page for logged in users.
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url))
        }
        return null;
    }

    if (!isLoggedIn && !isPublicRoutes) {
        // Handle redirects for users not yer logged in
        const callbackUrl = nexturl.pathname;
        const encodeCallbackUrl = encodeURIComponent(callbackUrl)
        return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeCallbackUrl}`, req.url));
    }

    return null;
    },{
        callbacks: {
            authorized: async () => {
                if (isLoggedIn) return true;
                else return false
            }
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
