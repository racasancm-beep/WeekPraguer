import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { checkAvailability } from "@/lib/booking/availability";
import { addHours } from "date-fns";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get IP from headers (Next.js/Node specific)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(',')[0] : "127.0.0.1";

    try {
        const { spaceId, startTime } = await req.json();

        const start = new Date(startTime);
        const isFriday = start.getDay() === 5;

        if (isFriday) {
            start.setHours(18, 0, 0, 0);
        } else {
            start.setHours(9, 0, 0, 0);
        }

        const end = new Date(start);
        if (isFriday) {
            end.setHours(23, 59, 0, 0); // Friday night slot
        } else {
            end.setHours(18, 0, 0, 0);
        }

        // Use interactive transaction for Concurrency Control
        const result = await prisma.$transaction(async (tx) => {
            // 1. Re-check availability INSIDE transaction
            // Note: In strict SQL, we might need row locking (SELECT FOR UPDATE). 
            // Prisma doesn't fully support explicit locking in high-level client yet without raw queries.
            // But wrapping find + create in transaction is better than nothing.

            const overlapping = await tx.booking.findFirst({
                where: {
                    spaceId,
                    status: { not: "CANCELLED" },
                    OR: [
                        {
                            startTime: { lt: end },
                            endTime: { gt: start },
                        },
                    ],
                }
            });

            if (overlapping) {
                throw new Error("Space is already booked for this time.");
            }

            // 2. Fetch space details
            const space = await tx.space.findUnique({ where: { id: spaceId } });
            if (!space) throw new Error("Space not found");

            // 3. Create Booking
            const booking = await tx.booking.create({
                data: {
                    spaceId,
                    renterId: session.user.id,
                    startTime: start,
                    endTime: end,
                    basePrice: space.dailyRate,
                    cleaningFee: 500,
                    insurance: 100,
                    totalPrice: space.dailyRate + 500 + 100,
                    commission: (space.dailyRate + 500 + 100) * 0.15,
                    status: "CONFIRMED",
                    termsAcceptedAt: new Date(),
                    termsAcceptedIp: ip,
                },
            });

            // 4. Cleaning Trigger (Operations Automation)
            // REMOVED: Owners will now choose if they want a cleaner in their dashboard
            /*
            await tx.cleaningLog.create({
                data: {
                    bookingId: booking.id,
                }
            });
            */

            return booking;
        });

        return NextResponse.json({ success: true, bookingId: result.id });
    } catch (error: any) {
        console.error("Booking error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
