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
        const allSpaces = await (prisma as any).space.findMany({ where: { active: true } });
        const totalSpacesCount = allSpaces.length;

        // 3. Activity Overview & Global Financials
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

        // GLOBAL TOTALS (Matches the Owner Dashboard "Total Revenue" logic)
        const globalFinancials = allBookings.reduce((acc: any, b: any) => {
            const split = getSplit(b);
            acc.totalRenterSpend += split.renter;
            acc.totalOwnerYield += split.owner;
            acc.totalAdminShare += split.admin;
            acc.totalCleanerPayout += split.cleaner;
            return acc;
        }, { totalRenterSpend: 0, totalOwnerYield: 0, totalAdminShare: 0, totalCleanerPayout: 0 });

        // 3. Activity Trend & Monthly Financial Analytics (Full 18-month view)
        const activityTrend = [];
        const today = new Date();

        for (let i = -5; i <= 12; i++) {
            const date = addMonths(today, i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            // Portfolio Capacity Hours
            const monthDays = eachDayOfInterval({ start, end });
            let availableHoursPerSpace = 0;
            monthDays.forEach(d => {
                if (d.getDay() === 5) availableHoursPerSpace += 4;
                if (d.getDay() === 6) availableHoursPerSpace += 13;
                if (d.getDay() === 0) availableHoursPerSpace += 11;
            });

            const monthBookings = allBookings.filter((b: any) => {
                const d = new Date(b.startTime);
                return d >= start && d <= end;
            });

            const bookedHours = monthBookings.reduce((sum: number, b: any) => {
                return sum + (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / (1000 * 60 * 60);
            }, 0);

            const financials = monthBookings.reduce((acc: any, b: any) => {
                const split = getSplit(b);
                acc.renter += split.renter;
                acc.owner += split.owner;
                acc.cleaner += split.cleaner;
                return acc;
            }, { renter: 0, owner: 0, cleaner: 0 });

            activityTrend.push({
                month: format(date, "MMM yy"),
                booked: Math.round(bookedHours),
                available: totalSpacesCount * availableHoursPerSpace,
                renterRevenue: financials.renter,
                ownerRevenue: financials.owner,
                cleanerRevenue: financials.cleaner,
                isFuture: i > 0
            });
        }

        return NextResponse.json({
            users: {
                renters: renters.map((u: any) => ({ id: u.id, name: u.name, email: u.email })),
                owners: owners.map((u: any) => ({ id: u.id, name: u.name, email: u.email })),
                cleaners: cleaners.map((u: any) => ({ id: u.id, name: u.name, email: u.email }))
            },
            totalSpaces: totalSpacesCount,
            totalBookings: allBookings.length,
            totalRevenue: globalFinancials.totalAdminShare,
            globalFinancials,
            activityTrend
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Helper because global scope conflict with node types sometimes
function eachDayOfInterval({ start, end }: { start: Date, end: Date }) {
    const days = [];
    let current = new Date(start);
    while (current <= end) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return days;
}
