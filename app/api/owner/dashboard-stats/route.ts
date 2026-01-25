import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { startOfMonth, subMonths, endOfMonth, format } from "date-fns";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        const spaces = await (prisma as any).space.findMany({ where: { ownerId: userId }, select: { id: true } });
        const spaceIds = spaces.map((s: any) => s.id);

        const bookings = await (prisma as any).booking.findMany({
            where: { spaceId: { in: spaceIds } },
            include: { space: true, renter: true, cleaningLog: true },
            orderBy: { createdAt: "desc" },
            take: 5
        });

        const totalRevenueAgg = await (prisma as any).booking.aggregate({
            where: { spaceId: { in: spaceIds }, status: { in: ["CONFIRMED", "COMPLETED"] } },
            _sum: { totalPrice: true },
            _count: true
        });

        const totalRevenue = totalRevenueAgg._sum.totalPrice || 0;
        const totalCount = totalRevenueAgg._count;

        // Chart Data: 5 months past + Current month (Total 6 columns)
        // Revenue is allocated to the month of the BOOKING (startTime), not payment/creation date.
        const chartData = [];

        for (let i = 5; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            const monthAgg = await (prisma as any).booking.aggregate({
                where: {
                    spaceId: { in: spaceIds },
                    status: { in: ["CONFIRMED", "COMPLETED"] },
                    startTime: { gte: start, lte: end }
                },
                _sum: { totalPrice: true }
            });

            chartData.push({
                name: format(date, "MMM"),
                total: monthAgg._sum.totalPrice || 0,
                isActual: true,
                isProjection: false
            });
        }

        const revenueThisMonth = chartData[chartData.length - 1].total;
        const revenueLastMonth = chartData[chartData.length - 2].total;

        // Growth calculation
        let growth = 0;
        if (revenueLastMonth > 0) {
            growth = ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
        } else if (revenueThisMonth > 0) {
            growth = 100;
        }

        // Calculate average of previous 5 months for future projection
        const activeMonths = chartData.filter(d => d.total > 0);
        const avgRevenue = activeMonths.length > 0
            ? activeMonths.reduce((sum, item) => sum + item.total, 0) / activeMonths.length
            : 0;

        // Add 1 Future Month as hollow projection
        const nextMonthDate = subMonths(new Date(), -1);
        chartData.push({
            name: format(nextMonthDate, "MMM"),
            total: avgRevenue,
            isActual: false,
            isProjection: true
        });

        return NextResponse.json({
            revenue: totalRevenue,
            revenueThisMonth,
            revenueLastMonth,
            growth: growth.toFixed(1),
            count: totalCount,
            bookings,
            chartData
        });
    } catch (error) {
        console.error("Owner stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
