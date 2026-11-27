export type PricingPolicyType = "FLEXIBLE" | "MODERATE" | "NON_REFUNDABLE";

export interface PricingPolicyDefinition {
    id: PricingPolicyType;
    icon: string; // Emoji marker
    color: string;
    borderClass: string;
    bgClass: string;
    textClass: string;
    titleKey: string;
    bestForKey: string;
    whatYouGetKeys: string[];
    whatNotRefundedKeys: string[];
    schedule: {
        timeKey: string;
        refundKey: string;
    }[];
}

export const PRICING_POLICIES: Record<PricingPolicyType, PricingPolicyDefinition> = {
    FLEXIBLE: {
        id: "FLEXIBLE",
        icon: "🟢",
        color: "emerald",
        borderClass: "border-emerald-300 dark:border-emerald-700",
        bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
        textClass: "text-emerald-800 dark:text-emerald-300",
        titleKey: "policy.flexible.title",
        bestForKey: "policy.flexible.bestFor",
        whatYouGetKeys: [
            "policy.flexible.whatYouGet1",
        ],
        whatNotRefundedKeys: [
            "policy.common.notRefundedPlatform",
            "policy.common.notRefundedProcessing",
        ],
        schedule: [
            {
                timeKey: "policy.flexible.time1",
                refundKey: "policy.flexible.refund1",
            },
            {
                timeKey: "policy.flexible.time2",
                refundKey: "policy.common.noRefund",
            },
        ],
    },
    MODERATE: {
        id: "MODERATE",
        icon: "🟡",
        color: "amber",
        borderClass: "border-amber-300 dark:border-amber-700",
        bgClass: "bg-amber-50 dark:bg-amber-950/30",
        textClass: "text-amber-800 dark:text-amber-300",
        titleKey: "policy.moderate.title",
        bestForKey: "policy.moderate.bestFor",
        whatYouGetKeys: [
            "policy.moderate.whatYouGet1",
            "policy.moderate.whatYouGet2",
        ],
        whatNotRefundedKeys: [
            "policy.common.notRefundedPlatform",
            "policy.common.notRefundedProcessing",
        ],
        schedule: [
            {
                timeKey: "policy.moderate.time1",
                refundKey: "policy.moderate.refund1",
            },
            {
                timeKey: "policy.moderate.time2",
                refundKey: "policy.moderate.refund2",
            },
            {
                timeKey: "policy.moderate.time3",
                refundKey: "policy.common.noRefund",
            },
        ],
    },
    NON_REFUNDABLE: {
        id: "NON_REFUNDABLE",
        icon: "🔴",
        color: "rose",
        borderClass: "border-rose-300 dark:border-rose-700",
        bgClass: "bg-rose-50 dark:bg-rose-950/30",
        textClass: "text-rose-800 dark:text-rose-300",
        titleKey: "policy.nonRefundable.title",
        bestForKey: "policy.nonRefundable.bestFor",
        whatYouGetKeys: [
            "policy.nonRefundable.whatYouGet1",
        ],
        whatNotRefundedKeys: [
            "policy.nonRefundable.notRefundedAll",
        ],
        schedule: [
            {
                timeKey: "policy.nonRefundable.timeAll",
                refundKey: "policy.common.noRefund",
            },
        ],
    },
};

/**
 * Extracts the available pricing policies from a space record.
 * Fallbacks to FLEXIBLE with hourlyRate if none are configured.
 */
export function getSpaceAvailablePolicies(space: any): {
    id: PricingPolicyType;
    hourlyRate: number;
    definition: PricingPolicyDefinition;
}[] {
    if (!space || space.isService) return [];

    const result: {
        id: PricingPolicyType;
        hourlyRate: number;
        definition: PricingPolicyDefinition;
    }[] = [];

    const hasFlex = space.hasFlexiblePolicy ?? true;
    const priceFlex = Number(space.priceFlexible) > 0 ? Number(space.priceFlexible) : Number(space.hourlyRate) || 100;

    const hasMod = Boolean(space.hasModeratePolicy);
    const priceMod = Number(space.priceModerate) > 0 ? Number(space.priceModerate) : null;

    const hasNonRef = Boolean(space.hasNonRefundablePolicy);
    const priceNonRef = Number(space.priceNonRefundable) > 0 ? Number(space.priceNonRefundable) : null;

    if (hasFlex) {
        result.push({
            id: "FLEXIBLE",
            hourlyRate: priceFlex,
            definition: PRICING_POLICIES.FLEXIBLE,
        });
    }

    if (hasMod && priceMod) {
        result.push({
            id: "MODERATE",
            hourlyRate: priceMod,
            definition: PRICING_POLICIES.MODERATE,
        });
    }

    if (hasNonRef && priceNonRef) {
        result.push({
            id: "NON_REFUNDABLE",
            hourlyRate: priceNonRef,
            definition: PRICING_POLICIES.NON_REFUNDABLE,
        });
    }

    // Safe fallback if for any reason none were active
    if (result.length === 0) {
        result.push({
            id: "FLEXIBLE",
            hourlyRate: Number(space.hourlyRate) || 100,
            definition: PRICING_POLICIES.FLEXIBLE,
        });
    }

    return result;
}
