import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { bookingId, wantsCleaning, cleanerId, isSelfCleaning } = await req.json();

        // 1. Verify owner owns the space for this booking
        const booking = await prisma.space.findFirst({
            where: { ownerId: session.user.id, bookings: { some: { id: bookingId } } },
            include: { bookings: { where: { id: bookingId } } }
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found or access denied" }, { status: 403 });
        }

        if (wantsCleaning) {
            // Create or update cleaning log
            await (prisma as any).cleaningLog.upsert({
                where: { bookingId },
                update: {
                    cleanerId: cleanerId || null,
                    status: isSelfCleaning ? "SELF_CLEANING" : "PENDING"
                },
                create: {
                    bookingId,
                    cleanerId: cleanerId || null,
                    status: isSelfCleaning ? "SELF_CLEANING" : "PENDING"
                }
            });

            // Mark space as NOT clean
            await (prisma as any).space.update({
                where: { id: booking.id },
                data: { isClean: false }
            });
        } else {
            // Remove cleaning log if exists
            await (prisma as any).cleaningLog.deleteMany({ where: { bookingId } });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Cleaning request error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
