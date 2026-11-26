import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import QRCode from "qrcode";
import crypto from "crypto";
import {
    DarkerGenieStats,
    calculateGenieLevel,
    extractReferralCode,
} from "@/lib/referral-utils";

export { calculateGenieLevel, extractReferralCode };
export type { DarkerGenieStats };

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
    const prefix = role === "OWNER" ? "MG-OWN" : role === "SERVICE_OWNER" ? "MG-SERV" : "MG-CUST";
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
