import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    getOrCreateActiveReferralCode,
    generateQrDataUrl,
    getUserReferralStats,
} from "@/lib/referral";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true, name: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const forceNew = searchParams.get("refresh") === "true";

        const referralCode = await getOrCreateActiveReferralCode(
            user.id,
            user.role,
            forceNew
        );

        // Build registration URL with ref parameter
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const baseUrl = process.env.NEXTAUTH_URL || `${protocol}://${host}`;
        const registrationUrl = `${baseUrl}/register?ref=${referralCode.code}`;

        // Generate QR code data URL encoding the full registration link
        const qrDataUrl = await generateQrDataUrl(registrationUrl);

        // Fetch Darker Genie stats
        const stats = await getUserReferralStats(user.id);

        return NextResponse.json({
            code: referralCode.code,
            registrationUrl,
            qrDataUrl,
            referrerRole: user.role,
            createdAt: referralCode.createdAt,
            stats,
        });
    } catch (error) {
        console.error("Error fetching referral code:", error);
        return NextResponse.json(
            { error: "Failed to get active referral QR code" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Force generate a fresh unique single-use referral code
        const newCode = await getOrCreateActiveReferralCode(user.id, user.role, true);

        const host = req.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const baseUrl = process.env.NEXTAUTH_URL || `${protocol}://${host}`;
        const registrationUrl = `${baseUrl}/register?ref=${newCode.code}`;

        const qrDataUrl = await generateQrDataUrl(registrationUrl);
        const stats = await getUserReferralStats(user.id);

        return NextResponse.json({
            code: newCode.code,
            registrationUrl,
            qrDataUrl,
            referrerRole: user.role,
            createdAt: newCode.createdAt,
            stats,
        });
    } catch (error) {
        console.error("Error generating new referral code:", error);
        return NextResponse.json(
            { error: "Failed to generate new referral QR code" },
            { status: 500 }
        );
    }
}
