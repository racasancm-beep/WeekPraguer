import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const startOfTodayUtc = new Date();
        startOfTodayUtc.setUTCHours(0, 0, 0, 0);

        const bookings = await prisma.booking.findMany({
            where: {
                spaceId: id,
                status: { in: ["CONFIRMED", "PENDING", "COMPLETED"] },
                endTime: {
                    gte: startOfTodayUtc,
                },
            },
            orderBy: {
                startTime: "asc",
            },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                isHourly: true,
                accessCode: true,
                status: true,
                totalPrice: true,
            },
        });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Fetch bookings error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
