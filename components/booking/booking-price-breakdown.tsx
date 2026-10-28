"use client";

import { Wallet } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { getBookingBreakdown } from "@/lib/pricing";

interface BookingPriceBreakdownProps {
    booking: any;
    space?: any;
    /** Highlights the owner's net payout (owner view) */
    highlightOwnerNet?: boolean;
    compact?: boolean;
}

/**
 * Displays Total / Platform Fee (15% of total) / Owner Net (85%) for a booking.
 * Used in Owner, Renter and Admin profiles.
 */
export function BookingPriceBreakdown({ booking, space, highlightOwnerNet = false, compact = false }: BookingPriceBreakdownProps) {
    const { t } = useLanguage();
    if (!booking || booking.accessCode === "OWNER_BLOCK") return null;

    const { total, platformFee, ownerNet } = getBookingBreakdown(booking, space);
    const textSize = compact ? "text-[10px]" : "text-xs";

    return (
        <div className={`inline-flex flex-wrap items-center gap-1.5 ${textSize}`}>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-900 text-white font-extrabold">
                <Wallet className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                {t("owner.bookings.totalAmount")}: {total} RON
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                {t("owner.bookings.platformFee")}: {platformFee} RON
            </span>
            <span
                className={`px-2.5 py-0.5 rounded-full font-bold border ${
                    highlightOwnerNet
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-emerald-50 text-emerald-900 border-emerald-300"
                }`}
            >
                {t("owner.bookings.ownerNet")}: {ownerNet} RON
            </span>
        </div>
    );
}
