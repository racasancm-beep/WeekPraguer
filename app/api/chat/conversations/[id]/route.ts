import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAndSendBookingReminders, isChatActive } from "@/lib/chat-reminders";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Trebuie să fii autentificat." }, { status: 401 });
        }

        const userId = (session.user as any)?.id;
        const userEmail = session.user?.email?.trim().toLowerCase();
        const userRole = (session.user as any)?.role;

        const orClauses: any[] = [];
        if (userId) orClauses.push({ id: userId });
        if (userEmail) orClauses.push({ email: { equals: userEmail, mode: "insensitive" } });

        const dbUser = orClauses.length > 0 ? await prisma.user.findFirst({
            where: { OR: orClauses },
            select: { id: true },
        }) : null;

        const activeUserId = dbUser?.id || userId;

        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                space: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        city: true,
                        accessCode: true,
                        isService: true,
                        serviceCategory: true,
                        reminder24hTemplate: true,
                        reminder12hTemplate: true,
                        photos: { take: 1, select: { url: true } },
                    },
                },
                booking: {
                    select: {
                        id: true,
                        startTime: true,
                        endTime: true,
                        status: true,
                        totalPrice: true,
                        accessCode: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                messages: {
                    orderBy: { createdAt: "asc" },
                    include: {
                        sender: { select: { id: true, name: true, email: true } },
                    },
                },
            },
        });

        if (!conversation) {
            return NextResponse.json({ message: "Conversația nu a fost găsită" }, { status: 404 });
        }

        const isOwner = conversation.ownerId === activeUserId;
        const isCustomer = conversation.customerId === activeUserId;
        const isAdmin = userRole === "ADMIN";

        if (!isOwner && !isCustomer && !isAdmin) {
            return NextResponse.json({ message: "Nu aveți permisiunea de a vizualiza această conversație" }, { status: 403 });
        }

        // Trigger reminder check for this booking only for spaces, NEVER for services
        if (!conversation.space?.isService) {
            checkAndSendBookingReminders(conversation.bookingId).catch((e) => console.error("Reminder check error:", e));
        }

        // Mark messages as read
        if (isOwner) {
            await prisma.chatMessage.updateMany({
                where: { conversationId: id, readByOwner: false },
                data: { readByOwner: true },
            });
        } else if (isCustomer) {
            await prisma.chatMessage.updateMany({
                where: { conversationId: id, readByCustomer: false },
                data: { readByCustomer: true },
            });
        }

        const isService = Boolean(conversation.space?.isService);
        const activeStatus = isChatActive(conversation.booking.endTime, isService);

        // For services, ensure all automated messages are removed so communication is strictly free between profiles
        const filteredMessages = isService
            ? conversation.messages.filter((m) => !m.isAutomated)
            : conversation.messages;

        return NextResponse.json({
            conversation: {
                ...conversation,
                messages: filteredMessages,
                activeStatus,
                isUserOwner: isOwner,
                otherParty: isOwner ? conversation.customer : conversation.owner,
            },
        });
    } catch (err: any) {
        console.error("GET conversation [id] error:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Trebuie să fii autentificat pentru a trimite mesaje." }, { status: 401 });
        }

        const userId = (session.user as any)?.id;
        const userEmail = session.user?.email?.trim().toLowerCase();
        const userRole = (session.user as any)?.role;

        const orClauses: any[] = [];
        if (userId) orClauses.push({ id: userId });
        if (userEmail) orClauses.push({ email: { equals: userEmail, mode: "insensitive" } });

        const dbUser = orClauses.length > 0 ? await prisma.user.findFirst({
            where: { OR: orClauses },
            select: { id: true },
        }) : null;

        const activeUserId = dbUser?.id || userId;

        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                booking: { select: { endTime: true } },
                space: { select: { isService: true } },
            },
        });

        if (!conversation) {
            return NextResponse.json({ message: "Conversația nu a fost găsită" }, { status: 404 });
        }

        const isOwner = conversation.ownerId === activeUserId;
        const isCustomer = conversation.customerId === activeUserId;
        const isAdmin = userRole === "ADMIN";

        if (!isOwner && !isCustomer && !isAdmin) {
            return NextResponse.json({ message: "Nu aveți permisiunea de a trimite mesaje în această conversație" }, { status: 403 });
        }

        const isService = Boolean(conversation.space?.isService);
        const activeStatus = isChatActive(conversation.booking.endTime, isService);

        // Check active chat window:
        // For services: sending messages is permitted until 24 hours after the service date.
        // For spaces: permitted until 48 hours after check-out.
        if (activeStatus.isExpired) {
            return NextResponse.json(
                {
                    message: isService
                        ? "Acest chat a fost închis automat la 24 de ore după data serviciului."
                        : "Acest chat a fost închis automat la 48 de ore după check-out.",
                },
                { status: 400 }
            );
        }

        const body = await req.json();
        const content = body.content?.trim();

        if (!content) {
            return NextResponse.json({ message: "Mesajul nu poate fi gol" }, { status: 400 });
        }

        const senderRole = isOwner ? (userRole === "SERVICE_OWNER" ? "SERVICE_OWNER" : "OWNER") : isCustomer ? "CUSTOMER" : "ADMIN";

        const message = await prisma.chatMessage.create({
            data: {
                conversationId: id,
                senderId: activeUserId,
                senderRole,
                content,
                isAutomated: false,
                readByCustomer: isCustomer,
                readByOwner: isOwner,
            },
            include: {
                sender: { select: { id: true, name: true, email: true } },
            },
        });

        await prisma.conversation.update({
            where: { id },
            data: { lastMessageAt: new Date() },
        });

        return NextResponse.json({ message });
    } catch (err: any) {
        console.error("POST message error:", err);
        return NextResponse.json({ message: "Failed to send message" }, { status: 500 });
    }
}
