import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

async function resolveOwnerUserId(session: any): Promise<string | null> {
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
    const role = (session?.user as any)?.role;

    // Strictly only OWNER profiles are allowed to approve or propose alternatives (ADMIN is never allowed)
    if (!session || !session.user || role !== "OWNER") {
        return NextResponse.json(
            { error: "Only the owner profile of this space can approve booking requests." },
            { status: 403 }
        );
    }

    try {
        const body = await req.json();
        const { action, proposedStartTime, proposedEndTime } = body;
        const resolvedParams = await params;
        const bookingId = resolvedParams.id;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                space: {
                    include: {
                        owner: { select: { id: true, email: true } },
                    },
                },
            },
        });

        if (!booking) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const ownerUserId = await resolveOwnerUserId(session);
        const sessionEmail = session.user.email?.trim().toLowerCase();
        const isSpaceOwner =
            Boolean(ownerUserId && booking.space.ownerId === ownerUserId) ||
            Boolean(sessionEmail && booking.space.owner?.email?.trim().toLowerCase() === sessionEmail);

        if (!isSpaceOwner) {
            return NextResponse.json(
                { error: "Forbidden: Only the owner of this space can approve this booking." },
                { status: 403 }
            );
        }

        if (action === "APPROVE") {
            const updated = await prisma.booking.update({
                where: { id: bookingId },
                data: { status: "CONFIRMED" },
            });
            return NextResponse.json({
                success: true,
                status: updated.status,
                message: "Reservation request approved. Renter notified to proceed with payment.",
            });
        }

        if (action === "REJECT") {
            const updated = await prisma.booking.update({
                where: { id: bookingId },
                data: { status: "REJECTED" },
            });
            return NextResponse.json({
                success: true,
                status: updated.status,
            });
        }

        if (action === "SUGGEST") {
            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: "OWNER_PROPOSED",
                    proposedStartTime: new Date(proposedStartTime),
                    proposedEndTime: new Date(proposedEndTime),
                },
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
