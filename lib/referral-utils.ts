export interface DarkerGenieStats {
    totalGeneratedCodes: number;
    pendingReferrals: number;
    confirmedReferrals: number;
    genieLevel: number; // 0 to 7
    progressToNext: number; // 0 to 9
    referralsNeededForNext: number;
    isMaxLevel: boolean;
    colorHex: string;
    levelName: string;
}

export function calculateGenieLevel(confirmedCount: number): DarkerGenieStats {
    const safeCount = Math.max(0, Number(confirmedCount) || 0);
    const genieLevel = Math.min(7, Math.floor(safeCount / 10));
    const progressToNext = safeCount % 10;
    const isMaxLevel = genieLevel >= 7;

    const colors = [
        "#008080", // Level 0: Standard Vibrant Teal
        "#006666", // Level 1: Deep Teal
        "#054e4e", // Level 2: Oceanic Dark Teal
        "#0b3c49", // Level 3: Midnight Teal-Blue
        "#142c44", // Level 4: Deep Sapphire
        "#241738", // Level 5: Dark Mystic Violet
        "#1c1524", // Level 6: Obsidian Charcoal
        "#d4af37", // Level 7: Golden Awakened Dark Genie
    ];

    const names = [
        "Genie Lumina (Level 0)",
        "Genie Întunecat I (Level 1)",
        "Genie Întunecat II (Level 2)",
        "Genie Întunecat III (Level 3)",
        "Genie Safir IV (Level 4)",
        "Genie Mistic V (Level 5)",
        "Genie Obsidian VI (Level 6)",
        "Genie Suprem de Aur VII (Level 7)",
    ];

    return {
        totalGeneratedCodes: 0,
        pendingReferrals: 0,
        confirmedReferrals: safeCount,
        genieLevel,
        progressToNext: isMaxLevel ? 10 : progressToNext,
        referralsNeededForNext: isMaxLevel ? 0 : 10 - progressToNext,
        isMaxLevel,
        colorHex: colors[genieLevel] || colors[0],
        levelName: names[genieLevel] || names[0],
    };
}

/**
 * Parses raw decoded QR string or URL into clean referral code (client-safe).
 */
export function extractReferralCode(raw: string): string {
    const trimmed = (raw || "").trim();
    if (!trimmed) return "";

    // Check if it's a URL like https://.../register?ref=MG-OWN-1234
    try {
        if (trimmed.includes("ref=")) {
            const parsedUrl = new URL(trimmed.startsWith("http") ? trimmed : `https://example.com/${trimmed}`);
            const refParam = parsedUrl.searchParams.get("ref");
            if (refParam) return refParam.trim().toUpperCase();
        }
    } catch {
        // Not a URL
    }

    // Check JSON payload
    try {
        const parsedJson = JSON.parse(trimmed);
        if (parsedJson?.code) return String(parsedJson.code).trim().toUpperCase();
        if (parsedJson?.ref) return String(parsedJson.ref).trim().toUpperCase();
    } catch {
        // Not JSON
    }

    // Direct code pattern
    return trimmed.toUpperCase();
}
