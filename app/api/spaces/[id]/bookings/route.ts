import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const bookings = await prisma.booking.findMany({
            where: {
                spaceId: id,
                status: "CONFIRMED",
                startTime: {
                    gte: new Date(),
                },
            },
            select: {
                startTime: true,
                endTime: true,
            },
        });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Fetch bookings error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
