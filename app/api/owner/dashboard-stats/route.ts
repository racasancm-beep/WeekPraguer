import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        // Get all spaces owned by user
        const spaces = await prisma.space.findMany({ where: { ownerId: userId }, select: { id: true } });
        const spaceIds = spaces.map(s => s.id);

        // Get bookings
        const bookings = await prisma.booking.findMany({
            where: { spaceId: { in: spaceIds } },
            include: { space: true, renter: true, cleaningLog: true },
            orderBy: { createdAt: "desc" },
            take: 5
        });

        const totalRevenueAgg = await prisma.booking.aggregate({
            where: { spaceId: { in: spaceIds }, status: "CONFIRMED" },
            _sum: { totalPrice: true },
            _count: true
        });

        const revenue = totalRevenueAgg._sum.totalPrice || 0;
        const count = totalRevenueAgg._count;

        return NextResponse.json({ revenue, count, bookings });
    } catch (error) {
        console.error("Owner stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
