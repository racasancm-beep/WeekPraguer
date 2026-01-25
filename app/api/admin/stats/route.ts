import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { startOfMonth, subMonths, endOfMonth, format, addMonths } from "date-fns";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. User Stats (Categories with IDs)
        const users = await (prisma as any).user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        const renters = users.filter((u: any) => u.role === "RENTER");
        const owners = users.filter((u: any) => u.role === "OWNER");
        const cleaners = users.filter((u: any) => u.role === "CLEANER");

        // 2. Space Stats
        const totalSpaces = await (prisma as any).space.count();
        const activeSpacesCount = await (prisma as any).space.count({ where: { active: true } });

        // 3. Activity Trend: Booked vs Available per month (Last 6 months)
        const activityTrend = [];
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            const bookedCount = await (prisma as any).booking.count({
                where: {
                    status: { in: ["CONFIRMED", "COMPLETED"] },
                    startTime: { gte: start, lte: end }
                }
            });

            activityTrend.push({
                month: format(date, "MMM"),
                booked: bookedCount,
                available: totalSpaces // Assuming total spaces is the capacity for now
            });
        }

        // 4. Detailed User Analytics (Activity & Earnings per month)
        // For Renters: Spending
        // For Owners: Earnings
        // For Cleaners: Earnings

        const userAnalytics = {
            renter: {
                totalCount: renters.length,
                avgSpending: 0,
                monthlyActivity: [] as any[]
            },
            owner: {
                totalCount: owners.length,
                totalEarnings: 0,
                monthlyActivity: [] as any[]
            },
            cleaner: {
                totalCount: cleaners.length,
                totalEarnings: 0,
                monthlyActivity: [] as any[]
            }
        };

        // Monthly breakdown for roles (Last 3 months)
        for (let i = 2; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);
            const label = format(date, "MMM");

            // Renter spending
            const renterSpend = await (prisma as any).booking.aggregate({
                where: { status: { in: ["CONFIRMED", "COMPLETED"] }, startTime: { gte: start, lte: end } },
                _sum: { totalPrice: true }
            });

            // Owner earnings
            const ownerEarn = await (prisma as any).booking.aggregate({
                where: { status: { in: ["CONFIRMED", "COMPLETED"] }, startTime: { gte: start, lte: end } },
                _sum: { totalPrice: true }
            });

            // Cleaner earnings (assuming 500 CZK per job for now as we don't have a fee in the log yet, or we can fetch from cleaning requests)
            const cleanerJobs = await (prisma as any).cleaningLog.count({
                where: { status: "COMPLETED", checkOutTime: { gte: start, lte: end } }
            });

            userAnalytics.renter.monthlyActivity.push({ month: label, value: renterSpend._sum.totalPrice || 0 });
            userAnalytics.owner.monthlyActivity.push({ month: label, value: ownerEarn._sum.totalPrice || 0 });
            userAnalytics.cleaner.monthlyActivity.push({ month: label, value: cleanerJobs * 500 });
        }

        // 5. Overall Revenue
        const totalRevenueAgg = await (prisma as any).booking.aggregate({
            where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
            _sum: { totalPrice: true }
        });

        return NextResponse.json({
            users: {
                renters: renters.map((u: any) => ({ id: u.id, name: u.name, email: u.email })),
                owners: owners.map((u: any) => ({ id: u.id, name: u.name, email: u.email })),
                cleaners: cleaners.map((u: any) => ({ id: u.id, name: u.name, email: u.email }))
            },
            totalSpaces,
            activeSpacesCount,
            totalBookings: await (prisma as any).booking.count(),
            totalRevenue: totalRevenueAgg._sum.totalPrice || 0,
            activityTrend,
            userAnalytics
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
