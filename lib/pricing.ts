export const PLATFORM_COMMISSION_RATE = 0;
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

/**
 * Reservation Pricing Rule (Platform Fee Removed):
 * 100% of the reservation amount goes directly to the Space Owner (0 platform fee).
 */
export function calculatePricing(basePrice: number, _isSelfCleaning: boolean = false): PricingBreakdown {
    const cleanPrice = Math.round(basePrice * 100) / 100;

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
