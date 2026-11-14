import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractReferralCode } from "@/lib/referral-utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const rawCode = searchParams.get("code");
        if (!rawCode) {
            return NextResponse.json({ valid: false, error: "Missing referral code" }, { status: 400 });
        }

        const cleanCode = extractReferralCode(rawCode);

        const refCode = await prisma.referralCode.findUnique({
            where: { code: cleanCode },
            include: {
                referrer: {
                    select: {
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        if (!refCode) {
            return NextResponse.json({
                valid: false,
                code: cleanCode,
                error: "Codul QR de recomandare nu a fost găsit.",
            });
        }

        if (refCode.used) {
            return NextResponse.json({
                valid: false,
                code: cleanCode,
                error: "Acest cod QR a fost deja utilizat pentru crearea unui cont (utilizare unică).",
            });
        }

        return NextResponse.json({
            valid: true,
            code: refCode.code,
            referrerRole: refCode.referrerRole,
            referrerName: refCode.referrer.name || refCode.referrer.email.split("@")[0],
        });
    } catch (error) {
        console.error("Error verifying referral code:", error);
        return NextResponse.json(
            { valid: false, error: "Failed to verify referral code" },
            { status: 500 }
        );
    }
}
