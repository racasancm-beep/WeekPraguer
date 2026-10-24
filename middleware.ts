import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // 1. Protection for Owner Routes (accessible to OWNER and ADMIN)
        if (path.startsWith("/owner")) {
            if (!token || (token.role !== "OWNER" && token.role !== "ADMIN")) {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
        }

        // 2. Protection for Admin Routes (accessible to ADMIN)
        if (path.startsWith("/admin")) {
            if (!token || token.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/dashboard", req.url));
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
        "/dashboard/:path*"
    ],
};
