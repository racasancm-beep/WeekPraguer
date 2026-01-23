import { PrismaClient } from "@prisma/client";
import { startOfWeek, endOfWeek, isWeekend, isWithinInterval, parseISO } from "date-fns";

const prisma = new PrismaClient();

export async function checkAvailability(spaceId: string, startTime: Date, endTime: Date) {
    // 1. Enforce Weekend Only Rule
    // Weekend is defined as Fri 18:00 to Sun 20:00?
    // Or simply Saturday and Sunday. 
    // Let's go with stricter rule: Start and End must be on Sat/Sun (or late Fri).
    // Implementation: Check if start and end are on weekend days.

    if (!isWeekend(startTime) || !isWeekend(endTime)) {
        // Allow Friday evening after 18:00?
        const startDay = startTime.getDay();
        const startHour = startTime.getHours();

        const isFriEve = startDay === 5 && startHour >= 18;

        if (!isFriEve && !isWeekend(startTime)) {
            return { available: false, reason: "Bookings allowed only on weekends (Fri 18:00+ to Sun)." };
        }
    }

    // 2. Check for Overlaps
    const overlapping = await prisma.booking.findFirst({
        where: {
            spaceId,
            status: { not: "CANCELLED" },
            OR: [
                {
                    startTime: { lt: endTime },
                    endTime: { gt: startTime },
                },
            ],
        },
    });

    if (overlapping) {
        return { available: false, reason: "Space is already booked for this time." };
    }

    return { available: true };
}
