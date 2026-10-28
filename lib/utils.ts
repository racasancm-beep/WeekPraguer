import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = "RON"): string {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
}

export function formatDateOnly(date: Date | string): string {
    return new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
    }).format(new Date(date));
}

export function expandBookingDateKeys(booking: {
    startTime: Date | string;
    endTime?: Date | string;
}): string[] {
    const start = new Date(booking.startTime);
    const end = booking.endTime ? new Date(booking.endTime) : start;
    if (isNaN(start.getTime())) return [];

    const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    const last = isNaN(end.getTime())
        ? cur
        : new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

    const keys: string[] = [];
    let safety = 0;
    while (cur <= last && safety < 366) {
        keys.push(
            [
                cur.getUTCFullYear(),
                String(cur.getUTCMonth() + 1).padStart(2, "0"),
                String(cur.getUTCDate()).padStart(2, "0"),
            ].join("-")
        );
        cur.setUTCDate(cur.getUTCDate() + 1);
        safety++;
    }
    return keys;
}

function formatKeyDmy(key: string): string {
    const [y, m, d] = key.split("-");
    return `${d}.${m}.${y}`;
}

export function formatOwnerBlockedPeriods(bookings: any[] = []): string[] {
    const allKeysSet = new Set<string>();
    for (const bk of bookings) {
        if (bk?.accessCode === "OWNER_BLOCK" && bk?.status !== "CANCELLED" && bk?.status !== "REJECTED") {
            for (const k of expandBookingDateKeys(bk)) {
                allKeysSet.add(k);
            }
        }
    }

    const sortedKeys = Array.from(allKeysSet).sort();
    if (sortedKeys.length === 0) return [];

    const ranges: { start: string; end: string }[] = [];
    let rangeStart = sortedKeys[0];
    let prevKey = sortedKeys[0];

    for (let i = 1; i < sortedKeys.length; i++) {
        const currKey = sortedKeys[i];
        const prevDate = new Date(`${prevKey}T00:00:00Z`);
        const currDate = new Date(`${currKey}T00:00:00Z`);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);

        if (diffDays === 1) {
            prevKey = currKey;
        } else {
            ranges.push({ start: rangeStart, end: prevKey });
            rangeStart = currKey;
            prevKey = currKey;
        }
    }
    ranges.push({ start: rangeStart, end: prevKey });

    return ranges.map((r) =>
        r.start === r.end
            ? formatKeyDmy(r.start)
            : `${formatKeyDmy(r.start)} - ${formatKeyDmy(r.end)}`
    );
}
