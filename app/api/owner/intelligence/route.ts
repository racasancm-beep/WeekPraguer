import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { startOfMonth, endOfMonth, subMonths, eachWeekendOfInterval } from "date-fns";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || (role !== "OWNER" && role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const targetUserId = searchParams.get("userId");

        const spaceFilter =
            role === "ADMIN"
                ? targetUserId
                    ? { ownerId: targetUserId }
                    : {}
                : { ownerId: (session.user as any).id };

        const spaces = await prisma.space.findMany({ where: spaceFilter });
        const spaceIds = spaces.map(s => s.id);

        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        const weekends = eachWeekendOfInterval({ start, end });
        const totalSlots = weekends.length * spaceIds.length;

        const bookings = await prisma.booking.findMany({
            where: {
                spaceId: { in: spaceIds },
                status: { in: ["CONFIRMED", "COMPLETED"] },
                startTime: { gte: start, lte: end }
            }
        });

        const utilizationRate = totalSlots > 0 ? (bookings.length / totalSlots) * 100 : 0;

        const threeMonthsAgo = subMonths(now, 3);
        const pastBookings = await prisma.booking.findMany({
            where: {
                spaceId: { in: spaceIds },
                status: { in: ["CONFIRMED", "COMPLETED"] },
                startTime: { gte: threeMonthsAgo }
            }
        });

        const totalRevenue = pastBookings.reduce((acc, b) => acc + b.totalPrice, 0);
        const avgMonthlyRevenue = totalRevenue / 3;
        const nextMonthForecast = avgMonthlyRevenue * 1.1;

        const revenueHistory = [
            { month: "Oct", revenue: Math.round(totalRevenue * 0.3) },
            { month: "Nov", revenue: Math.round(totalRevenue * 0.3) },
            { month: "Dec", revenue: Math.round(totalRevenue * 0.4) },
        ];

        return NextResponse.json({
            utilization: Math.round(utilizationRate),
            forecast: Math.round(nextMonthForecast),
            history: revenueHistory,
            spacesCount: spaceIds.length
        });

    } catch (error) {
        console.error("Intelligence error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
