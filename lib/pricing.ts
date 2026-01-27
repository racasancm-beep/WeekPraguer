export const PLATFORM_COMMISSION_RATE = parseFloat(
    process.env.PLATFORM_COMMISSION_RATE || "0.14"
);
export const CLEANING_FEE_RATE = parseFloat(
    process.env.CLEANING_FEE_RATE || "0.10"
);
export const INSURANCE_RATE = parseFloat(
    process.env.INSURANCE_RATE || "0.05" // Reduced from 0.50 to a more realistic 0.05
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
 * Calculates a dynamic cleaning fee based on space size
 */
export function calculateCleaningFee(sizeM2: number): number {
    const base = 250;
    const perMeter = 5;
    return base + (sizeM2 * perMeter);
}

export function calculatePricing(basePrice: number, sizeM2: number = 50): PricingBreakdown {
    const cleaningFee = calculateCleaningFee(sizeM2);
    const insurance = basePrice * INSURANCE_RATE;
    const totalPrice = basePrice + cleaningFee + insurance;

    // Commission is 14% of the base price
    const commission = basePrice * PLATFORM_COMMISSION_RATE;

    // Owner receives base price minus commission
    const ownerPayout = basePrice - commission;

    // Cleaner receives the full cleaning fee
    const cleanerPayout = cleaningFee;

    return {
        basePrice,
        cleaningFee,
        insurance,
        totalPrice,
        commission,
        ownerPayout,
        cleanerPayout,
    };
}

export function calculateHourlyPrice(
    hourlyRate: number,
    hours: number,
    sizeM2: number
): PricingBreakdown {
    return calculatePricing(hourlyRate * hours, sizeM2);
}

export function calculateDailyPrice(
    dailyRate: number,
    days: number,
    sizeM2: number
): PricingBreakdown {
    return calculatePricing(dailyRate * days, sizeM2);
}

export function calculateWeekendPrice(
    weekendRate: number,
    sizeM2: number
): PricingBreakdown {
    return calculatePricing(weekendRate, sizeM2);
}
