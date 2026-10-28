import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { action, proofOfPayment, paymentMethod } = body;

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { transaction: true },
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const userId = await resolveSessionUserId(session);
        const isAdmin = (session.user as any)?.role === "ADMIN";
        if (!isAdmin && booking.renterId !== userId && booking.renterId !== (session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Submit Proof of Payment -> transitions a CONFIRMED booking into RESERVED status
        if (action === "submit_payment_proof") {
            if (booking.status !== "CONFIRMED" && booking.status !== "COMPLETED") {
                return NextResponse.json(
                    { error: "Booking must be approved/confirmed by the owner before submitting payment proof." },
                    { status: 400 }
                );
            }

            const cleanProof = String(proofOfPayment || "").trim();
            if (!cleanProof) {
                return NextResponse.json(
                    { error: "Please provide a valid proof of payment reference or receipt." },
                    { status: 400 }
                );
            }

            const methodPrefix = paymentMethod ? `${paymentMethod}:` : "PROOF:";
            const paymentIdentifier = cleanProof.startsWith("PROOF:") || cleanProof.includes(":")
                ? cleanProof
                : `${methodPrefix}${cleanProof}`;

            const generatedPin =
                booking.accessCode && booking.accessCode !== "OWNER_BLOCK"
                    ? booking.accessCode
                    : String(Math.floor(100000 + Math.random() * 900000));

            const updatedBooking = await prisma.$transaction(async (tx) => {
                await tx.transaction.upsert({
                    where: { bookingId: id },
                    create: {
                        bookingId: id,
                        amount: booking.totalPrice,
                        currency: "RON",
                        stripePaymentId: paymentIdentifier,
                        paymentStatus: "COMPLETED",
                    },
                    update: {
                        amount: booking.totalPrice,
                        stripePaymentId: paymentIdentifier,
                        paymentStatus: "COMPLETED",
                    },
                });

                return tx.booking.update({
                    where: { id },
                    data: {
                        paymentId: paymentIdentifier,
                        accessCode: generatedPin,
                    },
                    include: {
                        space: true,
                        transaction: true,
                    },
                });
            });

            return NextResponse.json({
                success: true,
                effectiveStatus: "RESERVED",
                booking: updatedBooking,
            });
        }

        if (booking.status !== "OWNER_PROPOSED") {
            return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
        }

        if (action === "approve") {
            const updatedBooking = await prisma.booking.update({
                where: { id },
                data: {
                    status: "CONFIRMED",
                    startTime: booking.proposedStartTime!,
                    endTime: booking.proposedEndTime!,
                    proposedStartTime: null,
                    proposedEndTime: null,
                },
            });
            return NextResponse.json({ success: true, booking: updatedBooking });
        } else if (action === "reject") {
            const updatedBooking = await prisma.booking.update({
                where: { id },
                data: {
                    status: "REJECTED",
                    proposedStartTime: null,
                    proposedEndTime: null,
                },
            });
            return NextResponse.json({ success: true, booking: updatedBooking });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        console.error("Renter booking update error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
