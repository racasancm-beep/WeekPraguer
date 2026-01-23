import { startOfWeek, endOfWeek, isFriday, isSaturday, isSunday, setHours, setMinutes, isWithinInterval } from "date-fns";

export const WEEKEND_START_HOUR = 18; // Friday 18:00
export const WEEKEND_END_HOUR = 20; // Sunday 20:00

export function isWeekendTime(date: Date): boolean {
    const dayOfWeek = date.getDay();
    const hour = date.getHours();

    // Friday after 18:00
    if (dayOfWeek === 5 && hour >= WEEKEND_START_HOUR) {
        return true;
    }

    // All day Saturday
    if (dayOfWeek === 6) {
        return true;
    }

    // Sunday before 20:00
    if (dayOfWeek === 0 && hour < WEEKEND_END_HOUR) {
        return true;
    }

    return false;
}

export function getNextWeekendStart(from: Date = new Date()): Date {
    const nextFriday = startOfWeek(from, { weekStartsOn: 1 });
    nextFriday.setDate(nextFriday.getDate() + 4); // Move to Friday

    // If we're past Friday 18:00, move to next week
    const fridayEvening = setHours(setMinutes(nextFriday, 0), WEEKEND_START_HOUR);
    if (from > fridayEvening) {
        fridayEvening.setDate(fridayEvening.getDate() + 7);
    }

    return fridayEvening;
}

export function getWeekendEnd(weekendStart: Date): Date {
    // Find the Sunday after the given weekend start
    const sunday = new Date(weekendStart);
    const daysUntilSunday = (7 - weekendStart.getDay()) % 7;
    sunday.setDate(sunday.getDate() + daysUntilSunday);

    return setHours(setMinutes(sunday, 0), WEEKEND_END_HOUR);
}

export function validateWeekendBooking(start: Date, end: Date): {
    valid: boolean;
    error?: string;
} {
    // Check if start is during weekend hours
    if (!isWeekendTime(start)) {
        return {
            valid: false,
            error: "Booking must start during weekend hours (Fri 18:00 - Sun 20:00)",
        };
    }

    // Check if end is during weekend hours
    if (!isWeekendTime(end)) {
        return {
            valid: false,
            error: "Booking must end during weekend hours (Fri 18:00 - Sun 20:00)",
        };
    }

    // Check if start is before end
    if (start >= end) {
        return {
            valid: false,
            error: "End time must be after start time",
        };
    }

    // Check if booking is within the same weekend
    const weekendEnd = getWeekendEnd(start);
    if (end > weekendEnd) {
        return {
            valid: false,
            error: "Booking cannot span multiple weekends",
        };
    }

    return { valid: true };
}

export function calculateBookingHours(start: Date, end: Date): number {
    const diffMs = end.getTime() - start.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60)); // Convert to hours
}

export function isWeekendDay(date: Date): boolean {
    return isFriday(date) || isSaturday(date) || isSunday(date);
}
