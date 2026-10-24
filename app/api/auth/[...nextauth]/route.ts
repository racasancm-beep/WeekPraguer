import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

const nextAuthHandler = NextAuth(authOptions);

function ensureProductionAuthUrl(req: NextRequest) {
    if (process.env.NODE_ENV === "production") {
        const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
        process.env.NEXTAUTH_URL = host ? `https://${host}` : "https://www.mygenieurope.com";
    }
}

export async function GET(req: NextRequest, ctx: any) {
    ensureProductionAuthUrl(req);
    return nextAuthHandler(req as any, ctx);
}

export async function POST(req: NextRequest, ctx: any) {
    ensureProductionAuthUrl(req);
    return nextAuthHandler(req as any, ctx);
}
