export const PLATFORM_COMMISSION_RATE = parseFloat(
    process.env.PLATFORM_COMMISSION_RATE || "0.14"
);
export const CLEANING_FEE_RATE = parseFloat(
    process.env.CLEANING_FEE_RATE || "0.10"
);
export const INSURANCE_RATE = parseFloat(
    process.env.INSURANCE_RATE || "0.50"
);

export interface PricingBreakdown {
    basePrice: number;
    cleaningFee: number;
    insurance: number;
    totalPrice: number;
    commission: number;
    ownerPayout: number;
}

export function calculatePricing(basePrice: number): PricingBreakdown {
    const cleaningFee = basePrice * CLEANING_FEE_RATE;
    const insurance = basePrice * INSURANCE_RATE;
    const totalPrice = basePrice + cleaningFee + insurance;

    // Commission is 14% from renter's perspective (applied to base price)
    const commission = basePrice * PLATFORM_COMMISSION_RATE;

    // Owner receives base price minus commission, plus 60-70% of cleaning fee
    const cleaningRevenue = cleaningFee * 0.35; // Platform takes 30-40% margin
    const ownerPayout = basePrice - commission + cleaningRevenue;

    return {
        basePrice,
        cleaningFee,
        insurance,
        totalPrice,
        commission,
        ownerPayout,
    };
}

export function calculateHourlyPrice(
    hourlyRate: number,
    hours: number
): PricingBreakdown {
    return calculatePricing(hourlyRate * hours);
}

export function calculateDailyPrice(
    dailyRate: number,
    days: number
): PricingBreakdown {
    return calculatePricing(dailyRate * days);
}

export function calculateWeekendPrice(
    weekendRate: number
): PricingBreakdown {
    return calculatePricing(weekendRate);
}
