"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Autocomplete } from "@react-google-maps/api";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Navigation, RotateCcw, Search } from "lucide-react";

const GOOGLE_MAPS_API_KEY =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBgYxlln25mL1D5b5IxDn95lVIvs2MPcqM";

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

const containerStyle = {
    width: "100%",
    height: "100%",
    borderRadius: "1rem",
};

const defaultCenter = {
    lat: 44.4268, // Bucharest, Romania
    lng: 26.1025,
};

const ROMANIA_CITIES_COORDS: Record<string, { lat: number; lng: number }> = {
    bucuresti: { lat: 44.4268, lng: 26.1025 },
    "cluj-napoca": { lat: 46.7712, lng: 23.6236 },
    cluj: { lat: 46.7712, lng: 23.6236 },
    timisoara: { lat: 45.7489, lng: 21.2087 },
    iasi: { lat: 47.1585, lng: 27.6014 },
    constanta: { lat: 44.1792, lng: 28.6499 },
    brasov: { lat: 45.6427, lng: 25.5887 },
    craiova: { lat: 44.3302, lng: 23.7949 },
    galati: { lat: 45.4353, lng: 28.008 },
    oradea: { lat: 47.0465, lng: 21.9189 },
    sibiu: { lat: 45.7983, lng: 24.1256 },
    braila: { lat: 45.2692, lng: 27.9575 },
};

function normalizeCityName(str: string) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

function resolveSpacePosition(space: any, index: number): { lat: number; lng: number } {
    let lat = typeof space.latitude === "number" ? space.latitude : defaultCenter.lat;
    let lng = typeof space.longitude === "number" ? space.longitude : defaultCenter.lng;

    // If a non-Bucharest space still has exact Bucharest fallback coordinates, resolve from its city
    if (
        Math.abs(lat - 44.4268) < 0.0005 &&
        Math.abs(lng - 26.1025) < 0.0005 &&
        space.city
    ) {
        const key = normalizeCityName(space.city);
        const cityCoords = ROMANIA_CITIES_COORDS[key];
        if (cityCoords) {
            lat = cityCoords.lat;
            lng = cityCoords.lng;
        }
    }

    // Slight deterministic offset when two spaces share identical coordinates so both markers remain clickable
    const angle = (index * 137.5 * Math.PI) / 180;
    const offset = index === 0 ? 0 : 0.0018 * ((index % 5) + 1);
    return {
        lat: lat + Math.cos(angle) * offset,
        lng: lng + Math.sin(angle) * offset,
    };
}

interface MapComponentProps {
    lat?: number;
    lng?: number;
    zoom?: number;
    address?: string;
    showDirectionsLink?: boolean;
    spaces?: any[];
}

export default function MapComponent(props: MapComponentProps) {
    return (
        <Suspense
            fallback={
                <div className="w-full h-full min-h-[220px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl flex items-center justify-center">
                    <span className="text-gray-400 font-medium">Loading Google Maps...</span>
                </div>
            }
        >
            <GoogleMapContent {...props} />
        </Suspense>
    );
}

