import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { startOfMonth, subMonths, endOfMonth, format, addMonths, subDays } from "date-fns";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        const spaces = await (prisma as any).space.findMany({ where: { ownerId: userId }, select: { id: true } });
        const spaceIds = spaces.map((s: any) => s.id);

        const rawBookings = await (prisma as any).booking.findMany({
            where: { spaceId: { in: spaceIds }, status: { in: ["CONFIRMED", "COMPLETED"] } },
            include: { space: true, renter: true, cleaningLog: true },
            orderBy: { startTime: "asc" }
        });

        // Use ownerEarnings if available, otherwise fallback to split rule based on self-cleaning preference
        const calculateOwnerEarnings = (b: any) => {
            if (b.ownerEarnings > 0) return b.ownerEarnings;
            return b.space?.selfCleaning ? b.totalPrice * 0.70 : b.totalPrice * 0.60;
        };

        const totalRevenue = rawBookings.reduce((sum: number, b: any) => sum + calculateOwnerEarnings(b), 0);
        const totalCount = rawBookings.length;

        // Dynamic Booking Trend (+X since last week)
        const lastWeekDate = subDays(new Date(), 7);
        const newBookingsLastWeek = await (prisma as any).booking.count({
            where: {
                spaceId: { in: spaceIds },
                createdAt: { gte: lastWeekDate }
            }
        });

        // Chart Data: 3 months back + current month + 3 months forward (Total 7 months)
        const chartData = [];
        const today = new Date();

        for (let i = -3; i <= 3; i++) {
            const date = addMonths(today, i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            const monthBookings = rawBookings.filter((b: any) => {
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

        // Growth calculation
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
            bookings: rawBookings.reverse().slice(0, 5), // Most recent by date
            chartData
        });
    } catch (error) {
        console.error("Owner stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
