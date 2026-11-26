"use client";

import React from "react";

interface DarkerGenieBadgeProps {
    level: number; // 0 to 7
    size?: "sm" | "md" | "lg" | "xl";
    showTooltip?: boolean;
    className?: string;
}

export function DarkerGenieBadge({
    level = 0,
    size = "md",
    showTooltip = true,
    className = "",
}: DarkerGenieBadgeProps) {
    const safeLevel = Math.min(7, Math.max(0, level));
    const levelFraction = safeLevel / 7;
    const isGoldLevel = safeLevel === 7;

    const sizeClasses = {
        sm: "w-7 h-7",
        md: "w-10 h-10",
        lg: "w-16 h-16",
        xl: "w-24 h-24",
    };

    const dimension = sizeClasses[size] || sizeClasses.md;

    const levelDescriptions = [
        "Genie Nivel 0 (Alb Translucid)",
        "Genie Nivel 1 (Întunecat)",
        "Genie Nivel 2 (Safir)",
        "Genie Nivel 3 (Oceanic)",
        "Genie Nivel 4 (Indigo)",
        "Genie Nivel 5 (Mistic)",
        "Genie Nivel 6 (Obsidian)",
        "Genie Nivel 7 (Suprem cu Aur)",
    ];

    return (
        <div
            className={`relative inline-flex items-center justify-center shrink-0 select-none rounded-xl bg-gradient-to-br from-teal-50/80 to-teal-100/40 dark:from-gray-800 dark:to-gray-900 border border-teal-200/60 dark:border-teal-700/60 p-0.5 group/badge ${dimension} ${className}`}
            title={showTooltip ? levelDescriptions[safeLevel] : undefined}
        >
            {/* Ambient Aura */}
            <div
                className="absolute inset-0 rounded-xl blur-md transition-all duration-300 pointer-events-none"
                style={{
                    background: isGoldLevel
                        ? "radial-gradient(circle, rgba(218,165,32,0.6) 0%, transparent 70%)"
                        : `radial-gradient(circle, rgba(0,128,128,${0.3 + levelFraction * 0.5}) 0%, transparent 70%)`,
                    opacity: 0.6 + levelFraction * 0.4,
                }}
            />

            {/* Level 0: Translucent White Genie */}
            <img
                src="/genie-translucent.png?v=7lvl"
                alt="Genie"
                className="relative w-full h-full object-contain pointer-events-none transition-all duration-300"
                style={{
                    opacity: Math.max(0.2, 1 - levelFraction * 0.8),
                    filter: "drop-shadow(0 2px 4px rgba(0,128,128,0.25))",
                }}
            />

            {/* Levels 1..6: Darker Solid Genie */}
            {safeLevel > 0 && !isGoldLevel && (
                <img
                    src="/genie-solid.png?v=7lvl"
                    alt={`Genie Level ${safeLevel}`}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-all duration-300"
                    style={{
                        opacity: levelFraction,
                        filter: `brightness(${1.1 - levelFraction * 0.45}) contrast(${1 + levelFraction * 0.3}) drop-shadow(0 2px 6px rgba(0,0,0,${0.3 + levelFraction * 0.4}))`,
                    }}
                />
            )}

            {/* Level 7: Golden Crown & Jewels Dark Genie */}
            {isGoldLevel && (
                <img
                    src="/genie-gold.png?v=7lvl"
                    alt="Gold Level 7 Genie"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none animate-pulse transition-opacity duration-300"
                    style={{
                        filter: "contrast(1.15) drop-shadow(0 2px 8px rgba(218,165,32,0.7))",
                    }}
                />
            )}

            {/* Tiny Level Pill Badge */}
            <span
                className={`absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.2 rounded-full border shadow-sm ${
                    isGoldLevel
                        ? "bg-amber-400 text-amber-950 border-amber-300"
                        : safeLevel > 0
                        ? "bg-gray-900 text-white border-gray-700"
                        : "bg-teal-100 text-teal-800 border-teal-200"
                }`}
            >
                L{safeLevel}
            </span>
        </div>
    );
}
