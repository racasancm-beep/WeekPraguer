import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-service";

interface ReminderCheckResult {
    processedBookings: number;
    reminders24hSent: number;
    reminders12hSent: number;
}

function renderTemplate(template: string, vars: Record<string, string>): string {
    let result = template;
    for (const [key, val] of Object.entries(vars)) {
        result = result.split(`{${key}}`).join(val);
    }
    return result;
}

export function isChatActive(endTime: Date | string, isService = false): { isActive: boolean; expiresAt: Date; isExpired: boolean } {
    const end = new Date(endTime);
    const postHours = isService ? 24 : 48;

    if (isNaN(end.getTime())) {
        return {
            isActive: true,
            expiresAt: new Date(Date.now() + postHours * 60 * 60 * 1000),
            isExpired: false,
        };
    }
    // Active until 24 hours post-service date for services, 48 hours after checkout for spaces
    const expiresAt = new Date(end.getTime() + postHours * 60 * 60 * 1000);
    const isExpired = Date.now() > expiresAt.getTime();
    return {
        isActive: !isExpired,
        expiresAt,
        isExpired,
    };
}

export async function checkAndSendBookingReminders(targetBookingId?: string): Promise<ReminderCheckResult> {
    const now = new Date();
    const result: ReminderCheckResult = {
        processedBookings: 0,
        reminders24hSent: 0,
        reminders12hSent: 0,
    };

    try {
        const bookings = await prisma.booking.findMany({
            where: {
                status: { in: ["CONFIRMED", "COMPLETED"] },
                OR: [
                    { accessCode: null },
                    { accessCode: { not: "OWNER_BLOCK" } },
                ],
                // Automated messages are strictly for space rentals, NEVER for services
                space: {
                    isService: false,
                },
                ...(targetBookingId ? { id: targetBookingId } : {}),
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
                        reminder24hTemplate: true,
                        reminder12hTemplate: true,
                        ownerId: true,
                        owner: { select: { id: true, name: true, email: true } },
                    },
                },
                renter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                conversation: true,
            },
        });

        for (const booking of bookings) {
            // Strictly guard against services
            if (booking.space.isService) continue;

            result.processedBookings++;
            const start = new Date(booking.startTime);
            const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);

            // Ensure conversation exists
            let conversation = booking.conversation;
            if (!conversation) {
                conversation = await prisma.conversation.upsert({
                    where: { bookingId: booking.id },
                    create: {
                        bookingId: booking.id,
                        spaceId: booking.spaceId,
                        ownerId: booking.space.ownerId,
                        customerId: booking.renterId,
                        status: "ACTIVE",
                    },
                    update: {},
                });
            }

            const customerName = booking.renter.name || booking.renter.email.split("@")[0];
            const spaceName = booking.space.name;
            const effectiveCode = booking.space.accessCode || booking.accessCode || "Va fi comunicat de proprietar";
            const dateStr = start.toLocaleDateString("ro-RO");
            const timeStr = start.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });

            const templateVars: Record<string, string> = {
                nume_client: customerName,
                nume_spatiu: spaceName,
                data_inceput: dateStr,
                ora_inceput: timeStr,
                adresa_spatiu: `${booking.space.address}, ${booking.space.city}`,
                cod_acces: effectiveCode,
            };

            // 1. Check 24h reminder (between 0 and 24 hours before start)
            if (diffHours <= 24 && diffHours > 0 && !booking.reminder24hSentAt) {
                const default24h =
                    "Bună ziua, {nume_client}! Vă reamintim că rezervarea dumneavoastră pentru spațiul \"{nume_spatiu}\" începe în 24 de ore (pe data de {data_inceput} la ora {ora_inceput}). Adresa spațiului: {adresa_spatiu}. Cod acces: {cod_acces}. Vă dorim o ședință excelentă!";
                const rawTemplate = booking.space.reminder24hTemplate?.trim() || default24h;
                const messageText = renderTemplate(rawTemplate, templateVars);

                // Add automated message to customer in chat
                await prisma.chatMessage.create({
                    data: {
                        conversationId: conversation.id,
                        senderRole: "SYSTEM",
                        isAutomated: true,
                        automatedType: "REMINDER_24H",
                        content: messageText,
                        readByCustomer: false,
                        readByOwner: false,
                    },
                });

                // Add notification to Owner in chat only
                await prisma.chatMessage.create({
                    data: {
                        conversationId: conversation.id,
                        senderRole: "SYSTEM",
                        isAutomated: true,
                        automatedType: "OWNER_NOTIFICATION",
                        content: `🔔 [Notificare Proprietar]: Mesajul automat de 24h înainte de închiriere a fost trimis către clientul ${customerName}.`,
                        readByCustomer: true,
                        readByOwner: false,
                    },
                });

                // Send email to customer
                await sendEmail({
                    to: booking.renter.email,
                    subject: `Reamintire 24h: Rezervarea ta pentru ${spaceName} începe mâine!`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                            <h2 style="color: #008080;">Reamintire Închiriere Spațiu (24h)</h2>
                            <p style="font-size: 15px; line-height: 1.6;">${messageText.replace(/\n/g, "<br/>")}</p>
                            <div style="margin-top: 20px; padding: 15px; background: #f0fdfa; border-radius: 8px; border: 1px solid #ccfbf1;">
                                <strong style="color: #0f766e;">Cod de Acces Spațiu:</strong> <span style="font-family: monospace; font-size: 16px; font-weight: bold;">${effectiveCode}</span><br/>
                                <strong style="color: #0f766e;">Locație:</strong> ${booking.space.address}, ${booking.space.city}
                            </div>
                            <p style="margin-top: 20px; font-size: 12px; color: #64748b;">Echipa MyGenie • <a href="https://www.mygenieurope.com">www.mygenieurope.com</a></p>
                        </div>
                    `,
                    text: messageText,
                });

                // Mark 24h reminder sent
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: { reminder24hSentAt: now },
                });

                result.reminders24hSent++;
            }

            // 2. Check 12h reminder (between 0 and 12 hours before start)
            if (diffHours <= 12 && diffHours > 0 && !booking.reminder12hSentAt) {
                const default12h =
                    "Bună ziua, {nume_client}! În 12 ore începe check-in-ul pentru spațiul \"{nume_spatiu}\". Vă rugăm să pregătiți codul de acces ({cod_acces}) și să verificați detaliile locației: {adresa_spatiu}.";
                const rawTemplate = booking.space.reminder12hTemplate?.trim() || default12h;
                const messageText = renderTemplate(rawTemplate, templateVars);

                // Add automated message to customer in chat
                await prisma.chatMessage.create({
                    data: {
                        conversationId: conversation.id,
                        senderRole: "SYSTEM",
                        isAutomated: true,
                        automatedType: "REMINDER_12H",
                        content: messageText,
                        readByCustomer: false,
                        readByOwner: false,
                    },
                });

                // Add notification to Owner in chat only
                await prisma.chatMessage.create({
                    data: {
                        conversationId: conversation.id,
                        senderRole: "SYSTEM",
                        isAutomated: true,
                        automatedType: "OWNER_NOTIFICATION",
                        content: `🔔 [Notificare Proprietar]: Mesajul automat de 12h înainte de check-in a fost trimis către clientul ${customerName}.`,
                        readByCustomer: true,
                        readByOwner: false,
                    },
                });

                // Send email to customer
                await sendEmail({
                    to: booking.renter.email,
                    subject: `Reamintire 12h: Check-in în curând pentru ${spaceName}!`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                            <h2 style="color: #008080;">Reamintire Check-in (12h)</h2>
                            <p style="font-size: 15px; line-height: 1.6;">${messageText.replace(/\n/g, "<br/>")}</p>
                            <div style="margin-top: 20px; padding: 15px; background: #f0fdfa; border-radius: 8px; border: 1px solid #ccfbf1;">
                                <strong style="color: #0f766e;">Cod de Acces Spațiu:</strong> <span style="font-family: monospace; font-size: 16px; font-weight: bold;">${effectiveCode}</span><br/>
                                <strong style="color: #0f766e;">Locație:</strong> ${booking.space.address}, ${booking.space.city}
                            </div>
                            <p style="margin-top: 20px; font-size: 12px; color: #64748b;">Echipa MyGenie • <a href="https://www.mygenieurope.com">www.mygenieurope.com</a></p>
                        </div>
                    `,
                    text: messageText,
                });

                // Mark 12h reminder sent
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: { reminder12hSentAt: now },
                });

                result.reminders12hSent++;
            }
        }
    } catch (err) {
        console.error("[REMINDER CRON ERROR]:", err);
    }

    return result;
}
