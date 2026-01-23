import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const bookings = await prisma.booking.findMany({
            where: { renterId: session.user.id },
            include: { space: true },
            orderBy: { startTime: "desc" }
        });

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error("Renter bookings error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
