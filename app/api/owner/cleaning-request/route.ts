import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { bookingId, wantsCleaning } = await req.json();

        // 1. Verify owner owns the space for this booking
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { space: true }
        });

        if (!booking || booking.space.ownerId !== session.user.id) {
            return NextResponse.json({ error: "Booking not found or access denied" }, { status: 403 });
        }

        if (wantsCleaning) {
            // Create cleaning log if it doesn't exist
            await prisma.cleaningLog.upsert({
                where: { bookingId },
                update: {}, // Do nothing if exists
                create: { bookingId }
            });
        } else {
            // Remove cleaning log if exists and NOT assigned yet
            const log = await prisma.cleaningLog.findUnique({ where: { bookingId } });
            if (log && log.cleanerId) {
                return NextResponse.json({ error: "Cannot remove cleaning once a cleaner is assigned" }, { status: 400 });
            }
            if (log) {
                await prisma.cleaningLog.delete({ where: { bookingId } });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Cleaning request error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
