"use client";

import { useLanguage } from "@/lib/i18n/language-context";

interface ExploreHeaderProps {
    isServiceMode: boolean;
    count: number;
}

export function ExploreHeader({ isServiceMode, count }: ExploreHeaderProps) {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                    {isServiceMode ? t("explore.servicesTitle") : t("explore.title")}
                </h1>
                <p className="text-gray-500 mt-1 text-sm font-medium">
                    {isServiceMode
                        ? `${t("explore.servicesSubtitle")} (${count} ${t("explore.spacesAvailable")}).`
                        : `${t("explore.subtitle")} (${count} ${t("explore.spacesAvailable")}).`}
                </p>
            </div>
        </div>
    );
}
