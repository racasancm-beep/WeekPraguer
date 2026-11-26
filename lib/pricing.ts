/**
 * Pricing Engine Rules:
 * - Owner sets the space price (hourlyRate, dailyRate, weekendRate).
 * - Platform fee is 15% from the amount the owner put for the space.
 * - Total amount displayed to customers everywhere = Owner Price + 15% Platform Fee (Owner Price * 1.15).
 * - In Dashboards for Owners and Admin, this amount is split into Owner Price and Platform Fee.
 */

export const PLATFORM_FEE_RATE = 0.15; // 15% from the amount the owner put for the space

export const PLATFORM_COMMISSION_RATE = PLATFORM_FEE_RATE;
export const CLEANING_FEE_RATE = 0;
export const INSURANCE_RATE = 0;

export interface PricingBreakdown {
    basePrice: number;    // Owner price
    cleaningFee: number;
    insurance: number;
    totalPrice: number;   // Customer total (ownerPrice + 15%)
    commission: number;   // Platform fee (15% of ownerPrice)
    ownerPayout: number;  // Owner net price
    cleanerPayout: number;
}

export interface BookingAmountBreakdown {
    ownerPrice: number;    // The amount the owner put for the space
    platformFee: number;   // 15% from that amount
    total: number;         // ownerPrice + platformFee (1.15 * ownerPrice)
    ownerNet: number;      // alias to ownerPrice for backwards compatibility
}

const round2 = (n: number) => Math.round(Number(n || 0) * 100) / 100;

/**
 * Calculates the customer-facing price displayed everywhere on the platform:
 * For spaces: Owner Price + 15% Platform Fee (Owner Price * 1.15).
 * For services: Owner Price (0% platform commission).
 */
export function calculateSpaceCustomerPrice(ownerRate: number, isService: boolean = false): number {
    const cleanRate = Math.max(0, Number(ownerRate) || 0);
    if (isService) return round2(cleanRate);
    return round2(cleanRate * (1 + PLATFORM_FEE_RATE));
}

/**
 * Splits an owner price into:
 * - Owner Price (the amount the owner put for the space/service)
 * - Platform Fee (15% for spaces, 0 for services)
 * - Total Amount (Owner Price + Platform Fee)
 */
export function splitOwnerPrice(ownerPrice: number, isService: boolean = false): BookingAmountBreakdown {
    const cleanOwnerPrice = round2(Math.max(0, Number(ownerPrice) || 0));
    if (isService) {
        return {
            ownerPrice: cleanOwnerPrice,
            platformFee: 0,
            total: cleanOwnerPrice,
            ownerNet: cleanOwnerPrice,
        };
    }
    const platformFee = round2(cleanOwnerPrice * PLATFORM_FEE_RATE);
    const total = round2(cleanOwnerPrice + platformFee);
    return {
        ownerPrice: cleanOwnerPrice,
        platformFee,
        total,
        ownerNet: cleanOwnerPrice,
    };
}

/**
 * Backwards compatibility helper if only total is available.
 */
export function splitTotal(total: number, isService: boolean = false): BookingAmountBreakdown {
    const cleanTotal = round2(Math.max(0, Number(total) || 0));
    if (isService) {
        return {
            ownerPrice: cleanTotal,
            platformFee: 0,
            total: cleanTotal,
            ownerNet: cleanTotal,
        };
    }
    const ownerPrice = round2(cleanTotal / (1 + PLATFORM_FEE_RATE));
    const platformFee = round2(cleanTotal - ownerPrice);
    return {
        ownerPrice,
        platformFee,
        total: cleanTotal,
        ownerNet: ownerPrice,
    };
}

/**
 * Returns the Owner Price / Platform Fee (15% for spaces, 0 for services) / Total breakdown for any booking.
 * Owner calendar blocks always return 0.
 */
export function getBookingBreakdown(booking: any, space?: any): BookingAmountBreakdown {
    if (!booking || booking.accessCode === "OWNER_BLOCK") {
        return { ownerPrice: 0, platformFee: 0, total: 0, ownerNet: 0 };
    }

    const sp = space || booking.space;
    const isService = Boolean(sp?.isService);

    if (isService) {
        const amt = typeof booking.basePrice === "number" && booking.basePrice > 0
            ? round2(booking.basePrice)
            : typeof booking.totalPrice === "number" && booking.totalPrice > 0
            ? round2(booking.totalPrice)
            : 0;
        return {
            ownerPrice: amt,
            platformFee: 0,
            total: amt,
            ownerNet: amt,
        };
    }

    // If basePrice is explicitly recorded (the amount the owner put for the space)
    if (typeof booking.basePrice === "number" && booking.basePrice > 0) {
        return splitOwnerPrice(booking.basePrice, false);
    }

    // If we have space rate & duration, compute from the amount the owner put for the space
    if (sp && booking.startTime && booking.endTime) {
        const hours = Math.max(
            1,
            Math.round(
                (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) /
                    (1000 * 60 * 60)
            )
        );
        const ownerRateTotal = booking.isHourly === false && sp.dailyRate
            ? sp.dailyRate
            : hours * (sp.hourlyRate || 0);
        if (ownerRateTotal > 0) {
            return splitOwnerPrice(ownerRateTotal, false);
        }
    }

    // If only totalPrice was recorded
    if (typeof booking.totalPrice === "number" && booking.totalPrice > 0) {
        return splitTotal(booking.totalPrice, false);
    }

    return { ownerPrice: 0, platformFee: 0, total: 0, ownerNet: 0 };
}

/**
 * Calculates pricing for a booking from the owner's price:
 * Total = ownerPrice + 15% Platform fee (0% for services).
 */
export function calculatePricing(
    ownerPrice: number,
    _isSelfCleaning: boolean = false,
    isService: boolean = false
): PricingBreakdown {
    if (isService) {
        const cleanPrice = round2(Math.max(0, Number(ownerPrice) || 0));
        return {
            basePrice: cleanPrice,
            cleaningFee: 0,
            insurance: 0,
            totalPrice: cleanPrice,
            commission: 0,
            ownerPayout: cleanPrice,
            cleanerPayout: 0,
        };
    }
    const { ownerPrice: basePrice, platformFee, total } = splitOwnerPrice(ownerPrice, false);
    return {
        basePrice,
        cleaningFee: 0,
        insurance: 0,
        totalPrice: total,
        commission: platformFee,
        ownerPayout: basePrice,
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
