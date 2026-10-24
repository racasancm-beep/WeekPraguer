import { SpaceFilters } from "@/components/explore/space-filters";
import { SpaceGrid } from "@/components/explore/space-grid";
import MapComponent from "@/components/ui/map-component";
import React from "react";

export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";

async function getSpaces(searchParams: { [key: string]: string | string[] | undefined }) {
    const city = searchParams.city as string | undefined;
    const category = searchParams.category as string | undefined;
    const q = searchParams.q as string | undefined;
    const minPrice = searchParams.minPrice as string | undefined;
    const maxPrice = searchParams.maxPrice as string | undefined;
    const capacity = searchParams.capacity as string | undefined;
    const amenities = searchParams.amenities as string | undefined;
    const lat = searchParams.lat ? parseFloat(searchParams.lat as string) : undefined;
    const lng = searchParams.lng ? parseFloat(searchParams.lng as string) : undefined;
    const type = searchParams.type as string | undefined;

    const where: any = { active: true };

    if (lat && lng) {
        const latOffset = 0.45;
        const lngOffset = 0.60;
        where.latitude = { gte: lat - latOffset, lte: lat + latOffset };
        where.longitude = { gte: lng - lngOffset, lte: lng + lngOffset };
    } else if (city) {
        where.city = { contains: city, mode: 'insensitive' };
    }

    if (category) {
        const serviceKeywords: Record<string, string[]> = {
            curatenie: ["curatenie", "clean", "igienizare"],
            catering: ["catering", "coffee", "mancare", "kitchen", "cocina"],
            fotografie: ["foto", "video", "estudio", "camera"],
            sonorizare: ["sunet", "sound", "dj", "audio", "microfon"],
            proiectoare: ["proiector", "ecran", "led", "tv", "projector"],
            asistenta: ["tehnic", "tech", "wifi", "internet", "it"],
            securitate: ["securitate", "security", "paza", "acces"],
            bar: ["bar", "bauturi", "cocktail", "barista"],
            decor: ["decor", "flori", "mobilier", "design"],
            hostess: ["hostess", "receptie", "protocol"]
        };

        const keywords = serviceKeywords[category.toLowerCase()];
        if (keywords && keywords.length > 0) {
            where.OR = [
                { category: { contains: category, mode: 'insensitive' } },
                ...keywords.map(kw => ({ description: { contains: kw, mode: 'insensitive' } })),
                ...keywords.map(kw => ({ name: { contains: kw, mode: 'insensitive' } })),
                ...keywords.map(kw => ({ amenitiesList: { contains: kw, mode: 'insensitive' } }))
            ];
        } else {
            where.OR = [
                { category: { contains: category, mode: 'insensitive' } },
                { description: { contains: category, mode: 'insensitive' } },
                { name: { contains: category, mode: 'insensitive' } }
            ];
        }
    }

    // Do not filter out if q is literally "servicii"
    if (q && q.toLowerCase() !== "servicii") {
        where.OR = [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } }
        ];
    }

    if (minPrice || maxPrice) {
        where.hourlyRate = {};
        if (minPrice) where.hourlyRate.gte = parseFloat(minPrice);
        if (maxPrice) where.hourlyRate.lte = parseFloat(maxPrice);
    }

    if (capacity) {
        where.capacity = { gte: parseInt(capacity) };
    }

    if (amenities) {
        const amenityList = amenities.split(",");
        where.AND = amenityList.map((amenity) => ({
            amenitiesList: { contains: amenity }
        }));
    }

    const sort = searchParams.sort as string | undefined;

    let spaces = await prisma.space.findMany({
        where,
        include: {
            photos: true,
            bookings: {
                where: {
                    status: { in: ["CONFIRMED", "COMPLETED"] }
                },
                select: {
                    startTime: true,
                    endTime: true
                }
            }
        },
        orderBy: {
            id: 'asc'
        }
    });

    const spacesWithHours = spaces.map(space => {
        const totalBookedHours = space.bookings.reduce((total, booking) => {
            const start = new Date(booking.startTime).getTime();
            const end = new Date(booking.endTime).getTime();
            const hours = (end - start) / (1000 * 60 * 60);
            return total + (hours > 0 ? hours : 0);
        }, 0);
        return {
            ...space,
            totalBookedHours
        };
    });

    if (sort === "price_asc") {
        spacesWithHours.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sort === "price_desc") {
        spacesWithHours.sort((a, b) => b.hourlyRate - a.hourlyRate);
    } else {
        spacesWithHours.sort((a, b) => b.totalBookedHours - a.totalBookedHours);
    }

    return spacesWithHours;
}

export default async function ExploreSpacesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const spaces = await getSpaces(params);
    const selectedCity = params.city as string | undefined;
    const isServiceMode = params.type === "servicii" || params.category === "servicii";

    const romaniaCitiesCoords: Record<string, [number, number]> = {
        "București": [44.4268, 26.1025],
        "Cluj-Napoca": [46.7712, 23.6236],
        "Timișoara": [45.7489, 21.2087],
        "Iași": [47.1585, 27.6014],
        "Constanța": [44.1792, 28.6499],
        "Brașov": [45.6427, 25.5887],
        "Craiova": [44.3302, 23.7949],
        "Galați": [45.4353, 28.0080],
        "Oradea": [47.0465, 21.9189],
        "Brăila": [45.2692, 27.9575],
    };

    let defaultLat = 44.4268;
    let defaultLng = 26.1025;
    
    const urlLat = params.lat ? parseFloat(params.lat as string) : null;
    const urlLng = params.lng ? parseFloat(params.lng as string) : null;
    
    const normalizeString = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    if (urlLat && urlLng) {
        defaultLat = urlLat;
        defaultLng = urlLng;
    } else if (selectedCity) {
        const normalizedSelected = normalizeString(selectedCity);
        const foundKey = Object.keys(romaniaCitiesCoords).find(k => normalizeString(k) === normalizedSelected);
        if (foundKey) {
            defaultLat = romaniaCitiesCoords[foundKey][0];
            defaultLng = romaniaCitiesCoords[foundKey][1];
        }
    } else if (spaces.length > 0 && spaces[0].latitude && spaces[0].longitude) {
        defaultLat = spaces[0].latitude;
        defaultLng = spaces[0].longitude;
    }

    const centerLat = defaultLat;
    const centerLng = defaultLng;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                            {isServiceMode ? "Explorează Servicii & Spații" : "Explore Spaces by the Hour"}
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm font-medium">
                            {isServiceMode
                                ? `Găsește spații cu servicii verificate (${spaces.length} spații disponibile).`
                                : `Find and book unique spaces for any project or event (${spaces.length} spaces available).`
                            }
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-72 flex-shrink-0 relative z-20 overflow-visible">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm sticky top-8 overflow-visible">
                            <React.Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />}>
                                <SpaceFilters
    initialType={params.type as string}
    initialCategory={params.category as string}
    initialQuery={params.q as string}
    initialCity={params.city as string}
/>
                            </React.Suspense>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="w-full h-[300px] md:h-[400px]">
                            <MapComponent lat={centerLat} lng={centerLng} zoom={13} showDirectionsLink={false} spaces={spaces} />
                        </div>
                        <SpaceGrid spaces={spaces} />
                    </div>
                </div>
            </div>
        </div>
    );
}
