import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { calculatePricing } from "@/lib/pricing";

async function resolveSessionUserId(session: any): Promise<string | null> {
    const rawId = (session?.user as any)?.id;
    const rawEmail = session?.user?.email;

    if (rawId) {
        const byId = await prisma.user.findUnique({ where: { id: rawId }, select: { id: true } });
        if (byId) return byId.id;
    }

    if (rawEmail) {
        const byEmail = await prisma.user.findFirst({
            where: { email: { equals: String(rawEmail).trim(), mode: "insensitive" } },
            select: { id: true },
        });
        if (byEmail) return byEmail.id;
    }

    return null;
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    try {
        const body = await req.json();
        const { spaceId, isOwnerBlock } = body;

        let slots = body.slots;
        if (!slots && body.startTime) {
            slots = [
                {
                    date: body.startTime,
                    isFullDay: body.isHourly === false,
                    startTime: "09:00",
                    endTime: "18:00",
                },
            ];
        }

        if (!slots || slots.length === 0) {
            return NextResponse.json({ error: "No slots provided" }, { status: 400 });
        }

        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            include: { owner: { select: { id: true, email: true } } },
        });
        if (!space) {
            return NextResponse.json({ error: "Space not found", message: "Space not found" }, { status: 404 });
        }

        const userId = (await resolveSessionUserId(session)) || space.ownerId;
        const userRole = (session.user as any)?.role;
        const sessionEmail = session.user?.email?.trim().toLowerCase();
        const isOwnerUser =
            userRole === "OWNER" &&
            (userId === space.ownerId ||
                (Boolean(sessionEmail) && space.owner?.email?.trim().toLowerCase() === sessionEmail));

        if (isOwnerBlock === true && !isOwnerUser) {
            return NextResponse.json(
                { error: "Forbidden: only the owner of this space can block dates", message: "Forbidden: only the owner of this space can block dates" },
                { status: 403 }
            );
        }

        // OWNER CALENDAR BLOCK MODE (No approval needed, immediate CONFIRMED block, 100% occupancy from other sources)
        if (isOwnerUser && isOwnerBlock !== false) {
            const createdBlocks = await prisma.$transaction(async (tx) => {
                const blocks = [];

                for (const slot of slots) {
                    const dateStr = typeof slot.date === "string" ? slot.date : String(slot.date);
                    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
                    const [y, m, d] = datePart.split("-").map(Number);

                    // Block entire day in UTC (00:00:00 to 23:59:59) so 100% of the day is unavailable
                    const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
                    const end = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));

                    const existingBlock = await tx.booking.findFirst({
                        where: {
                            spaceId,
                            status: { notIn: ["CANCELLED", "REJECTED"] },
                            accessCode: "OWNER_BLOCK",
                            startTime: { lte: end },
                            endTime: { gte: start },
                        },
                    });

                    if (existingBlock) {
                        blocks.push(existingBlock);
                        continue;
                    }

                    const block = await tx.booking.create({
                        data: {
                            spaceId,
                            renterId: userId,
                            startTime: start,
                            endTime: end,
                            isHourly: false,
                            basePrice: 0,
                            cleaningFee: 0,
                            insurance: 0,
                            totalPrice: 0,
                            commission: 0,
                            ownerEarnings: 0,
                            adminEarnings: 0,
                            status: "CONFIRMED",
                            accessCode: "OWNER_BLOCK",
                            termsAcceptedAt: new Date(),
                            termsAcceptedIp: ip,
                        },
                    });

                    blocks.push(block);
                }

                return blocks;
            });

            return NextResponse.json({
                success: true,
                isOwnerBlock: true,
                count: createdBlocks.length,
                blocks: createdBlocks,
            });
        }

        // STANDARD RENTER BOOKING MODE
        const result = await prisma.$transaction(async (tx) => {
            const bookings = [];

            for (const slot of slots) {
                const dateStr = typeof slot.date === "string" ? slot.date : String(slot.date);
                const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
                const [y, m, d] = datePart.split("-").map(Number);
                const [sH, sM] = (slot.startTime || "09:00").split(":").map(Number);
                const [eH, eM] = (slot.endTime || "18:00").split(":").map(Number);

                const start = slot.isFullDay
                    ? new Date(Date.UTC(y, m - 1, d, 8, 0, 0))
                    : new Date(Date.UTC(y, m - 1, d, sH, sM));
                const end = slot.isFullDay
                    ? new Date(Date.UTC(y, m - 1, d, 20, 0, 0))
                    : new Date(Date.UTC(y, m - 1, d, eH, eM));

                const dayStart = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
                const dayEnd = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));

                // Check if the day is blocked by Owner or has overlapping confirmed/pending bookings
                const overlapping = await tx.booking.findFirst({
                    where: {
                        spaceId,
                        status: { notIn: ["CANCELLED", "REJECTED"] },
                        OR: [
                            { startTime: { lt: end }, endTime: { gt: start } },
                            {
                                accessCode: "OWNER_BLOCK",
                                startTime: { lte: dayEnd },
                                endTime: { gte: dayStart },
                            },
                        ],
                    },
                });

                if (overlapping) {
                    throw new Error(
                        overlapping.accessCode === "OWNER_BLOCK"
                            ? `Space is blocked and not available for booking on ${datePart} (100% occupancy from other sources)`
                            : `Space is already booked on ${datePart} between ${slot.startTime} - ${slot.endTime}`
                    );
                }

                const pricing = calculatePricing(
                    slot.isFullDay
                        ? space.dailyRate
                        : ((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * space.hourlyRate,
                    Boolean((space as any).selfCleaning)
                );

                const booking = await tx.booking.create({
                    data: {
                        spaceId,
                        renterId: userId,
                        startTime: start,
                        endTime: end,
                        isHourly: !slot.isFullDay,
                        basePrice: pricing.basePrice,
                        cleaningFee: pricing.cleaningFee,
                        insurance: pricing.insurance,
                        totalPrice: pricing.totalPrice,
                        commission: pricing.commission,
                        ownerEarnings: pricing.ownerPayout,
                        adminEarnings: pricing.commission,
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
        return NextResponse.json(
            { error: error.message || "Internal Server Error", message: error.message || "Internal Server Error" },
            { status: 400 }
        );
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
        }

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { space: { include: { owner: { select: { email: true } } } } },
        });

        if (!booking) {
            return NextResponse.json({ error: "Block not found" }, { status: 404 });
        }

        const userId = await resolveSessionUserId(session);
        const role = (session.user as any)?.role;
        const sessionEmail = session.user?.email?.trim().toLowerCase();
        const isAuthorized =
            role === "OWNER" &&
            Boolean(
                (userId && booking.space.ownerId === userId) ||
                (sessionEmail && booking.space.owner?.email?.trim().toLowerCase() === sessionEmail)
            );

        if (!isAuthorized) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.booking.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete block error:", error);
        return NextResponse.json({ error: error.message || "Failed to remove block" }, { status: 500 });
    }
}
