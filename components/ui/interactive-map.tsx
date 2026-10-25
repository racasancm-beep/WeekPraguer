"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Navigation, RotateCcw, Search, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

// Google Maps style red pin SVG icon
const googlePinSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
  <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/>
  </filter>
  <path filter="url(#shadow)" d="M16 1C8.268 1 2 7.268 2 15c0 10.5 14 27 14 27s14-16.5 14-27C30 7.268 23.732 1 16 1z" fill="#EA4335" stroke="#B31412" stroke-width="1.5"/>
  <circle cx="16" cy="15" r="5.5" fill="#800E0E"/>
  <circle cx="16" cy="15" r="4.5" fill="#FFFFFF"/>
</svg>
`);

const googleSearchPinSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 32 44">
  <path d="M16 1C8.268 1 2 7.268 2 15c0 10.5 14 27 14 27s14-16.5 14-27C30 7.268 23.732 1 16 1z" fill="#008080" stroke="#004D4D" stroke-width="1.5"/>
  <circle cx="16" cy="15" r="5" fill="#FFFFFF"/>
</svg>
`);

const googlePinIcon = new L.Icon({
    iconUrl: `data:image/svg+xml;utf8,${googlePinSvg}`,
    iconSize: [32, 44],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
});

const searchAreaPinIcon = new L.Icon({
    iconUrl: `data:image/svg+xml;utf8,${googleSearchPinSvg}`,
    iconSize: [30, 42],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
});

const ROMANIA_CITIES_COORDS: Record<string, { lat: number; lng: number }> = {
    bucuresti: { lat: 44.4268, lng: 26.1025 },
    bucharest: { lat: 44.4268, lng: 26.1025 },
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
    prague: { lat: 50.0755, lng: 14.4378 },
    praha: { lat: 50.0755, lng: 14.4378 },
    praga: { lat: 50.0755, lng: 14.4378 },
    budapest: { lat: 47.4979, lng: 19.0402 },
    budapesta: { lat: 47.4979, lng: 19.0402 },
    vienna: { lat: 48.2082, lng: 16.3738 },
    wien: { lat: 48.2082, lng: 16.3738 },
    viena: { lat: 48.2082, lng: 16.3738 },
    berlin: { lat: 52.52, lng: 13.405 },
    munich: { lat: 48.1351, lng: 11.582 },
    munchen: { lat: 48.1351, lng: 11.582 },
    warsaw: { lat: 52.2297, lng: 21.0122 },
    bratislava: { lat: 48.1486, lng: 17.1077 },
};

function normalizeCityName(str: string) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

function resolveSpacePosition(space: any, index: number): [number, number] {
    let lat = typeof space.latitude === "number" ? space.latitude : 44.4268;
    let lng = typeof space.longitude === "number" ? space.longitude : 26.1025;

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

    const angle = (index * 137.5 * Math.PI) / 180;
    const offset = index === 0 ? 0 : 0.0018 * ((index % 5) + 1);
    return [lat + Math.cos(angle) * offset, lng + Math.sin(angle) * offset];
}

export interface InteractiveMapProps {
    lat: number;
    lng: number;
    zoom: number;
    address?: string;
    showDirectionsLink?: boolean;
    spaces?: any[];
    onLocationChange?: (lat: number, lng: number) => void;
}

function MapViewUpdater({
    center,
    zoom,
    positions,
    shouldFitBounds,
}: {
    center: [number, number];
    zoom: number;
    positions: [number, number][];
    shouldFitBounds: boolean;
}) {
    const map = useMap();

    useEffect(() => {
        if (shouldFitBounds && positions.length > 1) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        } else if (Number.isFinite(center[0]) && Number.isFinite(center[1])) {
            map.flyTo(center, zoom, { animate: true, duration: 0.75 });
        }
    }, [map, center[0], center[1], zoom, positions, shouldFitBounds]);

    return null;
}

