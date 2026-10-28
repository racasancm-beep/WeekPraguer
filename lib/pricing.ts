/**
 * Platform Fee Rule:
 * The platform fee is 15% of the reservation TOTAL (the amount paid by the renter).
 * The owner receives the remaining 85%.
 */
export const PLATFORM_FEE_RATE = 0.15;
export const OWNER_SHARE_RATE = 1 - PLATFORM_FEE_RATE;

// Kept for backwards compatibility with existing imports
export const PLATFORM_COMMISSION_RATE = PLATFORM_FEE_RATE;
export const CLEANING_FEE_RATE = 0;
export const INSURANCE_RATE = 0;

export interface PricingBreakdown {
    basePrice: number;
    cleaningFee: number;
    insurance: number;
    totalPrice: number;
    commission: number;
    ownerPayout: number;
    cleanerPayout: number;
}

export interface BookingAmountBreakdown {
    total: number;
    platformFee: number;
    ownerNet: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Splits a reservation total into Platform Fee (15%) and Owner Net (85%). */
export function splitTotal(total: number): BookingAmountBreakdown {
    const cleanTotal = round2(Math.max(0, total || 0));
    const platformFee = round2(cleanTotal * PLATFORM_FEE_RATE);
    return {
        total: cleanTotal,
        platformFee,
        ownerNet: round2(cleanTotal - platformFee),
    };
}

/**
 * Returns the Total / Platform Fee (15%) / Owner Net (85%) breakdown for any booking.
 * Owner calendar blocks always return 0.
 */
export function getBookingBreakdown(booking: any, space?: any): BookingAmountBreakdown {
    if (!booking || booking.accessCode === "OWNER_BLOCK") return splitTotal(0);

    let total = 0;
    if (typeof booking.totalPrice === "number" && booking.totalPrice > 0) {
        total = booking.totalPrice;
    } else if (typeof booking.basePrice === "number" && booking.basePrice > 0) {
        total = booking.basePrice;
    } else {
        const sp = space || booking.space;
        if (sp && booking.startTime && booking.endTime) {
            const hours = Math.max(
                1,
                Math.round(
                    (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) /
                        (1000 * 60 * 60)
                )
            );
            total = booking.isHourly === false && sp.dailyRate ? sp.dailyRate : hours * (sp.hourlyRate || 0);
        }
    }
    return splitTotal(total);
}

/** Booking price: renter pays the total; 15% platform fee and 85% owner payout come out of it. */
export function calculatePricing(basePrice: number, _isSelfCleaning: boolean = false): PricingBreakdown {
    const { total, platformFee, ownerNet } = splitTotal(basePrice);
    return {
        basePrice: total,
        cleaningFee: 0,
        insurance: 0,
        totalPrice: total,
        commission: platformFee,
        ownerPayout: ownerNet,
        cleanerPayout: 0,
    };
}

export function calculateHourlyPrice(
    hourlyRate: number,
    hours: number,
    isSelfCleaning: boolean = false
): PricingBreakdown {
    return calculatePricing(hourlyRate * hours, isSelfCleaning);
}

export function calculateDailyPrice(
    dailyRate: number,
    days: number,
    isSelfCleaning: boolean = false
): PricingBreakdown {
    return calculatePricing(dailyRate * days, isSelfCleaning);
}

export function calculateWeekendPrice(
    weekendRate: number,
    isSelfCleaning: boolean = false
): PricingBreakdown {
    return calculatePricing(weekendRate, isSelfCleaning);
}
