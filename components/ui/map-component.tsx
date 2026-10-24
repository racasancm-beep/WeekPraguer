"use client";

import dynamic from "next/dynamic";
import { Suspense, useMemo } from "react";

const InteractiveMap = dynamic(() => import("./interactive-map"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[220px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl flex items-center justify-center">
            <span className="text-gray-400 font-medium">Loading Google Maps...</span>
        </div>
    ),
});

const defaultCenter = {
    lat: 44.4268, // Bucharest, Romania
    lng: 26.1025,
};

interface MapComponentProps {
    lat?: number;
    lng?: number;
    zoom?: number;
    address?: string;
    showDirectionsLink?: boolean;
    spaces?: any[];
}

export default function MapComponent({
    lat,
    lng,
    zoom = 13,
    address,
    showDirectionsLink = true,
    spaces,
}: MapComponentProps) {
    const center = useMemo(
        () => ({
            lat: lat ?? defaultCenter.lat,
            lng: lng ?? defaultCenter.lng,
        }),
        [lat, lng]
    );

    return (
        <div className="relative w-full h-full min-h-[220px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shadow-sm">
            <Suspense
                fallback={
                    <div className="w-full h-full min-h-[220px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl flex items-center justify-center">
                        <span className="text-gray-400 font-medium">Loading Google Maps...</span>
                    </div>
                }
            >
                <InteractiveMap
                    lat={center.lat}
                    lng={center.lng}
                    zoom={zoom}
                    address={address}
                    showDirectionsLink={showDirectionsLink}
                    spaces={spaces}
                />
            </Suspense>
        </div>
    );
}
