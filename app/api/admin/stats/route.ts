import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { startOfMonth, endOfMonth, format, addMonths } from "date-fns";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (process.env.NODE_ENV === "production" && (!session || (session.user as any)?.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch all users, spaces, and bookings in parallel (single round-trip)
        const [users, allSpaces, allBookings] = await Promise.all([
            (prisma as any).user.findMany({
                orderBy: { createdAt: "desc" }
            }),
            (prisma as any).space.findMany({
                orderBy: { createdAt: "desc" }
            }),
            (prisma as any).booking.findMany({
                orderBy: { startTime: "desc" }
            }),
        ]);

        const spaceMap = new Map<string, any>();
        allSpaces.forEach((s: any) => spaceMap.set(s.id, s));

        const activeSpaces = allSpaces.filter((s: any) => s.active !== false);
        const totalSpacesCount = activeSpaces.length;

        const confirmedBookings = allBookings.filter(
            (b: any) => b.status === "CONFIRMED" || b.status === "COMPLETED"
        );

        const getSplit = (b: any) => {
            const total = b.totalPrice || 0;
            const space = spaceMap.get(b.spaceId);
            const isSelfClean = space?.selfCleaning || false;

            return {
                renter: total,
                owner: b.ownerEarnings > 0 ? b.ownerEarnings : (isSelfClean ? total * 0.70 : total * 0.60),
                admin: b.adminEarnings > 0 ? b.adminEarnings : (isSelfClean ? total * 0.30 : total * 0.25)
            };
        };

        const formatProfile = (u: any) => {
            const userSpaces = allSpaces.filter((s: any) => s.ownerId === u.id);
            const userSpaceIds = new Set(userSpaces.map((s: any) => s.id));

            const renterBookings = allBookings.filter((b: any) => b.renterId === u.id);
            const renterConfirmed = renterBookings.filter(
                (b: any) => b.status === "CONFIRMED" || b.status === "COMPLETED"
            );
            const renterSpend = renterConfirmed.reduce((s: number, b: any) => s + (b.totalPrice || 0), 0);

            const ownerBookings = allBookings.filter((b: any) => userSpaceIds.has(b.spaceId));
            const ownerConfirmed = ownerBookings.filter(
                (b: any) => b.status === "CONFIRMED" || b.status === "COMPLETED"
            );
            const ownerEarned = ownerConfirmed.reduce((s: number, b: any) => s + getSplit(b).owner, 0);

            const relevantBookings = u.role === "OWNER" ? ownerBookings : renterBookings;

            return {
                id: u.id,
                name: u.name || u.email?.split("@")[0] || "User",
                email: u.email,
                role: u.role,
                phone: u.phone || "—",
                companyName: u.companyName || "—",
                billingAddress: u.billingAddress || "—",
                verified: Boolean(u.verified),
                subscriptionTier: u.subscriptionTier || "FREE",
                createdAt: u.createdAt,
                spacesCount: userSpaces.length,
                bookingsCount: relevantBookings.length,
                totalRenterSpend: Math.round(renterSpend),
                totalOwnerEarned: Math.round(ownerEarned),
                ownedSpaces: userSpaces.map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    city: s.city,
                    hourlyRate: s.hourlyRate,
                    dailyRate: s.dailyRate,
                    capacity: s.capacity,
                    active: s.active,
                })),
                recentBookings: relevantBookings.slice(0, 8).map((b: any) => {
                    const sp = spaceMap.get(b.spaceId);
                    return {
                        id: b.id,
                        spaceName: sp?.name || "Space",
                        city: sp?.city || "",
                        startTime: b.startTime,
                        endTime: b.endTime,
                        totalPrice: b.totalPrice,
                        status: b.status,
                    };
                }),
            };
        };

        const allProfiles = users.map(formatProfile);
        const renters = allProfiles.filter((u: any) => u.role === "RENTER");
        const owners = allProfiles.filter((u: any) => u.role === "OWNER");
        const admins = allProfiles.filter((u: any) => u.role === "ADMIN");

        // GLOBAL TOTALS
        const globalFinancials = confirmedBookings.reduce((acc: any, b: any) => {
            const split = getSplit(b);
            acc.totalRenterSpend += split.renter;
            acc.totalOwnerYield += split.owner;
            acc.totalAdminShare += split.admin;
            return acc;
        }, { totalRenterSpend: 0, totalOwnerYield: 0, totalAdminShare: 0 });

        // 18-month Activity Trend & Financial Analytics
        const activityTrend = [];
        const today = new Date();

        for (let i = -5; i <= 12; i++) {
            const date = addMonths(today, i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            const monthDays = eachDayOfInterval({ start, end });
            let availableHoursPerSpace = 0;
            monthDays.forEach(d => {
                if (d.getDay() === 5) availableHoursPerSpace += 4;
                if (d.getDay() === 6) availableHoursPerSpace += 13;
                if (d.getDay() === 0) availableHoursPerSpace += 11;
            });

            const monthBookings = confirmedBookings.filter((b: any) => {
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
                acc.admin += split.admin;
                return acc;
            }, { renter: 0, owner: 0, admin: 0 });

            activityTrend.push({
                month: format(date, "MMM yy"),
                booked: Math.round(bookedHours),
                available: totalSpacesCount * availableHoursPerSpace,
                renterRevenue: Math.round(financials.renter),
                ownerRevenue: Math.round(financials.owner),
                adminRevenue: Math.round(financials.admin),
                isFuture: i > 0
            });
        }

        return NextResponse.json({
            users: {
                renters,
                owners,
                admins,
                all: allProfiles,
            },
            totalSpaces: totalSpacesCount,
            totalBookings: confirmedBookings.length,
            totalRevenue: Math.round(globalFinancials.totalAdminShare),
            globalFinancials: {
                totalRenterSpend: Math.round(globalFinancials.totalRenterSpend),
                totalOwnerYield: Math.round(globalFinancials.totalOwnerYield),
                totalAdminShare: Math.round(globalFinancials.totalAdminShare),
            },
            activityTrend
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
    }
}

function eachDayOfInterval({ start, end }: { start: Date, end: Date }) {
    const days = [];
    let current = new Date(start);
    while (current <= end) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return days;
}
