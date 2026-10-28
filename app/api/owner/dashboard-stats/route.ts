import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { startOfMonth, endOfMonth, format, addMonths, subDays } from "date-fns";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || (role !== "OWNER" && role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const targetUserId = searchParams.get("userId");

        // If ADMIN is viewing without a specific userId, show aggregated stats across ALL owners/spaces
        let resolvedOwnerId = (session.user as any).id;
        if (role !== "ADMIN" && session.user?.email) {
            const dbOwner = await prisma.user.findFirst({
                where: { email: { equals: session.user.email.trim(), mode: "insensitive" } },
                select: { id: true },
            });
            if (dbOwner) resolvedOwnerId = dbOwner.id;
        }

        const spaceFilter =
            role === "ADMIN"
                ? targetUserId
                    ? { ownerId: targetUserId }
                    : {}
                : { ownerId: resolvedOwnerId };

        const spaces = await (prisma as any).space.findMany({ where: spaceFilter, select: { id: true } });
        const spaceIds = spaces.map((s: any) => s.id);

        let inspectedUser = null;
        if (role === "ADMIN" && targetUserId) {
            inspectedUser = await (prisma as any).user.findUnique({
                where: { id: targetUserId },
                select: { id: true, name: true, email: true, role: true }
            });
        }

        const pendingBookings = await (prisma as any).booking.findMany({
            where: {
                spaceId: { in: spaceIds },
                status: { in: ["PENDING", "OWNER_PROPOSED"] },
                OR: [{ accessCode: null }, { accessCode: { not: "OWNER_BLOCK" } }],
            },
            include: {
                space: {
                    include: {
                        owner: { select: { id: true, name: true, email: true } },
                    },
                },
                renter: true,
                transaction: true,
            },
            orderBy: { createdAt: "desc" }
        });

        const rawBookings = await (prisma as any).booking.findMany({
            where: { spaceId: { in: spaceIds }, status: { in: ["CONFIRMED", "COMPLETED", "REJECTED"] } },
            include: { space: true, renter: true, transaction: true },
            orderBy: { startTime: "asc" }
        });

        const calculateOwnerEarnings = (b: any) => {
            if (b.accessCode === "OWNER_BLOCK") return 0;
            if (typeof b.basePrice === "number" && b.basePrice > 0) {
                return Math.round(b.basePrice * 100) / 100;
            }
            if (typeof b.totalPrice === "number" && b.totalPrice > 0) {
                const ins = typeof b.insurance === "number" && b.insurance > 0 ? b.insurance : 0;
                const net = b.totalPrice - ins;
                return Math.round((net > 0 ? net : b.totalPrice) * 100) / 100;
            }
            if (b.space && b.startTime && b.endTime) {
                const hours = Math.max(
                    1,
                    Math.round(
                        (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / (1000 * 60 * 60)
                    )
                );
                return b.isHourly === false && b.space.dailyRate
                    ? b.space.dailyRate
                    : hours * (b.space.hourlyRate || 0);
            }
            return 0;
        };

        const normalizeBookingWithoutPlatformFee = (b: any) => {
            const amount = calculateOwnerEarnings(b);
            return {
                ...b,
                basePrice: amount,
                totalPrice: amount,
                ownerEarnings: amount,
                commission: 0,
                insurance: 0,
                cleaningFee: 0,
                adminEarnings: 0,
            };
        };

        const normalizedPendingBookings = pendingBookings.map(normalizeBookingWithoutPlatformFee);
        const normalizedRawBookings = rawBookings.map(normalizeBookingWithoutPlatformFee);

        const totalRevenue = normalizedRawBookings.reduce((sum: number, b: any) => sum + calculateOwnerEarnings(b), 0);
        const totalCount = normalizedRawBookings.filter((b: any) => b.accessCode !== "OWNER_BLOCK").length;

        const lastWeekDate = subDays(new Date(), 7);
        const newBookingsLastWeek = await (prisma as any).booking.count({
            where: {
                spaceId: { in: spaceIds },
                createdAt: { gte: lastWeekDate }
            }
        });

        const chartData = [];
        const today = new Date();

        for (let i = -3; i <= 3; i++) {
            const date = addMonths(today, i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            const monthBookings = normalizedRawBookings.filter((b: any) => {
                const d = new Date(b.startTime);
                return d >= start && d <= end;
            });

            const amount = monthBookings.reduce((sum: number, b: any) => sum + calculateOwnerEarnings(b), 0);

            chartData.push({
                name: format(date, "MMM"),
                total: amount,
                isActual: i <= 0 || amount > 0,
                isProjection: i > 0 && amount === 0
            });
        }

        const currentMonthIdx = 3;
        const revenueThisMonth = chartData[currentMonthIdx].total;
        const revenueLastMonth = chartData[currentMonthIdx - 1].total;

        let growth = 0;
        if (revenueLastMonth > 0) {
            growth = ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
        } else if (revenueThisMonth > 0) {
            growth = 100;
        }

        const activeMonths = chartData.filter(d => d.total > 0 && d.isActual);
        const avgRevenue = activeMonths.length > 0
            ? activeMonths.reduce((sum, item) => sum + item.total, 0) / activeMonths.length
            : 0;

        chartData.forEach(d => {
            if (d.isProjection) d.total = avgRevenue;
        });

        return NextResponse.json({
            revenue: totalRevenue,
            revenueThisMonth,
            revenueLastMonth,
            growth: growth.toFixed(1),
            count: totalCount,
            newBookingsTrend: newBookingsLastWeek,
            pendingBookings: normalizedPendingBookings,
            inspectedUser,
            bookings: [...normalizedRawBookings].sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ),
            chartData
        });
    } catch (error) {
        console.error("Owner stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
