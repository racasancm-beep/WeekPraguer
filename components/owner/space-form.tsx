"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, MapPin, Plus, X } from "lucide-react";
import MapComponent from "@/components/ui/map-component";
import { AMENITIES_OPTIONS } from "@/lib/constants/amenities";
import { useLanguage } from "@/lib/i18n/language-context";

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    "bucurești": { lat: 44.4268, lng: 26.1025 },
    "bucuresti": { lat: 44.4268, lng: 26.1025 },
    "bucharest": { lat: 44.4268, lng: 26.1025 },
    "cluj-napoca": { lat: 46.7712, lng: 23.6236 },
    "cluj": { lat: 46.7712, lng: 23.6236 },
    "timișoara": { lat: 45.7489, lng: 21.2087 },
    "timisoara": { lat: 45.7489, lng: 21.2087 },
    "iași": { lat: 47.1585, lng: 27.6014 },
    "iasi": { lat: 47.1585, lng: 27.6014 },
    "constanța": { lat: 44.1792, lng: 28.6499 },
    "constanta": { lat: 44.1792, lng: 28.6499 },
    "brașov": { lat: 45.6427, lng: 25.5887 },
    "brasov": { lat: 45.6427, lng: 25.5887 },
    "craiova": { lat: 44.3302, lng: 23.7949 },
    "galați": { lat: 45.4353, lng: 28.008 },
    "galati": { lat: 45.4353, lng: 28.008 },
    "oradea": { lat: 47.0465, lng: 21.9189 },
    "sibiu": { lat: 45.7983, lng: 24.1256 },
    "prague": { lat: 50.0755, lng: 14.4378 },
    "praha": { lat: 50.0755, lng: 14.4378 },
    "praga": { lat: 50.0755, lng: 14.4378 },
    "budapest": { lat: 47.4979, lng: 19.0402 },
    "budapesta": { lat: 47.4979, lng: 19.0402 },
    "vienna": { lat: 48.2082, lng: 16.3738 },
    "wien": { lat: 48.2082, lng: 16.3738 },
    "viena": { lat: 48.2082, lng: 16.3738 },
    "berlin": { lat: 52.52, lng: 13.405 },
    "munich": { lat: 48.1351, lng: 11.582 },
    "munchen": { lat: 48.1351, lng: 11.582 },
    "warsaw": { lat: 52.2297, lng: 21.0122 },
    "bratislava": { lat: 48.1486, lng: 17.1077 },
};

const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
    "prague 1": { lat: 50.0875, lng: 14.4213 },
    "praha 1": { lat: 50.0875, lng: 14.4213 },
    "prague 2": { lat: 50.0742, lng: 14.4376 },
    "praha 2": { lat: 50.0742, lng: 14.4376 },
    "prague 3": { lat: 50.0837, lng: 14.4659 },
    "praha 3": { lat: 50.0837, lng: 14.4659 },
    "prague 4": { lat: 50.0378, lng: 14.4494 },
    "praha 4": { lat: 50.0378, lng: 14.4494 },
    "prague 5": { lat: 50.0566, lng: 14.3712 },
    "praha 5": { lat: 50.0566, lng: 14.3712 },
    "prague 6": { lat: 50.0994, lng: 14.3547 },
    "praha 6": { lat: 50.0994, lng: 14.3547 },
    "prague 7": { lat: 50.1038, lng: 14.4307 },
    "praha 7": { lat: 50.1038, lng: 14.4307 },
    "prague 8": { lat: 50.1086, lng: 14.4764 },
    "praha 8": { lat: 50.1086, lng: 14.4764 },
    "prague 9": { lat: 50.1116, lng: 14.5105 },
    "praha 9": { lat: 50.1116, lng: 14.5105 },
    "prague 10": { lat: 50.0686, lng: 14.4876 },
    "praha 10": { lat: 50.0686, lng: 14.4876 },
    "sector 1": { lat: 44.4678, lng: 26.0781 },
    "sector 2": { lat: 44.4495, lng: 26.1322 },
    "sector 3": { lat: 44.4178, lng: 26.1558 },
    "sector 4": { lat: 44.3879, lng: 26.1194 },
    "sector 5": { lat: 44.4072, lng: 26.0596 },
    "sector 6": { lat: 44.4342, lng: 26.0188 },
};

