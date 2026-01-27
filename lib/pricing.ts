export const PLATFORM_COMMISSION_RATE = parseFloat(
    process.env.PLATFORM_COMMISSION_RATE || "0.14"
);
export const CLEANING_FEE_RATE = parseFloat(
    process.env.CLEANING_FEE_RATE || "0.15" // 15% as per user rule
);
export const INSURANCE_RATE = parseFloat(
    process.env.INSURANCE_RATE || "0.05"
);

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
 * Platform Revenue Split Rule:
 * If Cleaning Service used: 60% Owner, 25% Admin, 15% Cleaner
 * If Self-Cleaning: 70% Owner, 30% Admin, 0% Cleaner
 */
export function calculatePricing(basePrice: number, isSelfCleaning: boolean = false): PricingBreakdown {
    const insurance = basePrice * INSURANCE_RATE;
    const totalPrice = basePrice + insurance;

    // Commission is the administrative cut
    const commissionRate = isSelfCleaning ? 0.30 : 0.25;
    const ownerRate = isSelfCleaning ? 0.70 : 0.60;
    const cleanerRate = isSelfCleaning ? 0 : 0.15;

    return {
        basePrice,
        cleaningFee: totalPrice * cleanerRate, // This is the 15% rule
        insurance,
        totalPrice,
        commission: totalPrice * commissionRate,
        ownerPayout: totalPrice * ownerRate,
        cleanerPayout: totalPrice * cleanerRate,
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
