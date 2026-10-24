import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const targetUserId = searchParams.get("userId");
        const isAdmin = (session.user as any).role === "ADMIN";

        const whereClause = isAdmin
            ? targetUserId
                ? { renterId: targetUserId }
                : {}
            : { renterId: (session.user as any).id };

        let inspectedUser = null;
        if (isAdmin && targetUserId) {
            inspectedUser = await (prisma as any).user.findUnique({
                where: { id: targetUserId },
                select: { id: true, name: true, email: true, role: true }
            });
        }

        const bookings = await prisma.booking.findMany({
            where: whereClause,
            include: {
                space: true,
                renter: { select: { id: true, name: true, email: true } }
            },
            orderBy: { startTime: "desc" }
        });

        return NextResponse.json({ bookings, inspectedUser });
    } catch (error) {
        console.error("Renter bookings error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
