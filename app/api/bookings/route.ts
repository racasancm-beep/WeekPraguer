import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(',')[0] : "127.0.0.1";

    try {
        const body = await req.json();
        const { spaceId } = body;

        let slots = body.slots;
        if (!slots && body.startTime) {
            // Backward compatibility for single date select
            slots = [{
                date: body.startTime,
                isFullDay: body.isHourly === false,
                startTime: "09:00",
                endTime: "18:00"
            }];
        }

        if (!slots || slots.length === 0) {
            return NextResponse.json({ error: "No slots provided" }, { status: 400 });
        }

        const space = await prisma.space.findUnique({ where: { id: spaceId } });
        if (!space) throw new Error("Space not found");

        const result = await prisma.$transaction(async (tx) => {
            const bookings = [];

            for (const slot of slots) {
                // Parse "YYYY-MM-DD" safely
                const [y, m, d] = slot.date.split("-").map(Number);
                const [sH, sM] = slot.startTime.split(":").map(Number);
                const [eH, eM] = slot.endTime.split(":").map(Number);

                // Create date objects for validation and storage (using UTC as the platform's baseline)
                const start = new Date(Date.UTC(y, m - 1, d, sH, sM));
                const end = new Date(Date.UTC(y, m - 1, d, eH, eM));

                // Force Friday Full Day to 18-22
                if (start.getUTCDay() === 5 && slot.isFullDay) {
                    start.setUTCHours(18, 0, 0, 0);
                    end.setUTCHours(22, 0, 0, 0);
                }

                // Validation: Friday 18:00 - 22:00
                if (start.getUTCDay() === 5) {
                    if (start.getUTCHours() < 18) {
                        throw new Error("Friday bookings are only available after 18:00");
                    }
                    if (end.getUTCHours() > 22 || (end.getUTCHours() === 22 && end.getUTCMinutes() > 0)) {
                        throw new Error("Friday bookings must end by 22:00");
                    }
                }

                // Validation: Sunday until 20:00
                if (start.getUTCDay() === 0 && (end.getUTCHours() > 20 || (end.getUTCHours() === 20 && end.getUTCMinutes() > 0))) {
                    throw new Error("Sunday bookings must end by 20:00");
                }

                // Check Overlaps
                const overlapping = await tx.booking.findFirst({
                    where: {
                        spaceId,
                        status: { not: "CANCELLED" },
                        OR: [
                            { startTime: { lt: end }, endTime: { gt: start } }
                        ]
                    }
                });

                if (overlapping) {
                    throw new Error(`Space is already booked on ${start.toLocaleDateString()} between ${slot.startTime}-${slot.endTime}`);
                }

                // Calculate Price
                let basePrice = 0;
                if (slot.isFullDay) {
                    basePrice = space.dailyRate;
                } else {
                    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    basePrice = hours * space.hourlyRate;
                }

                const cleaningFee = 500;
                const insurance = basePrice * 0.5; // As per legal terms 50% insurance
                const commission = (basePrice + cleaningFee) * 0.25; // 25% renter commission
                const total = basePrice + cleaningFee + insurance + commission;

                const booking = await tx.booking.create({
                    data: {
                        spaceId,
                        renterId: session.user.id,
                        startTime: start,
                        endTime: end,
                        isHourly: !slot.isFullDay,
                        basePrice,
                        cleaningFee,
                        insurance,
                        totalPrice: total,
                        commission,
                        status: "CONFIRMED",
                        termsAcceptedAt: new Date(),
                        termsAcceptedIp: ip,
                    },
                });

                bookings.push(booking);
            }

            return bookings;
        });

        return NextResponse.json({ success: true, count: result.length });
    } catch (error: any) {
        console.error("Booking error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
