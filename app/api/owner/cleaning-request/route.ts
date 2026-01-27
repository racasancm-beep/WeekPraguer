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

            // Update Booking revenue split if self-cleaning is selected
            if (isSelfCleaning) {
                const b = booking.bookings[0];
                const total = b.totalPrice;
                await (prisma as any).booking.update({
                    where: { id: bookingId },
                    data: {
                        ownerEarnings: total * 0.70,
                        adminEarnings: total * 0.30,
                        cleanerEarnings: 0
                    }
                });
            } else if (cleanerId) {
                // Revert to 60/25/15 if a cleaner is assigned
                const b = booking.bookings[0];
                const total = b.totalPrice;
                await (prisma as any).booking.update({
                    where: { id: bookingId },
                    data: {
                        ownerEarnings: total * 0.60,
                        adminEarnings: total * 0.25,
                        cleanerEarnings: total * 0.15
                    }
                });
            }
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