function MapClickHandler({
    enabled,
    onLocationChange,
}: {
    enabled: boolean;
    onLocationChange?: (lat: number, lng: number) => void;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useMapEvents({
        click(e) {
            if (onLocationChange) {
                onLocationChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
                return;
            }
            if (!enabled) return;
            const params = new URLSearchParams(searchParams?.toString() || "");
            params.delete("city");
            params.set("lat", e.latlng.lat.toFixed(6));
            params.set("lng", e.latlng.lng.toFixed(6));
            router.push(`${pathname}?${params.toString()}`);
        },
    });

    return null;
}

interface PlaceSuggestion {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
}

export default function InteractiveMap({
    lat,
    lng,
    zoom = 13,
    address,
    showDirectionsLink = true,
    spaces,
    onLocationChange,
}: InteractiveMapProps) {
    const { t } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isExploreMode = Array.isArray(spaces);
    const spaceList = spaces || [];

    const [mapType, setMapType] = useState<"roadmap" | "hybrid">("roadmap");
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [searching, setSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const hasExplicitFilter = Boolean(
        searchParams?.get("city") || searchParams?.get("lat") || searchParams?.get("lng")
    );

    const resolvedSpaces = useMemo(() => {
        return spaceList.map((sp, idx) => ({
            ...sp,
            resolvedPosition: resolveSpacePosition(sp, idx),
        }));
    }, [spaceList]);

    const positions = useMemo(
        () => resolvedSpaces.map((sp) => sp.resolvedPosition),
        [resolvedSpaces]
    );

    const center: [number, number] = useMemo(() => {
        const urlLat = searchParams?.get("lat") ? parseFloat(searchParams.get("lat")!) : undefined;
        const urlLng = searchParams?.get("lng") ? parseFloat(searchParams.get("lng")!) : undefined;
        if (urlLat && urlLng) {
            return [urlLat, urlLng];
        }
        return [lat, lng];
    }, [lat, lng, searchParams]);

    // Debounced Google Places API search via /api/maps/search
    useEffect(() => {
        if (!isExploreMode) return;
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        const q = searchQuery.trim();
        if (q.length < 2) {
            setSuggestions([]);
            setSearching(false);
            return;
        }

        setSearching(true);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/maps/search?q=${encodeURIComponent(q)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data.places || []);
                    setShowDropdown(true);
                }
            } catch (e) {
                console.error("Google Places search failed:", e);
            } finally {
                setSearching(false);
            }
        }, 260);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchQuery, isExploreMode]);

    const selectPlace = (place: PlaceSuggestion) => {
        setSearchQuery(place.name);
        setShowDropdown(false);
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.delete("city");
        params.set("lat", place.lat.toFixed(6));
        params.set("lng", place.lng.toFixed(6));
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (suggestions.length > 0) {
            selectPlace(suggestions[0]);
            return;
        }
        const q = searchQuery.trim();
        if (!q) return;
        setSearching(true);
        try {
            const res = await fetch(`/api/maps/search?q=${encodeURIComponent(q)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.places?.length > 0) {
                    selectPlace(data.places[0]);
                }
            }
        } finally {
            setSearching(false);
        }
    };

    const handleResetMapFilter = () => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.delete("lat");
        params.delete("lng");
        params.delete("city");
        setSearchQuery("");
        setSuggestions([]);
        setShowDropdown(false);
        router.push(`${pathname}?${params.toString()}`);
    };

    const clickedLatParam = searchParams?.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
    const clickedLngParam = searchParams?.get("lng") ? parseFloat(searchParams.get("lng")!) : null;

    // Google Maps official tile layer URLs (Roadmap & Satellite Hybrid)
    const googleTileUrl =
        mapType === "roadmap"
            ? "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            : "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";

    return (
        <div className="relative w-full h-full min-h-[220px]">
            {/* Top-left Google Places Search Bar & Reset Filter Button on /explore */}
            {isExploreMode && (
                <div className="absolute top-3 left-14 right-32 z-[1000] flex flex-wrap items-start gap-2 pointer-events-none">
                    <div className="relative pointer-events-auto w-full sm:w-80">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 flex items-center px-3 py-2"
                        >
                            {searching ? (
                                <Loader2 className="w-4 h-4 text-[#008080] mr-2 animate-spin flex-shrink-0" />
                            ) : (
                                <Search className="w-4 h-4 text-[#008080] mr-2 flex-shrink-0" />
                            )}
                            <input
                                type="text"
                                value={searchQuery}
                                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t("map.searchPlaceholder")}
                                className="w-full text-xs font-semibold text-gray-800 bg-transparent focus:outline-none"
                            />
                        </form>

                        {showDropdown && suggestions.length > 0 && (
                            <div className="mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 max-h-60 overflow-y-auto">
                                {suggestions.map((place) => (
                                    <button
                                        key={place.id}
                                        type="button"
                                        onClick={() => selectPlace(place)}
                                        className="w-full text-left px-3 py-2.5 hover:bg-teal-50/60 transition-colors flex items-start gap-2"
                                    >
                                        <MapPin className="w-4 h-4 text-[#EA4335] mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-gray-900 truncate">
                                                {place.name}
                                            </div>
                                            <div className="text-[11px] text-gray-500 truncate">
                                                {place.address}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {hasExplicitFilter && (
                        <button
                            type="button"
                            onClick={handleResetMapFilter}
                            className="pointer-events-auto inline-flex items-center gap-1.5 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {t("map.showAllSpaces")}
                        </button>
                    )}
                </div>
            )}

            {/* Top-right Google Map / Satellite switcher */}
            <div className="absolute top-3 right-3 z-[1000] bg-white rounded-xl shadow-md border border-gray-200 p-0.5 flex text-xs font-bold">
                <button
                    type="button"
                    onClick={() => setMapType("roadmap")}
                    className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                        mapType === "roadmap"
                            ? "bg-[#008080] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    {t("map.map")}
                </button>
                <button
                    type="button"
                    onClick={() => setMapType("hybrid")}
                    className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                        mapType === "hybrid"
                            ? "bg-[#008080] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    {t("map.satellite")}
                </button>
            </div>

            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
            >
                <TileLayer
                    key={mapType}
                    attribution="&copy; Google Maps"
                    url={googleTileUrl}
                    maxZoom={20}
                />

                <MapViewUpdater
                    center={center}
                    zoom={zoom}
                    positions={positions}
                    shouldFitBounds={isExploreMode && !hasExplicitFilter && positions.length > 1}
                />

                <MapClickHandler enabled={isExploreMode} onLocationChange={onLocationChange} />

                {isExploreMode ? (
                    <>
                        {clickedLatParam && clickedLngParam && (
                            <Marker
                                position={[clickedLatParam, clickedLngParam]}
                                icon={searchAreaPinIcon}
                            >
                                <Popup className="rounded-xl">
                                    <div className="text-xs font-bold text-gray-900">
                                        {t("map.selectedArea")}
                                    </div>
                                    <div className="text-[11px] text-gray-500">
                                        {clickedLatParam.toFixed(4)}, {clickedLngParam.toFixed(4)}
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {resolvedSpaces.map((space) => (
                            <Marker
                                key={space.id}
                                position={space.resolvedPosition}
                                icon={googlePinIcon}
                            >
                                <Popup className="rounded-xl">
                                    <div className="min-w-[180px] max-w-[220px] text-gray-900">
                                        {space.photos?.[0]?.url && (
                                            <img
                                                src={space.photos[0].url}
                                                alt={space.name}
                                                className="w-full h-24 object-cover rounded-lg mb-2"
                                            />
                                        )}
                                        <div className="font-black text-sm text-gray-900 truncate">
                                            {space.name}
                                        </div>
                                        <div className="text-xs text-gray-500 font-medium">
                                            {space.city}
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                            <span className="text-sm font-black text-[#008080]">
                                                {space.hourlyRate} RON/h
                                            </span>
                                            <Link
                                                href={`/spaces/${space.id}`}
                                                className="text-xs font-bold bg-[#008080] !text-white px-2.5 py-1 rounded-lg hover:bg-[#006666] transition-colors"
                                            >
                                                {t("map.viewSpace")}
                                            </Link>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </>
                ) : (
                    <Marker
                        position={center}
                        icon={googlePinIcon}
                        draggable={Boolean(onLocationChange)}
                        eventHandlers={
                            onLocationChange
                                ? {
                                      dragend: (e) => {
                                          const pos = e.target.getLatLng();
                                          onLocationChange(
                                              Number(pos.lat.toFixed(6)),
                                              Number(pos.lng.toFixed(6))
                                          );
                                      },
                                  }
                                : undefined
                        }
                    >
                        <Popup className="rounded-xl">
                            <div className="font-bold text-gray-900 text-xs">
                                {address || t("map.spaceLocation")}
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            {!isExploreMode && showDirectionsLink && (
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        address || `${center[0]},${center[1]}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 left-3 z-[1000] inline-flex items-center gap-1.5 bg-white/95 hover:bg-white text-gray-900 text-xs font-bold px-3 py-2 rounded-xl shadow-md border border-gray-200 transition-all"
                >
                    <Navigation className="w-3.5 h-3.5 text-[#008080]" />
                    {t("map.openInGoogleMaps")}
                </a>
            )}
        </div>
    );
}
