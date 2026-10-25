import { prisma } from "@/lib/prisma";
import { isWeekend } from "date-fns";

export async function checkAvailability(spaceId: string, startTime: Date, endTime: Date) {
    if (!isWeekend(startTime) || !isWeekend(endTime)) {
        const startDay = startTime.getDay();
        const startHour = startTime.getHours();

        const isFriEve = startDay === 5 && startHour >= 18;

        if (!isFriEve && !isWeekend(startTime)) {
            return { available: false, reason: "Bookings allowed only on weekends (Fri 18:00+ to Sun)." };
        }
    }

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
