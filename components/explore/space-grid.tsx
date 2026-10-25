"use client";

import { Space, SpacePhoto } from "@prisma/client";
import { SpaceCard } from "./space-card";
import { useLanguage } from "@/lib/i18n/language-context";

interface SpaceGridProps {
    spaces: (Space & { photos: SpacePhoto[] })[];
}

export function SpaceGrid({ spaces }: SpaceGridProps) {
    const { t } = useLanguage();

    if (spaces.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t("grid.noSpaces")}</h3>
                <p className="mt-2 text-gray-500">{t("grid.tryAdjusting")}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
                <SpaceCard key={space.id} space={space} />
            ))}
        </div>
    );
}
