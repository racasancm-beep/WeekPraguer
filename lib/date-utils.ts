/**
 * Shared date formatting utilities across booking, dashboard, and listing components.
 */

export function formatReservationPeriod(booking: any): string {
    if (!booking || !booking.startTime) return "";
    const start = new Date(booking.startTime);
    const end = booking.endTime ? new Date(booking.endTime) : start;

    if (isNaN(start.getTime())) return "";

    if (booking?.accessCode === "OWNER_BLOCK" || booking?.isHourly === false) {
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
    return `${start.toLocaleString()} - ${end.toLocaleString()}`;
}

export function toDateTimeLocalValue(dateStrOrObj: string | Date | null | undefined): string {
    if (!dateStrOrObj) return "";
    const d = new Date(dateStrOrObj);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
