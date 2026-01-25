import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { startOfMonth, subMonths, endOfMonth, format } from "date-fns";

const prisma = new PrismaClient();

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        const spaces = await prisma.space.findMany({ where: { ownerId: userId }, select: { id: true } });
        const spaceIds = spaces.map(s => s.id);

        const bookings = await prisma.booking.findMany({
            where: { spaceId: { in: spaceIds } },
            include: { space: true, renter: true, cleaningLog: true },
            orderBy: { createdAt: "desc" },
            take: 5
        });

        const totalRevenueAgg = await prisma.booking.aggregate({
            where: { spaceId: { in: spaceIds }, status: { in: ["CONFIRMED", "COMPLETED"] } },
            _sum: { totalPrice: true },
            _count: true
        });

        const revenue = totalRevenueAgg._sum.totalPrice || 0;
        const count = totalRevenueAgg._count;

        // Chart Data: 3 months past, current month, 1 month future
        const chartData = [];

        // Past 3 months + Current
        for (let i = 3; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            const monthAgg = await prisma.booking.aggregate({
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

        // Calculate average of previous 3 months for projection
        const last3Months = chartData.slice(0, 3);
        const avgRevenue = last3Months.reduce((sum, item) => sum + item.total, 0) / 3;

        // Add 1 Future Month as hollow projection
        const nextMonthDate = subMonths(new Date(), -1);
        chartData.push({
            name: format(nextMonthDate, "MMM"),
            total: avgRevenue,
            isActual: false,
            isProjection: true
        });

        return NextResponse.json({ revenue, count, bookings, chartData });
    } catch (error) {
        console.error("Owner stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
