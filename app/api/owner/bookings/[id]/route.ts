import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { checkAndQualifyReferralsForBooking } from "@/lib/referral";
import { sendEmail } from "@/lib/email-service";

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

    // Strictly only OWNER and SERVICE_OWNER profiles are allowed to approve or propose alternatives (ADMIN is never allowed)
    if (!session || !session.user || (role !== "OWNER" && role !== "SERVICE_OWNER")) {
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
                        owner: { select: { id: true, email: true, name: true } },
                    },
                },
                renter: { select: { id: true, email: true, name: true } },
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

        // Ensure conversation exists so chat communication is immediately connected to the renter profile
        const conversation = await prisma.conversation.upsert({
            where: { bookingId },
            create: {
                bookingId,
                spaceId: booking.spaceId,
                ownerId: booking.space.ownerId,
                customerId: booking.renterId,
                status: "ACTIVE",
            },
            update: {},
        });

        if (action === "APPROVE") {
            const updated = await prisma.booking.update({
                where: { id: bookingId },
                data: { status: "CONFIRMED" },
            });

            // Send notification message into chat to renter
            try {
                await prisma.chatMessage.create({
                    data: {
                        conversationId: conversation.id,
                        senderRole: "SYSTEM",
                        isAutomated: true,
                        automatedType: "BOOKING_APPROVED",
                        content: `🎉 Gazda a aprobat cererea de rezervare pentru ${booking.space.name}! Te rugăm să continui cu plata pentru a finaliza rezervarea.`,
                        readByCustomer: false,
                        readByOwner: true,
                    },
                });
            } catch (chatErr) {
                console.error("Chat message create error:", chatErr);
            }

            // Send email notification to renter (the profile who raised the booking)
            if (booking.renter?.email) {
                sendEmail({
                    to: booking.renter.email,
                    subject: `Cerere aprobată: Rezervarea ta pentru ${booking.space.name} a fost confirmată de gazdă!`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                            <h2 style="color: #008080;">Cererea ta de rezervare a fost aprobată!</h2>
                            <p>Gazda pentru <strong>${booking.space.name}</strong> a confirmat disponibilitatea.</p>
                            <p>Te rugăm să accesezi panoul tău MyGenie pentru a finaliza plata și pentru a comunica direct cu gazda pe chat.</p>
                            <p style="margin-top: 20px; font-size: 12px; color: #64748b;">Echipa MyGenie • <a href="https://www.mygenieurope.com">www.mygenieurope.com</a></p>
                        </div>
                    `,
                }).catch(console.error);
            }

            // Trigger referral qualification check
            try {
                await checkAndQualifyReferralsForBooking({
                    renterId: booking.renterId,
                    ownerId: booking.space.ownerId,
                    bookingId: updated.id,
                });
            } catch (err) {
                console.error("Referral qualification error:", err);
            }

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

            try {
                await prisma.chatMessage.create({
                    data: {
                        conversationId: conversation.id,
                        senderRole: "SYSTEM",
                        isAutomated: true,
                        automatedType: "BOOKING_REJECTED",
                        content: `❌ Cererea de rezervare pentru ${booking.space.name} a fost respinsă de gazdă pentru intervalul selectat.`,
                        readByCustomer: false,
                        readByOwner: true,
                    },
                });
            } catch (chatErr) {
                console.error("Chat message create error:", chatErr);
            }

            if (booking.renter?.email) {
                sendEmail({
                    to: booking.renter.email,
                    subject: `Actualizare rezervare: Cererea pentru ${booking.space.name}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                            <h2 style="color: #dc2626;">Cererea de rezervare nu a putut fi confirmată</h2>
                            <p>Gazda pentru <strong>${booking.space.name}</strong> a respins cererea pentru intervalul solicitat.</p>
                            <p>Poți explora alte intervale sau alte spații disponibile pe MyGenie.</p>
                            <p style="margin-top: 20px; font-size: 12px; color: #64748b;">Echipa MyGenie • <a href="https://www.mygenieurope.com">www.mygenieurope.com</a></p>
                        </div>
                    `,
                }).catch(console.error);
            }

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

            try {
                await prisma.chatMessage.create({
                    data: {
                        conversationId: conversation.id,
                        senderRole: "SYSTEM",
                        isAutomated: true,
                        automatedType: "PROPOSAL_SENT",
                        content: `📅 Gazda a propus un nou interval: ${new Date(proposedStartTime).toLocaleString()} - ${new Date(proposedEndTime).toLocaleString()}. Te rugăm să accepți sau să comunici pe chat.`,
                        readByCustomer: false,
                        readByOwner: true,
                    },
                });
            } catch (chatErr) {
                console.error("Chat message create error:", chatErr);
            }

            if (booking.renter?.email) {
                sendEmail({
                    to: booking.renter.email,
                    subject: `Propunere nouă de interval pentru ${booking.space.name}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                            <h2 style="color: #6366f1;">Gazda a propus un nou interval!</h2>
                            <p>Pentru <strong>${booking.space.name}</strong>, gazda a propus următorul interval:</p>
                            <p style="font-weight: bold; font-size: 15px;">${new Date(proposedStartTime).toLocaleString()} - ${new Date(proposedEndTime).toLocaleString()}</p>
                            <p>Te rugăm să accesezi panoul tău MyGenie pentru a accepta sau refuza propunerea.</p>
                            <p style="margin-top: 20px; font-size: 12px; color: #64748b;">Echipa MyGenie • <a href="https://www.mygenieurope.com">www.mygenieurope.com</a></p>
                        </div>
                    `,
                }).catch(console.error);
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
