import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { action } = body;

        const booking = await prisma.booking.findUnique({
            where: { id }
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        if (booking.renterId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
                }
            });
            return NextResponse.json({ success: true, booking: updatedBooking });
        } else if (action === "reject") {
            const updatedBooking = await prisma.booking.update({
                where: { id },
                data: {
                    status: "REJECTED",
                    proposedStartTime: null,
                    proposedEndTime: null,
                }
            });
            return NextResponse.json({ success: true, booking: updatedBooking });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        console.error("Renter booking update error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