function GoogleMapContent({
    lat,
    lng,
    zoom = 13,
    address,
    showDirectionsLink = true,
    spaces,
}: MapComponentProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isExploreMode = Array.isArray(spaces);
    const spaceList = spaces || [];

    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const mapRef = useRef<google.maps.Map | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
    const [searchText, setSearchText] = useState("");

    const hasExplicitFilter = Boolean(
        searchParams?.get("city") || searchParams?.get("lat") || searchParams?.get("lng")
    );

    const resolvedSpaces = useMemo(() => {
        return spaceList.map((sp, idx) => ({
            ...sp,
            resolvedPosition: resolveSpacePosition(sp, idx),
        }));
    }, [spaceList]);

    const center = useMemo(() => {
        const urlLat = searchParams?.get("lat") ? parseFloat(searchParams.get("lat")!) : undefined;
        const urlLng = searchParams?.get("lng") ? parseFloat(searchParams.get("lng")!) : undefined;
        if (urlLat && urlLng) {
            return { lat: urlLat, lng: urlLng };
        }
        if (typeof lat === "number" && typeof lng === "number") {
            return { lat, lng };
        }
        if (resolvedSpaces.length > 0) {
            return resolvedSpaces[0].resolvedPosition;
        }
        return defaultCenter;
    }, [lat, lng, resolvedSpaces, searchParams]);

    const fitAllMarkers = useCallback(
        (mapInstance: google.maps.Map) => {
            if (!isExploreMode || resolvedSpaces.length === 0) return;

            if (!hasExplicitFilter && resolvedSpaces.length > 1 && window.google?.maps) {
                const bounds = new window.google.maps.LatLngBounds();
                resolvedSpaces.forEach((sp) => bounds.extend(sp.resolvedPosition));
                mapInstance.fitBounds(bounds, 65);
            } else {
                mapInstance.setCenter(center);
                mapInstance.setZoom(zoom);
            }
        },
        [isExploreMode, resolvedSpaces, hasExplicitFilter, center, zoom]
    );

    const onMapLoad = useCallback(
        (mapInstance: google.maps.Map) => {
            mapRef.current = mapInstance;
            fitAllMarkers(mapInstance);
        },
        [fitAllMarkers]
    );

    useEffect(() => {
        if (mapRef.current && isLoaded) {
            fitAllMarkers(mapRef.current);
        }
    }, [fitAllMarkers, isLoaded]);

    const handlePlaceChanged = () => {
        if (!autocompleteRef.current) return;
        const place = autocompleteRef.current.getPlace();
        if (place?.geometry?.location) {
            const newLat = place.geometry.location.lat();
            const newLng = place.geometry.location.lng();
            const params = new URLSearchParams(searchParams?.toString() || "");
            params.delete("city");
            params.set("lat", newLat.toFixed(6));
            params.set("lng", newLng.toFixed(6));
            router.push(`${pathname}?${params.toString()}`);
        }
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (!isExploreMode || !e.latLng) return;
        setSelectedSpace(null);
        const clickedLat = e.latLng.lat();
        const clickedLng = e.latLng.lng();
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.delete("city");
        params.set("lat", clickedLat.toFixed(6));
        params.set("lng", clickedLng.toFixed(6));
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleResetMapFilter = () => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.delete("lat");
        params.delete("lng");
        params.delete("city");
        setSearchText("");
        setSelectedSpace(null);
        router.push(`${pathname}?${params.toString()}`);
    };

    if (loadError) {
        return (
            <div className="w-full h-full min-h-[220px] bg-red-50 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-red-200">
                <p className="text-red-600 font-bold text-sm">Failed to load Google Maps</p>
                <p className="text-xs text-red-500 mt-1">Please check your internet connection or API key.</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-full min-h-[220px] bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse flex items-center justify-center text-gray-400 text-sm font-medium">
                Loading Google Maps...
            </div>
        );
    }

    const clickedLatParam = searchParams?.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
    const clickedLngParam = searchParams?.get("lng") ? parseFloat(searchParams.get("lng")!) : null;

    return (
        <div className="relative w-full h-full min-h-[220px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shadow-sm">
            {/* Google Places Search Bar & Reset Controls on /explore */}
            {isExploreMode && (
                <div className="absolute top-3 left-3 right-14 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
                    <div className="pointer-events-auto w-full sm:w-80 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 flex items-center px-3 py-1.5">
                        <Search className="w-4 h-4 text-[#008080] mr-2 flex-shrink-0" />
                        <Autocomplete
                            onLoad={(auto) => {
                                autocompleteRef.current = auto;
                            }}
                            onPlaceChanged={handlePlaceChanged}
                            className="w-full"
                        >
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                placeholder="Search city or address on Google Maps..."
                                className="w-full text-xs font-semibold text-gray-800 bg-transparent focus:outline-none"
                            />
                        </Autocomplete>
                    </div>

                    {hasExplicitFilter && (
                        <button
                            type="button"
                            onClick={handleResetMapFilter}
                            className="pointer-events-auto inline-flex items-center gap-1.5 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Show All Spaces on Map
                        </button>
                    )}
                </div>
            )}

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
                onLoad={onMapLoad}
                onClick={handleMapClick}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: true,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    clickableIcons: false,
                }}
            >
                {/* Explore Mode: Render all space markers */}
                {isExploreMode ? (
                    <>
                        {clickedLatParam && clickedLngParam && (
                            <Marker
                                position={{ lat: clickedLatParam, lng: clickedLngParam }}
                                title="Selected Search Area"
                            />
                        )}

                        {resolvedSpaces.map((space) => (
                            <Marker
                                key={space.id}
                                position={space.resolvedPosition}
                                title={`${space.name} (${space.hourlyRate} RON/h)`}
                                onClick={() => setSelectedSpace(space)}
                            />
                        ))}

                        {selectedSpace && (
                            <InfoWindow
                                position={selectedSpace.resolvedPosition}
                                onCloseClick={() => setSelectedSpace(null)}
                            >
                                <div className="p-1.5 min-w-[190px] max-w-[230px] text-gray-900">
                                    {selectedSpace.photos?.[0]?.url && (
                                        <img
                                            src={selectedSpace.photos[0].url}
                                            alt={selectedSpace.name}
                                            className="w-full h-24 object-cover rounded-lg mb-2"
                                        />
                                    )}
                                    <div className="font-black text-sm text-gray-900 truncate">
                                        {selectedSpace.name}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-3 h-3 text-[#008080]" />
                                        {selectedSpace.city}
                                    </div>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                        <span className="text-sm font-black text-[#008080]">
                                            {selectedSpace.hourlyRate} RON/h
                                        </span>
                                        <Link
                                            href={`/spaces/${selectedSpace.id}`}
                                            className="text-xs font-bold bg-[#008080] text-white px-2.5 py-1 rounded-lg hover:bg-[#006666] transition-colors"
                                        >
                                            View Space →
                                        </Link>
                                    </div>
                                </div>
                            </InfoWindow>
                        )}
                    </>
                ) : (
                    /* Single Space Mode (/spaces/[id] or Owner SpaceForm) */
                    <Marker position={center} title={address || "Space Location"} />
                )}
            </GoogleMap>

            {/* Directions link on single-space detail pages */}
            {!isExploreMode && showDirectionsLink && (
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        address || `${center.lat},${center.lng}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 bg-white/95 hover:bg-white text-gray-900 text-xs font-bold px-3 py-2 rounded-xl shadow-md border border-gray-200 transition-all"
                >
                    <Navigation className="w-3.5 h-3.5 text-[#008080]" />
                    Open in Google Maps
                </a>
            )}
        </div>
    );
}
