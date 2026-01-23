import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // 1. Protection for Owner Routes
        if (path.startsWith("/owner")) {
            if (!token || token.role !== "OWNER") {
                // Redirect to dashboard or unauthorized page
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
        }

        // 2. Protection for Cleaner Routes
        if (path.startsWith("/cleaner")) {
            if (!token || token.role !== "CLEANER") {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
        }

        // 3. Protection for Admin Routes
        if (path.startsWith("/admin")) {
            if (!token || token.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token, // Requires the user to be logged in for any matched route
        },
    }
);

export const config = {
    matcher: [
        "/owner/:path*",
        "/cleaner/:path*",
        "/admin/:path*",
        "/portal",
        "/dashboard/:path*"
    ],
};