async function geocodeQuery(query: string): Promise<{ lat: number; lng: number; label?: string } | null> {
    const q = query.trim();
    if (q.length < 2) return null;
    try {
        const res = await fetch(`/api/maps/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
            const data = await res.json();
            const first = data.places?.[0];
            if (first && typeof first.lat === "number" && typeof first.lng === "number") {
                return {
                    lat: Number(first.lat.toFixed(6)),
                    lng: Number(first.lng.toFixed(6)),
                    label: first.name || first.address || q,
                };
            }
        }
    } catch {
        // Ignore network errors and rely on fallback
    }
    return null;
}

const formSchema = z.object({
    name: z.string().min(2, "Required"),
    description: z.string().min(5, "Required"),
    address: z.string().min(3, "Required"),
    city: z.string().default("București"),
    district: z.string().optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    size: z.coerce.number().positive(),
    capacity: z.coerce.number().int().positive(),
    officeCount: z.coerce.number().int().optional(),
    hourlyRate: z.coerce.number().positive(),
    dailyRate: z.coerce.number().optional(),
    weekendRate: z.coerce.number().optional(),
    hasWifi: z.boolean().default(true),
    hasProjector: z.boolean().default(false),
    hasKitchen: z.boolean().default(false),
    hasParking: z.boolean().default(false),
    hasAC: z.boolean().default(false),
    selfCleaning: z.boolean().default(false),
    amenitiesList: z.array(z.string()).default([]),
});

interface SpaceFormProps {
    initialData?: any;
}

export function SpaceForm({ initialData }: SpaceFormProps) {
    const router = useRouter();
    const { t, translateAmenity } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [mapZoom, setMapZoom] = useState<number>(13);
    const [mapFocusLabel, setMapFocusLabel] = useState<string>("București");
    const [photos, setPhotos] = useState<string[]>(initialData?.photos?.map((p: any) => p.url || p) || []);
    const [photoUrl, setPhotoUrl] = useState("");
    const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stepTwoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastResolvedCityRef = useRef<string>("bucurești");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            description: "",
            address: "",
            city: "București",
            district: "",
            latitude: 44.4268,
            longitude: 26.1025,
            size: 50,
            capacity: 10,
            officeCount: 1,
            hourlyRate: 100,
            dailyRate: 600,
            weekendRate: 1100,
            hasWifi: true,
            hasProjector: false,
            hasKitchen: false,
            hasParking: false,
            hasAC: false,
            selfCleaning: false,
            amenitiesList: [],
        },
    });

    const watchedCity = form.watch("city") || "";
    const watchedDistrict = form.watch("district") || "";
    const watchedAddress = form.watch("address") || "";
    const watchedLat = form.watch("latitude");
    const watchedLng = form.watch("longitude");

    const updateCoordinates = useCallback(
        (lat: number, lng: number, zoomLevel?: number, focusText?: string) => {
            const roundedLat = Number(lat.toFixed(6));
            const roundedLng = Number(lng.toFixed(6));
            form.setValue("latitude", roundedLat, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            form.setValue("longitude", roundedLng, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            if (typeof zoomLevel === "number") {
                setMapZoom(zoomLevel);
            }
            if (focusText) {
                setMapFocusLabel(focusText);
            }
        },
        [form]
    );

    // Automatically open Google Map at City first, then move to District / Address and update Latitude & Longitude
    useEffect(() => {
        if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
        if (stepTwoTimerRef.current) clearTimeout(stepTwoTimerRef.current);

        const cityClean = watchedCity.trim();
        const districtClean = watchedDistrict.trim();
        const addressClean = watchedAddress.trim();

        if (!cityClean && !districtClean && !addressClean) return;

        // Instant lookup for known City so map jumps immediately while typing
        const cityNorm = cityClean.toLowerCase();
        const localCity = CITY_COORDS[cityNorm];
        const cityChanged = cityNorm && cityNorm !== lastResolvedCityRef.current;

        if (cityChanged && localCity) {
            lastResolvedCityRef.current = cityNorm;
            updateCoordinates(localCity.lat, localCity.lng, 12, cityClean);
        }

        geocodeTimerRef.current = setTimeout(async () => {
            setGeocoding(true);
            try {
                // Step 1: Ensure Google Map opens at the City location first whenever City is set/changed
                let cityCoords = localCity || null;
                if (cityClean && (!cityCoords || cityChanged)) {
                    const remoteCity = await geocodeQuery(cityClean);
                    if (remoteCity) {
                        cityCoords = { lat: remoteCity.lat, lng: remoteCity.lng };
                    }
                    if (cityCoords) {
                        lastResolvedCityRef.current = cityNorm;
                        updateCoordinates(cityCoords.lat, cityCoords.lng, 12, cityClean);
                    }
                }

                // Step 2: If District (or Address) is set, move from the City to the District and update Lat/Lng
                const targetSubLocation = districtClean || addressClean;
                if (targetSubLocation && targetSubLocation.toLowerCase() !== cityNorm) {
                    const runDistrictMove = async () => {
                        const distKey = targetSubLocation.toLowerCase();
                        const quickDist = DISTRICT_COORDS[distKey];
                        if (quickDist) {
                            updateCoordinates(
                                quickDist.lat,
                                quickDist.lng,
                                14,
                                cityClean ? `${cityClean} → ${targetSubLocation}` : targetSubLocation
                            );
                        }

                        // Query Google Maps Places API for exact District + Address in that City
                        const fullQuery = [
                            addressClean && addressClean.toLowerCase() !== distKey ? addressClean : "",
                            districtClean,
                            cityClean,
                        ]
                            .filter(Boolean)
                            .join(", ");

                        const remoteDistrict = await geocodeQuery(fullQuery);
                        if (remoteDistrict) {
                            updateCoordinates(
                                remoteDistrict.lat,
                                remoteDistrict.lng,
                                addressClean && addressClean.toLowerCase() !== distKey ? 15 : 14,
                                cityClean ? `${cityClean} → ${districtClean || addressClean}` : fullQuery
                            );
                        }
                        setGeocoding(false);
                    };

                    if (cityChanged) {
                        // Brief pause after opening at the City so the user sees the map open at City and move to District
                        stepTwoTimerRef.current = setTimeout(runDistrictMove, 650);
                        return;
                    } else {
                        await runDistrictMove();
                        return;
                    }
                }
            } finally {
                setGeocoding(false);
            }
        }, 380);

        return () => {
            if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
            if (stepTwoTimerRef.current) clearTimeout(stepTwoTimerRef.current);
        };
    }, [watchedCity, watchedDistrict, watchedAddress, updateCoordinates]);

    const addPhoto = () => {
        if (!photoUrl.trim()) return;
        setPhotos([...photos, photoUrl.trim()]);
        setPhotoUrl("");
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            let finalLat = Number(values.latitude);
            let finalLng = Number(values.longitude);

            // Ensure coordinates match the entered City & District on submit
            const locationQuery = [values.address, values.district, values.city]
                .map((s) => s?.trim())
                .filter(Boolean)
                .join(", ");

            if (locationQuery) {
                const resolved = await geocodeQuery(locationQuery);
                if (resolved) {
                    finalLat = resolved.lat;
                    finalLng = resolved.lng;
                    updateCoordinates(finalLat, finalLng, 14, locationQuery);
                }
            }

            const finalPhotos =
                photos.length > 0
                    ? photos
                    : photoUrl.trim()
                    ? [photoUrl.trim()]
                    : ["https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"];

            const response = await fetch("/api/owner/spaces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    latitude: Number.isFinite(finalLat) ? finalLat : 44.4268,
                    longitude: Number.isFinite(finalLng) ? finalLng : 26.1025,
                    dailyRate: values.dailyRate || values.hourlyRate * 8,
                    weekendRate: values.weekendRate || values.hourlyRate * 16,
                    photos: finalPhotos,
                }),
            });

            if (response.ok) {
                toast.success(t("owner.form.createBtn"));
                router.push("/owner/dashboard/listings");
                router.refresh();
            } else {
                const data = await response.json();
                toast.error(data.message || "Error");
            }
        } catch (error) {
            toast.error("Error");
        } finally {
            setLoading(false);
        }
    };

    const watchedAmenities = form.watch("amenitiesList") || [];
    const fullLocationLabel = [watchedAddress, watchedDistrict, watchedCity]
        .map((s) => s?.trim())
        .filter(Boolean)
        .join(", ");

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl bg-white dark:bg-gray-800 p-6 rounded-xl border">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("owner.form.basicInfo")}</h3>
                <div className="grid gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.spaceName")}</label>
                        <Input {...form.register("name")} placeholder="e.g. Modern Office Victoriei" />
                        {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.description")}</label>
                        <Textarea {...form.register("description")} />
                        {form.formState.errors.description && <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{t("owner.form.location")}</h3>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008080] bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                        {geocoding ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#008080]" />
                        ) : (
                            <MapPin className="w-3.5 h-3.5 text-[#008080]" />
                        )}
                        <span>{mapFocusLabel}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.address")}</label>
                        <Input {...form.register("address")} placeholder="Calea Victoriei 120, București" />
                        {form.formState.errors.address && <p className="text-red-500 text-xs mt-1">{form.formState.errors.address.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.city")}</label>
                        <Input {...form.register("city")} placeholder="București, Prague..." />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.district")}</label>
                        <Input {...form.register("district")} placeholder="Sector 1, Prague 8..." />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.latitude")}</label>
                        <Input
                            type="number"
                            step="any"
                            value={watchedLat ?? ""}
                            onChange={(e) =>
                                form.setValue("latitude", parseFloat(e.target.value) || 0, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.longitude")}</label>
                        <Input
                            type="number"
                            step="any"
                            value={watchedLng ?? ""}
                            onChange={(e) =>
                                form.setValue("longitude", parseFloat(e.target.value) || 0, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                })
                            }
                        />
                    </div>
                    <div className="col-span-2 h-64 rounded-md overflow-hidden border mt-2">
                        <MapComponent
                            lat={Number(watchedLat) || 44.4268}
                            lng={Number(watchedLng) || 26.1025}
                            zoom={mapZoom}
                            address={fullLocationLabel || watchedCity}
                            onLocationChange={(newLat, newLng) => {
                                updateCoordinates(newLat, newLng, mapZoom);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("owner.form.specsAmenities")}</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.size")}</label>
                        <Input type="number" {...form.register("size")} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.capacity")}</label>
                        <Input type="number" {...form.register("capacity")} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.offices")}</label>
                        <Input type="number" {...form.register("officeCount")} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="wifi" onCheckedChange={c => form.setValue("hasWifi", c as boolean)} defaultChecked={true} />
                        <label htmlFor="wifi" className="text-sm font-medium">{translateAmenity("High-Speed Wi-Fi")}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="proj" onCheckedChange={c => form.setValue("hasProjector", c as boolean)} />
                        <label htmlFor="proj" className="text-sm font-medium">{translateAmenity("Projector / Screen")}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="kit" onCheckedChange={c => form.setValue("hasKitchen", c as boolean)} />
                        <label htmlFor="kit" className="text-sm font-medium">{translateAmenity("Kitchen Access")}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="ac" onCheckedChange={c => form.setValue("hasAC", c as boolean)} />
                        <label htmlFor="ac" className="text-sm font-medium">{translateAmenity("Air Conditioning")}</label>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <label className="text-sm font-medium mb-3 block text-muted-foreground uppercase tracking-wider">{t("owner.form.additionalAmenities")}</label>
                    <div className="grid grid-cols-2 gap-y-3">
                        {AMENITIES_OPTIONS.map((amenity) => (
                            <div key={amenity} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`amenity-${amenity}`}
                                    checked={watchedAmenities.includes(amenity)}
                                    onCheckedChange={(checked) => {
                                        const current = form.getValues("amenitiesList") || [];
                                        if (checked) {
                                            form.setValue("amenitiesList", [...current, amenity]);
                                        } else {
                                            form.setValue("amenitiesList", current.filter(a => a !== amenity));
                                        }
                                    }}
                                />
                                <label htmlFor={`amenity-${amenity}`} className="text-sm leading-none cursor-pointer">
                                    {translateAmenity(amenity)}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("owner.form.ratesPricing")}</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.hourlyRate")}</label>
                        <Input type="number" {...form.register("hourlyRate")} placeholder="100" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.dailyRate")}</label>
                        <Input type="number" {...form.register("dailyRate")} placeholder="600" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.weekendRate")}</label>
                        <Input type="number" {...form.register("weekendRate")} placeholder="1100" />
                    </div>
                </div>

                <div className="pt-6 mt-4 border-t-2 border-dashed border-violet-100 dark:border-violet-900/30">
                    <div className="flex items-start space-x-3 p-4 bg-violet-50 dark:bg-violet-900/10 rounded-2xl border border-violet-100 dark:border-violet-800">
                        <Checkbox
                            id="selfCleaning"
                            checked={form.watch("selfCleaning")}
                            onCheckedChange={c => form.setValue("selfCleaning", c as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="selfCleaning"
                                className="text-sm font-black leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-violet-900 dark:text-violet-200"
                            >
                                {t("owner.form.selfCleaningTitle")}
                            </label>
                            <p className="text-[11px] text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider">
                                {t("owner.form.selfCleaningLaw")}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t("owner.form.selfCleaningDesc")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">{t("owner.form.photos")}</h3>
                    <span className="text-xs text-muted-foreground">{photos.length} {t("owner.form.photosAdded")}</span>
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder={t("owner.form.photoUrlPlaceholder")}
                        value={photoUrl}
                        onChange={e => setPhotoUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPhoto())}
                        className="flex-1"
                    />
                    <input
                        type="file"
                        id="photo-upload"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.forEach(file => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setPhotos(prev => [...prev, reader.result as string]);
                                };
                                reader.readAsDataURL(file);
                            });
                        }}
                    />
                    <Button
                        type="button"
                        onClick={() => {
                            if (photoUrl) {
                                addPhoto();
                            } else {
                                document.getElementById('photo-upload')?.click();
                            }
                        }}
                        variant="secondary"
                        className="bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-300"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        {photoUrl ? t("owner.form.add") : t("owner.form.browse")}
                    </Button>
                </div>

                {photos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                        {photos.map((url, i) => (
                            <div key={i} className="relative group aspect-video border-2 border-violet-100 dark:border-violet-900/30 rounded-xl overflow-hidden shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(i)}
                                        className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transform hover:scale-110 transition-all shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full">
                                    {i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        className="text-center py-12 text-gray-400 border-2 border-dashed border-violet-100 dark:border-violet-900/30 rounded-xl bg-violet-50/30 dark:bg-violet-900/10 cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors group"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Plus className="w-8 h-8 text-violet-300 group-hover:text-violet-500 transition-colors" />
                            <p className="text-sm">{t("owner.form.uploadClick")}</p>
                            <p className="text-xs text-muted-foreground">{t("owner.form.supportedFormats")}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-4 border-t">
                <Button type="submit" className="w-full h-12 text-lg bg-[#008080] hover:bg-[#006F6F] text-white font-bold" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? t("owner.form.creatingBtn") : t("owner.form.createBtn")}
                </Button>
            </div>
        </form>
    );
}
