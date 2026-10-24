import { NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBgYxlln25mL1D5b5IxDn95lVIvs2MPcqM";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
        return NextResponse.json({ places: [] });
    }

    try {
        // Call Google Places API (New) from the server using the WeekPragueR API key and its authorized referer
        const googleRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
                "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location",
                "Referer": "http://localhost:5173/",
            },
            body: JSON.stringify({
                textQuery: q,
                maxResultCount: 6,
            }),
        });

        if (googleRes.ok) {
            const data = await googleRes.json();
            const places = (data.places || [])
                .filter((p: any) => p.location?.latitude && p.location?.longitude)
                .map((p: any) => ({
                    id: p.id || `${p.location.latitude},${p.location.longitude}`,
                    name: p.displayName?.text || p.formattedAddress,
                    address: p.formattedAddress || "",
                    lat: p.location.latitude,
                    lng: p.location.longitude,
                }));

            return NextResponse.json({ places, source: "google" });
        }
    } catch (err) {
        console.error("Google Places search error:", err);
    }

    // Fallback to OpenStreetMap Nominatim if needed
    try {
        const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
            {
                headers: { "User-Agent": "MyGenieEurope/1.0" },
            }
        );
        if (nomRes.ok) {
            const nomData = await nomRes.json();
            const places = (nomData || []).map((item: any) => ({
                id: String(item.place_id),
                name: item.display_name?.split(",")[0] || item.display_name,
                address: item.display_name || "",
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
            }));
            return NextResponse.json({ places, source: "nominatim" });
        }
    } catch (err) {
        console.error("Nominatim fallback error:", err);
    }

    return NextResponse.json({ places: [] });
}
