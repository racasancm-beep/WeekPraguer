"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// Fix for default Leaflet markers in Next.js
const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface InteractiveMapProps {
    lat: number;
    lng: number;
    zoom: number;
    spaces?: any[];
}

function LocationSelector() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useMapEvents({
        click(e) {
            // When user clicks the map, we want to clear the city and maybe do a radius search
            // But since our backend currently searches strictly by 'city', a simple click might 
            // not map perfectly to a city string without reverse geocoding. 
            // For now, we can just center the map there and let the user visually explore.
            // Ideally, we'd update a ?lat= & ?lng= in the URL.
            const params = new URLSearchParams(searchParams.toString());
            // Clear the explicit city name since they are doing a map click search
            params.delete("city"); 
            params.set("lat", e.latlng.lat.toString());
            params.set("lng", e.latlng.lng.toString());
            // Force a re-fetch of spaces near this coordinate if we had geo-search implemented
            router.push(`${pathname}?${params.toString()}`);
        },
    });

    return null;
}

export default function InteractiveMap({ lat, lng, zoom, spaces = [] }: InteractiveMapProps) {
    return (
        <MapContainer 
            center={[lat, lng]} 
            zoom={zoom} 
            scrollWheelZoom={false}
            className="w-full h-full z-0"
            key={`${lat}-${lng}`} // Force re-render when coordinates change drastically
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationSelector />

            {spaces.map((space) => (
                <Marker 
                    key={space.id} 
                    position={[space.latitude, space.longitude]}
                    icon={customIcon}
                >
                    <Popup className="rounded-xl">
                        <div className="font-bold text-gray-900">{space.name}</div>
                        <div className="text-[#008080] font-semibold">{space.hourlyRate} RON/h</div>
                        <div className="text-xs text-gray-500">{space.city}</div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
