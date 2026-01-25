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
        // 1. User Stats
        const users = await (prisma as any).user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        const renters = users.filter((u: any) => u.role === "RENTER");
        const owners = users.filter((u: any) => u.role === "OWNER");
        const cleaners = users.filter((u: any) => u.role === "CLEANER");

        // 2. Space Stats
        const totalSpaces = await (prisma as any).space.count();
        const activeSpacesCount = await (prisma as any).space.count({ where: { active: true } });

        // 3. Activity Trend
        const activityTrend = [];
        const today = new Date();

        for (let i = -5; i <= 12; i++) {
            const date = addMonths(today, i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            const bookedCount = await (prisma as any).booking.count({
                where: {
                    status: { in: ["CONFIRMED", "COMPLETED"] },
                    startTime: { gte: start, lte: end }
                }
            });

            activityTrend.push({
                month: format(date, "MMM yy"),
                booked: bookedCount,
                available: totalSpaces,
                isFuture: i > 0
            });
        }

        // 4. Detailed User Analytics (60/25/15 Rule)
        const userAnalytics = {
            renter: { totalCount: renters.length, monthlyActivity: [] as any[] },
            owner: { totalCount: owners.length, monthlyActivity: [] as any[] },
            cleaner: { totalCount: cleaners.length, monthlyActivity: [] as any[] }
        };

        const allBookings = await (prisma as any).booking.findMany({
            where: { status: { in: ["CONFIRMED", "COMPLETED"] } }
        });

        const getSplit = (b: any) => {
            const total = b.totalPrice || 0;
            return {
                renter: total,
                owner: b.ownerEarnings > 0 ? b.ownerEarnings : total * 0.60,
                admin: b.adminEarnings > 0 ? b.adminEarnings : total * 0.25,
                cleaner: b.cleanerEarnings > 0 ? b.cleanerEarnings : total * 0.15
            };
        };

        for (let i = 2; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);
            const label = format(date, "MMM");

            const monthBookings = allBookings.filter((b: any) => {
                const d = new Date(b.startTime);
                return d >= start && d <= end;
            });

            const stats = monthBookings.reduce((acc: any, b: any) => {
                const split = getSplit(b);
                acc.renter += split.renter;
                acc.owner += split.owner;
                acc.cleaner += split.cleaner;
                return acc;
            }, { renter: 0, owner: 0, cleaner: 0 });

            userAnalytics.renter.monthlyActivity.push({ month: label, value: stats.renter });
            userAnalytics.owner.monthlyActivity.push({ month: label, value: stats.owner });
            userAnalytics.cleaner.monthlyActivity.push({ month: label, value: stats.cleaner });
        }

        // 5. Total Platform Revenue (Admin's 25% Share)
        const totalAdminRevenue = allBookings.reduce((sum: number, b: any) => sum + getSplit(b).admin, 0);

        return NextResponse.json({
            users: {
                renters: renters.map((u: any) => ({ id: u.id, name: u.name, email: u.email })),
                owners: owners.map((u: any) => ({ id: u.id, name: u.name, email: u.email })),
                cleaners: cleaners.map((u: any) => ({ id: u.id, name: u.name, email: u.email }))
            },
            totalSpaces,
            activeSpacesCount,
            totalBookings: allBookings.length,
            totalRevenue: totalAdminRevenue,
            activityTrend,
            userAnalytics
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
