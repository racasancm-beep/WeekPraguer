import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. User Stats
        const totalUsers = await prisma.user.count();
        const usersByRole = await prisma.user.groupBy({
            by: ['role'],
            _count: true
        });

        // 2. Space Stats
        const totalSpaces = await prisma.space.count({ where: { active: true } });

        // 3. Booking Stats
        const totalBookings = await prisma.booking.count();
        const completedBookings = await prisma.booking.count({ where: { status: 'COMPLETED' } });

        // 4. Revenue Stats
        const revenueAgg = await prisma.booking.aggregate({
            where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
            _sum: { totalPrice: true }
        });
        const totalRevenue = revenueAgg._sum.totalPrice || 0;

        // 5. Recent Activity
        const recentBookings = await prisma.booking.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: {
                renter: { select: { name: true, email: true } },
                space: { select: { name: true } }
            }
        });

        const recentSpaces = await prisma.space.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { owner: { select: { name: true, email: true } } }
        });

        const recentUsers = await prisma.user.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: { name: true, email: true, createdAt: true }
        });

        // Combine recent activity
        const recentActivity = [
            ...recentBookings.map(b => ({
                type: 'booking',
                title: `New booking from ${b.renter.name || b.renter.email}`,
                detail: b.space.name,
                value: `+${b.totalPrice.toLocaleString()} CZK`,
                time: b.createdAt
            })),
            ...recentSpaces.map(s => ({
                type: 'space',
                title: `New space listed: ${s.name}`,
                detail: `Owner: ${s.owner.name || s.owner.email}`,
                value: 'Just now',
                time: s.createdAt
            })),
            ...recentUsers.map(u => ({
                type: 'user',
                title: 'New user registered',
                detail: u.email,
                value: '',
                time: u.createdAt
            }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

        return NextResponse.json({
            totalUsers,
            usersByRole,
            totalSpaces,
            totalBookings,
            totalRevenue,
            recentActivity
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
