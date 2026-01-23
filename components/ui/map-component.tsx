"use client";

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useMemo } from 'react';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.75rem',
};

const defaultCenter = {
    lat: 50.0755,
    lng: 14.4378
};

interface MapComponentProps {
    lat?: number;
    lng?: number;
    zoom?: number;
}

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

export default function MapComponent({ lat, lng, zoom = 14 }: MapComponentProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries
    });

    const center = useMemo(() => ({
        lat: lat || defaultCenter.lat,
        lng: lng || defaultCenter.lng
    }), [lat, lng]);

    if (!isLoaded) {
        return (
            <div className="w-full h-full bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400 text-sm">
                Loading Map...
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
            options={{
                disableDefaultUI: true,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
            }}
        >
            {lat && lng && <Marker position={center} />}
        </GoogleMap>
    );
}
