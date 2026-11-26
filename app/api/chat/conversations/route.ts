import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAndSendBookingReminders, isChatActive } from "@/lib/chat-reminders";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Trebuie să fii autentificat pentru a accesa conversațiile." }, { status: 401 });
        }

        const userId = (session.user as any)?.id;
        const userEmail = session.user?.email?.trim().toLowerCase();
        const userRole = (session.user as any)?.role;

        // Run background reminder checks
        checkAndSendBookingReminders().catch((e) => console.error("Reminder check error:", e));

        // Find user by id or email to resolve DB user
        const orClauses: any[] = [];
        if (userId) orClauses.push({ id: userId });
        if (userEmail) orClauses.push({ email: { equals: userEmail, mode: "insensitive" } });

        const dbUser = orClauses.length > 0 ? await prisma.user.findFirst({
            where: { OR: orClauses },
            select: { id: true },
        }) : null;

        const activeUserId = dbUser?.id || userId;

        // Auto-create conversations for any bookings (PENDING, OWNER_PROPOSED, CONFIRMED, COMPLETED)
        // that don't have a conversation yet, excluding owner blocks.
        // In SQL/Prisma, accessCode != 'OWNER_BLOCK' excludes NULL, so we use OR: [{ accessCode: null }, { accessCode: { not: "OWNER_BLOCK" } }]
        const pendingBookings = await prisma.booking.findMany({
            where: {
                status: { in: ["PENDING", "OWNER_PROPOSED", "CONFIRMED", "COMPLETED"] },
                AND: [
                    {
                        OR: [
                            { accessCode: null },
                            { accessCode: { not: "OWNER_BLOCK" } },
                        ],
                    },
                    {
                        OR: [
                            { renterId: activeUserId },
                            { space: { ownerId: activeUserId } },
                        ],
                    },
                ],
                conversation: null,
            },
            include: {
                space: { select: { ownerId: true } },
            },
        });

        for (const b of pendingBookings) {
            await prisma.conversation.upsert({
                where: { bookingId: b.id },
                create: {
                    bookingId: b.id,
                    spaceId: b.spaceId,
                    ownerId: b.space.ownerId,
                    customerId: b.renterId,
                    status: "ACTIVE",
                },
                update: {},
            });
        }

        const conversations = await prisma.conversation.findMany({
            where: userRole === "ADMIN" ? {} : {
                OR: [
                    { ownerId: activeUserId },
                    { customerId: activeUserId },
                ],
            },
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
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
            },
            orderBy: { lastMessageAt: "desc" },
        });

        const mapped = conversations.map((conv) => {
            const isService = Boolean(conv.space?.isService);
            const activeStatus = isChatActive(conv.booking.endTime, isService);
            const isUserOwner = conv.ownerId === activeUserId;
            const otherParty = isUserOwner ? conv.customer : conv.owner;
            const validMessages = isService
                ? conv.messages.filter((m) => !m.isAutomated)
                : conv.messages;

            return {
                id: conv.id,
                bookingId: conv.bookingId,
                space: conv.space,
                booking: conv.booking,
                otherParty,
                isUserOwner,
                lastMessage: validMessages[0] || null,
                activeStatus,
                status: activeStatus.isExpired ? "CLOSED" : conv.status,
            };
        });

        return NextResponse.json({ conversations: mapped });
    } catch (err: any) {
        console.error("GET conversations error:", err);
        return NextResponse.json({ message: "Failed to fetch conversations" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Trebuie să fii autentificat." }, { status: 401 });
        }

        const { bookingId } = await req.json();
        if (!bookingId) {
            return NextResponse.json({ message: "bookingId este obligatoriu" }, { status: 400 });
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

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                space: { select: { id: true, ownerId: true } },
            },
        });

        if (!booking) {
            return NextResponse.json({ message: "Rezervarea nu a fost găsită" }, { status: 404 });
        }

        const isOwner = booking.space.ownerId === activeUserId;
        const isCustomer = booking.renterId === activeUserId;
        const isAdmin = userRole === "ADMIN";

        if (!isOwner && !isCustomer && !isAdmin) {
            return NextResponse.json({ message: "Nu aveți permisiunea de a accesa această conversație" }, { status: 403 });
        }

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
            include: {
                space: true,
                booking: true,
            },
        });

        return NextResponse.json({ conversation });
    } catch (err: any) {
        console.error("POST conversation error:", err);
        return NextResponse.json({ message: "Failed to create conversation" }, { status: 500 });
    }
}
