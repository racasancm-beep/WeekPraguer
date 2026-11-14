import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import QRCode from "qrcode";
import crypto from "crypto";

export interface DarkerGenieStats {
    totalGeneratedCodes: number;
    pendingReferrals: number;
    confirmedReferrals: number;
    genieLevel: number; // 0 to 7
    progressToNext: number; // 0 to 9
    referralsNeededForNext: number;
    isMaxLevel: boolean;
    colorHex: string;
    levelName: string;
}

export function calculateGenieLevel(confirmedCount: number): DarkerGenieStats {
    const genieLevel = Math.min(7, Math.floor(confirmedCount / 10));
    const progressToNext = confirmedCount % 10;
    const isMaxLevel = genieLevel >= 7;

    const colors = [
        "#008080", // Level 0: Standard Vibrant Teal
        "#006666", // Level 1: Deep Teal
        "#054e4e", // Level 2: Oceanic Dark Teal
        "#0b3c49", // Level 3: Midnight Teal-Blue
        "#142c44", // Level 4: Deep Sapphire
        "#241738", // Level 5: Dark Mystic Violet
        "#1c1524", // Level 6: Obsidian Charcoal
        "#d4af37", // Level 7: Golden Awakened Dark Genie
    ];

    const names = [
        "Genie Lumina (Level 0)",
        "Genie Întunecat I (Level 1)",
        "Genie Întunecat II (Level 2)",
        "Genie Întunecat III (Level 3)",
        "Genie Safir IV (Level 4)",
        "Genie Mistic V (Level 5)",
        "Genie Obsidian VI (Level 6)",
        "Genie Suprem de Aur VII (Level 7)",
    ];

    return {
        totalGeneratedCodes: 0,
        pendingReferrals: 0,
        confirmedReferrals: confirmedCount,
        genieLevel,
        progressToNext: isMaxLevel ? 10 : progressToNext,
        referralsNeededForNext: isMaxLevel ? 0 : 10 - progressToNext,
        isMaxLevel,
        colorHex: colors[genieLevel] || colors[0],
        levelName: names[genieLevel] || names[0],
    };
}

export async function getUserReferralStats(userId: string): Promise<DarkerGenieStats> {
    const [totalGeneratedCodes, pendingReferrals, confirmedReferrals] = await Promise.all([
        prisma.referralCode.count({ where: { referrerId: userId } }),
        prisma.referral.count({ where: { referrerId: userId, status: "PENDING" } }),
        prisma.referral.count({ where: { referrerId: userId, status: "CONFIRMED" } }),
    ]);

    const stats = calculateGenieLevel(confirmedReferrals);
    stats.totalGeneratedCodes = totalGeneratedCodes;
    stats.pendingReferrals = pendingReferrals;
    return stats;
}

export function generateReferralCodeString(role: UserRole): string {
    const prefix = role === "OWNER" ? "MG-OWN" : "MG-CUST";
    const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `${prefix}-${randomHex}`;
}

export async function getOrCreateActiveReferralCode(
    userId: string,
    role: UserRole,
    forceNew: boolean = false
) {
    // If not forcing new, check if there's an existing unused referral code
    if (!forceNew) {
        const existingUnused = await prisma.referralCode.findFirst({
            where: {
                referrerId: userId,
                used: false,
            },
            orderBy: { createdAt: "desc" },
        });

        if (existingUnused) {
            return existingUnused;
        }
    }

    // Generate unique new code
    let code = generateReferralCodeString(role);
    let attempts = 0;
    while (attempts < 5) {
        const exists = await prisma.referralCode.findUnique({ where: { code } });
        if (!exists) break;
        code = generateReferralCodeString(role);
        attempts++;
    }

    const newCode = await prisma.referralCode.create({
        data: {
            code,
            referrerId: userId,
            referrerRole: role,
            used: false,
        },
    });

    return newCode;
}

export async function generateQrDataUrl(textOrUrl: string): Promise<string> {
    return QRCode.toDataURL(textOrUrl, {
        width: 320,
        margin: 2,
        color: {
            dark: "#111827",
            light: "#ffffff",
        },
        errorCorrectionLevel: "H",
    });
}

/**
 * Parses raw decoded QR string into clean referral code
 */
export function extractReferralCode(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return "";

    // Check if it's a URL like https://.../register?ref=MG-OWN-1234
    try {
        if (trimmed.includes("ref=")) {
            const parsedUrl = new URL(trimmed.startsWith("http") ? trimmed : `https://example.com/${trimmed}`);
            const refParam = parsedUrl.searchParams.get("ref");
            if (refParam) return refParam.trim().toUpperCase();
        }
    } catch {
        // Not a URL
    }

    // Check JSON payload
    try {
        const parsedJson = JSON.parse(trimmed);
        if (parsedJson?.code) return String(parsedJson.code).trim().toUpperCase();
        if (parsedJson?.ref) return String(parsedJson.ref).trim().toUpperCase();
    } catch {
        // Not JSON
    }

    // Direct code pattern
    return trimmed.toUpperCase();
}

/**
 * Triggers referral qualification when a booking is confirmed:
 * 1. If the renter/customer has a pending referral -> they have a confirmed rental -> QUALIFY!
 * 2. If the space owner has a pending referral -> their created space was rented once with confirmed renting -> QUALIFY!
 */
export async function checkAndQualifyReferralsForBooking(params: {
    renterId: string;
    ownerId: string;
    bookingId: string;
}) {
    const { renterId, ownerId, bookingId } = params;
    const now = new Date();

    // 1. Check Customer/Renter pending referral
    if (renterId) {
        const renterReferral = await prisma.referral.findFirst({
            where: {
                refereeId: renterId,
                status: "PENDING",
            },
        });

        if (renterReferral) {
            await prisma.referral.update({
                where: { id: renterReferral.id },
                data: {
                    status: "CONFIRMED",
                    qualifiedAt: now,
                    qualificationType: "CUSTOMER_CONFIRMED_RENTAL",
                },
            });
        }
    }

    // 2. Check Space Owner pending referral
    if (ownerId) {
        const ownerReferral = await prisma.referral.findFirst({
            where: {
                refereeId: ownerId,
                status: "PENDING",
            },
        });

        if (ownerReferral) {
            // Owner created a space and it was confirmed rented at least once!
            await prisma.referral.update({
                where: { id: ownerReferral.id },
                data: {
                    status: "CONFIRMED",
                    qualifiedAt: now,
                    qualificationType: "OWNER_SPACE_RENTED",
                },
            });
        }
    }
}
