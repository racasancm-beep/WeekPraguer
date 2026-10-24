import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { calculatePricing } from "@/lib/pricing";

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
                const dateStr = typeof slot.date === "string" ? slot.date : String(slot.date); const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr; const [y, m, d] = datePart.split("-").map(Number);
                const [sH, sM] = slot.startTime.split(":").map(Number);
                const [eH, eM] = slot.endTime.split(":").map(Number);

                // Create date objects for validation and storage (using UTC as the platform's baseline)
                const start = new Date(Date.UTC(y, m - 1, d, sH, sM));
                const end = new Date(Date.UTC(y, m - 1, d, eH, eM));

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
                    throw new Error(`Space is already booked on ${start.toLocaleDateString()} between ${slot.startTime} -${slot.endTime} `);
                }

                // Calculate Price using lib/pricing (15% cleaner rule)
                const pricing = calculatePricing(
                    slot.isFullDay ? space.dailyRate : ((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * space.hourlyRate,
                    (space as any).selfCleaning
                );

                const booking = await (tx.booking as any).create({
                    data: {
                        spaceId,
                        renterId: session.user.id,
                        startTime: start,
                        endTime: end,
                        isHourly: !slot.isFullDay,
                        basePrice: pricing.basePrice,
                        cleaningFee: pricing.cleaningFee,
                        insurance: pricing.insurance,
                        totalPrice: pricing.totalPrice,
                        commission: pricing.commission,
                        ownerEarnings: pricing.ownerPayout,
                        adminEarnings: pricing.commission, // Admin takes commission 
                        status: "PENDING",
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



