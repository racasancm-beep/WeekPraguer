"use client";

import { Space, SpacePhoto } from "@prisma/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Ruler } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";

interface SpaceCardProps {
    space: Space & { photos: SpacePhoto[]; bookings?: any[] };
}

export function SpaceCard({ space }: SpaceCardProps) {
    const { t, translateCategory } = useLanguage();

    // Occupancy logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let bookedHoursToday = 0;
    if (space.bookings) {
        space.bookings.forEach((bk: any) => {
            const start = new Date(bk.startTime);
            const end = new Date(bk.endTime);

            // Check if booking overlaps with today
            if (start < tomorrow && end > today) {
                const overlapStart = start > today ? start : today;
                const overlapEnd = end < tomorrow ? end : tomorrow;
                bookedHoursToday += (overlapEnd.getTime() - overlapStart.getTime()) / 3600000;
            }
        });
    }

    // Assume 12 bookable hours standard (e.g. 08:00 to 20:00) for percentage
    const occupancyPercent = Math.min(Math.round((bookedHoursToday / 12) * 100), 100);

    return (
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-[#E2ECEC] hover:border-[#008080]/40 rounded-2xl group bg-white">
            <Link href={`/spaces/${space.id}`} className="aspect-video w-full bg-gray-100 relative group overflow-hidden block">
                {space.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={space.photos[0].url}
                        alt={space.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {t("card.noImage")}
                    </div>
                )}
                {space.category && (
                    <div className="absolute top-2.5 left-2.5 bg-[#008080]/90 text-white backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
                        {translateCategory(space.category)}
                    </div>
                )}
                {space.photos.length > 1 && (
                    <div className="absolute bottom-2.5 right-2.5 bg-black/60 text-white backdrop-blur-sm px-2 py-0.5 rounded-md text-[11px] font-medium">
                        📷 {space.photos.length}
                    </div>
                )}
            </Link>

            <CardContent className="p-4">
                <h3 className="font-bold text-base line-clamp-1 mb-1 text-gray-900 group-hover:text-[#008080] transition-colors" title={space.name}>
                    {space.name}
                </h3>
                <div className="flex items-center text-xs text-gray-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-[#008080] flex-shrink-0" />
                    <span className="truncate">{space.city}{space.district ? ` • ${space.district}` : ""}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                    <div className="flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {space.capacity} {t("card.pers")}
                    </div>
                    <div className="flex items-center">
                        <Ruler className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {space.size} m²
                    </div>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 h-8">
                    {space.description}
                </p>

                <div className="mt-3 flex items-center justify-between text-[10px] bg-[#E2ECEC]/50 px-2 py-1.5 rounded-lg border border-[#008080]/10">
                    <div className="flex items-center gap-1.5 font-semibold text-[#008080]">
                        <span className="w-2 h-2 rounded-full bg-[#008080] animate-pulse"></span>
                        {occupancyPercent}% {t("card.occupiedToday")}
                    </div>
                    <span className="text-gray-400 font-bold tracking-wider">{t("card.viaSite")}</span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-gray-100 mt-1">
                <div>
                    <span className="font-black text-lg text-[#008080]">
                        {space.hourlyRate} RON
                    </span>
                    <span className="text-xs text-gray-500 ml-1">/ h</span>
                </div>
                <Link href={`/spaces/${space.id}`}>
                    <Button size="sm" className="bg-[#1A2020] hover:bg-[#008080] text-white rounded-xl text-xs font-semibold h-8 px-3.5 transition-colors">
                        {t("card.viewSpace")}
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
