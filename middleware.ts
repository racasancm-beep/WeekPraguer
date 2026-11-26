import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // 1. Protection for Owner Routes (accessible to OWNER, SERVICE_OWNER and ADMIN)
        if (path.startsWith("/owner")) {
            if (!token || (token.role !== "OWNER" && token.role !== "ADMIN" && token.role !== "SERVICE_OWNER")) {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
        }

        // 2. Protection for Admin Routes (accessible to ADMIN)
        if (path.startsWith("/admin")) {
            if (!token || token.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
        }

        // 3. Renter dashboard: redirect OWNER and SERVICE_OWNER immediately to their owner dashboard
        if (path === "/dashboard" || path.startsWith("/dashboard")) {
            if (token?.role === "SERVICE_OWNER") {
                return NextResponse.redirect(new URL("/owner/dashboard/listings/create?type=SERVICE", req.url));
            }
            if (token?.role === "OWNER") {
                return NextResponse.redirect(new URL("/owner/dashboard/earnings", req.url));
            }
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        "/owner/:path*",
        "/admin/:path*",
        "/portal",
        "/dashboard",
        "/dashboard/:path*"
    ],
};
