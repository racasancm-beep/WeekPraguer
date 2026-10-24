"use client";

import { useMemo, useState } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";

interface Location {
    id: string;
    lat: number;
    lng: number;
    name: string;
    price: number;
}

interface MultipleMarkersMapProps {
    locations: Location[];
    centerLat?: number;
    centerLng?: number;
    zoom?: number;
}

export default function MultipleMarkersMap({ locations, centerLat, centerLng, zoom = 12 }: MultipleMarkersMapProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBgYxlln25mL1D5b5IxDn95lVIvs2MPcqM";
    
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: apiKey || "", 
    });

    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    // Calculate default center if not provided (average of all locations or fallback to Bucharest)
    const center = useMemo(() => {
        if (centerLat && centerLng) {
            return { lat: centerLat, lng: centerLng };
        }
        if (locations.length === 0) {
            return { lat: 44.4268, lng: 26.1025 }; // Bucharest
        }
        const sumLat = locations.reduce((sum, loc) => sum + loc.lat, 0);
        const sumLng = locations.reduce((sum, loc) => sum + loc.lng, 0);
        return {
            lat: sumLat / locations.length,
            lng: sumLng / locations.length
        };
    }, [locations, centerLat, centerLng]);

    if (!apiKey) {
        return (
            <div className="w-full h-full min-h-[400px] bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center p-6 text-center border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 font-medium mb-2">Google Maps is disabled</p>
                <p className="text-sm text-gray-400">Please add <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your .env file to enable the map.</p>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="w-full h-full min-h-[400px] bg-red-50 dark:bg-red-900/20 rounded-xl flex flex-col items-center justify-center p-6 text-center border border-dashed border-red-200 dark:border-red-800">
                <p className="text-red-500 font-medium mb-2">Failed to load Google Maps</p>
                <p className="text-sm text-red-400">Check your API key configuration.</p>
            </div>
        );
    }

    if (!isLoaded) return <div className="w-full h-full min-h-[400px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl flex items-center justify-center">Loading map...</div>;

    return (
        <GoogleMap
            zoom={zoom}
            center={center}
            mapContainerClassName="w-full h-full min-h-[400px] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            options={{
                disableDefaultUI: false,
                clickableIcons: false,
                scrollwheel: true,
            }}
        >
            {locations.map((loc) => (
                <Marker
                    key={loc.id}
                    position={{ lat: loc.lat, lng: loc.lng }}
                    onClick={() => setSelectedLocation(loc)}
                />
            ))}

            {selectedLocation && (
                <InfoWindow
                    position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                    onCloseClick={() => setSelectedLocation(null)}
                >
                    <div className="p-2 min-w-[150px] text-gray-900">
                        <h3 className="font-bold text-sm mb-1">{selectedLocation.name}</h3>
                        <p className="text-sm font-medium text-teal-600">RON{selectedLocation.price}/hour</p>
                        <a href={`/spaces/${selectedLocation.id}`} className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                            View details
                        </a>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
}
