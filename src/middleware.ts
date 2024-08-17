import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicERoute = createRouteMatcher([
    '/sign-in',
    "/sign-up",
    "/",
    "/home"
]);

const isPublicApiRoute = createRouteMatcher([
    '/api/videos'
]);

export default clerkMiddleware((auth, req) => {
    const { userId } = auth();
    const currentUrl = new URL(req.url);

    const isAccessingDashboard = currentUrl.pathname === '/home'
    const isApiRequest = currentUrl.pathname.startsWith('/api')

    if (userId && isPublicERoute(req) && !isAccessingDashboard) { //* If user is logged in and tries to access a public route
        return NextResponse.redirect(new URL('/home', req.url))
    }

    if (!userId) { //* If user is not logged in
        if (!isPublicERoute(req) && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL('/sign-in', req.url))
        }

        if (isApiRequest && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL('/sign-in', req.url))
        }
    }

    return NextResponse.next();
})

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};