import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getBookingBreakdown } from "@/lib/pricing";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const targetUserId = searchParams.get("userId");
        const isAdmin = (session.user as any).role === "ADMIN";

        let resolvedRenterId = (session.user as any).id;
        if (!isAdmin && session.user?.email) {
            const dbUser = await prisma.user.findFirst({
                where: { email: { equals: session.user.email.trim(), mode: "insensitive" } },
                select: { id: true },
            });
            if (dbUser) resolvedRenterId = dbUser.id;
        }

        const baseFilter = isAdmin
            ? targetUserId
                ? { renterId: targetUserId }
                : {}
            : { renterId: resolvedRenterId };

        const whereClause = {
            ...baseFilter,
            OR: [{ accessCode: null }, { accessCode: { not: "OWNER_BLOCK" } }],
        };

        let inspectedUser = null;
        if (isAdmin && targetUserId) {
            inspectedUser = await (prisma as any).user.findUnique({
                where: { id: targetUserId },
                select: { id: true, name: true, email: true, role: true },
            });
        }

        const rawBookings = await prisma.booking.findMany({
            where: whereClause,
            include: {
                space: {
                    include: {
                        owner: { select: { id: true, name: true, email: true, phone: true } },
                    },
                },
                renter: { select: { id: true, name: true, email: true, phone: true, companyName: true } },
                transaction: true,
            },
            orderBy: { createdAt: "desc" },
        });

        const bookings = rawBookings.map((b: any) => {
            const { total, platformFee, ownerNet } = getBookingBreakdown(b);
            return {
                ...b,
                totalPrice: total,
                platformFee,
                commission: platformFee,
                ownerEarnings: ownerNet,
            };
        });

        return NextResponse.json({ bookings, inspectedUser });
    } catch (error) {
        console.error("Renter bookings error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
