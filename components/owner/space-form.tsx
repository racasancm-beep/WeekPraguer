"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, MapPin, Plus, X, KeyRound, ShieldCheck, MessageSquare, Sparkles, Clock, CheckCircle2 } from "lucide-react";
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

const PRESET_SERVICE_CATEGORIES = [
    "Curățenie & Igienizare",
    "Securitate & Pază",
    "Asistență IT & Tehnică",
    "Catering & Evenimente",
    "Foto & Video Pro",
    "Design & Arhitectură",
    "Consultanță Juridică & Financiară",
    "Sonorizare & DJ",
    "Decor & Flori",
    "Hostess & Protocol",
];

const formSchema = z.object({
    name: z.string().min(2, "Required"),
    description: z.string().min(3, "Required").max(3000, "Maximum characters exceeded"),
    category: z.string().optional().default("coworking"),
    address: z.string().min(2, "Required"),
    city: z.string().default("București"),
    district: z.string().optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    size: z.coerce.number().optional().default(1),
    capacity: z.coerce.number().int().optional().default(1),
    officeCount: z.coerce.number().int().optional().default(1),
    accessCode: z.string().optional().default(""),
    reminder24hTemplate: z.string().optional().default(""),
    reminder12hTemplate: z.string().optional().default(""),
    hourlyRate: z.coerce.number().positive(),
    dailyRate: z.coerce.number().optional(),
    weekendRate: z.coerce.number().optional(),
    hasFlexiblePolicy: z.boolean().default(true),
    priceFlexible: z.coerce.number().optional().nullable(),
    hasModeratePolicy: z.boolean().default(false),
    priceModerate: z.coerce.number().optional().nullable(),
    hasNonRefundablePolicy: z.boolean().default(false),
    priceNonRefundable: z.coerce.number().optional().nullable(),
    hasWifi: z.boolean().default(true),
    hasProjector: z.boolean().default(false),
    hasKitchen: z.boolean().default(false),
    hasParking: z.boolean().default(false),
    hasAC: z.boolean().default(false),
    selfCleaning: z.boolean().default(false),
    active: z.boolean().default(true),
    amenitiesList: z.array(z.string()).default([]),
});

interface SpaceFormProps {
    initialData?: any;
    spaceId?: string;
    onSuccess?: (updatedSpace: any) => void;
    onCancel?: () => void;
}

function parseInitialAmenities(raw: any): string[] {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string" && raw.trim()) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            return raw.split(",").map((s) => s.trim()).filter(Boolean);
        }
    }
    return [];
}

export function SpaceForm({ initialData, spaceId, onSuccess, onCancel }: SpaceFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const { t, translateAmenity } = useLanguage();
    const targetSpaceId = spaceId || initialData?.id;
    const isEditMode = Boolean(targetSpaceId);

    const sessionRole = (session?.user as any)?.role;
    const isServiceRole = sessionRole === "SERVICE_OWNER";
    const initialIsService = Boolean(
        initialData?.isService ||
        initialData?.listingType === "SERVICE" ||
        isServiceRole ||
        searchParams?.get("type") === "SERVICE"
    );

    const [listingType, setListingType] = useState<"SPACE" | "SERVICE">(
        initialIsService ? "SERVICE" : "SPACE"
    );

    const initialServiceCat = initialData?.serviceCategory || initialData?.category || PRESET_SERVICE_CATEGORIES[0];
    const isInitialPreset = PRESET_SERVICE_CATEGORIES.includes(initialServiceCat);
    const [serviceCategory, setServiceCategory] = useState<string>(isInitialPreset ? initialServiceCat : "__CUSTOM__");
    const [customCategory, setCustomCategory] = useState<string>(!isInitialPreset && initialData?.serviceCategory ? initialData.serviceCategory : "");
    const [availableHours, setAvailableHours] = useState<string>(initialData?.availableHours || "09:00 - 18:00");

    const [loading, setLoading] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [mapZoom, setMapZoom] = useState<number>(isEditMode ? 14 : 13);
    const [mapFocusLabel, setMapFocusLabel] = useState<string>(
        initialData?.city
            ? initialData?.district
                ? `${initialData.city} → ${initialData.district}`
                : initialData.city
            : "București"
    );
    const [photos, setPhotos] = useState<string[]>(
        initialData?.photos?.map((p: any) => (typeof p === "string" ? p : p.url)).filter(Boolean) || []
    );
    const [photoUrl, setPhotoUrl] = useState("");
    const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stepTwoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastResolvedCityRef = useRef<string>((initialData?.city || "bucurești").trim().toLowerCase());
    const initialLocationRef = useRef({
        city: (initialData?.city || "București").trim(),
        district: (initialData?.district || "").trim(),
        address: (initialData?.address || "").trim(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            category: initialData?.category || "coworking",
            address: initialData?.address || "",
            city: initialData?.city || "București",
            district: initialData?.district || "",
            latitude: typeof initialData?.latitude === "number" ? initialData.latitude : 44.4268,
            longitude: typeof initialData?.longitude === "number" ? initialData.longitude : 26.1025,
            size: initialData?.size ?? 50,
            capacity: initialData?.capacity ?? 10,
            officeCount: initialData?.officeCount ?? 1,
            accessCode: initialData?.accessCode || "",
            reminder24hTemplate: initialData?.reminder24hTemplate || "",
            reminder12hTemplate: initialData?.reminder12hTemplate || "",
            hourlyRate: initialData?.hourlyRate ?? 100,
            dailyRate: initialData?.dailyRate ?? 600,
            weekendRate: initialData?.weekendRate ?? 1100,
            hasFlexiblePolicy: initialData?.hasFlexiblePolicy ?? true,
            priceFlexible: initialData?.priceFlexible ?? initialData?.hourlyRate ?? 100,
            hasModeratePolicy: Boolean(initialData?.hasModeratePolicy),
            priceModerate: initialData?.priceModerate ?? (initialData?.hourlyRate ? Math.round(initialData.hourlyRate * 0.9) : 90),
            hasNonRefundablePolicy: Boolean(initialData?.hasNonRefundablePolicy),
            priceNonRefundable: initialData?.priceNonRefundable ?? (initialData?.hourlyRate ? Math.round(initialData.hourlyRate * 0.8) : 80),
            hasWifi: initialData?.hasWifi ?? true,
            hasProjector: initialData?.hasProjector ?? false,
            hasKitchen: initialData?.hasKitchen ?? false,
            hasParking: initialData?.hasParking ?? false,
            hasAC: initialData?.hasAC ?? false,
            selfCleaning: initialData?.selfCleaning ?? false,
            active: initialData?.active ?? true,
            amenitiesList: parseInitialAmenities(initialData?.amenitiesList),
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

        // In edit mode, do not overwrite saved coordinates until the user modifies city, district, or address
        if (
            isEditMode &&
            cityClean === initialLocationRef.current.city &&
            districtClean === initialLocationRef.current.district &&
            addressClean === initialLocationRef.current.address
        ) {
            return;
        }

        // Instant lookup for known City so map jumps immediately while typing
        const cityNorm = cityClean.toLowerCase();
        const localCity = CITY_COORDS[cityNorm];
        const cityChanged = Boolean(cityNorm && cityNorm !== lastResolvedCityRef.current);

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
    }, [watchedCity, watchedDistrict, watchedAddress, isEditMode, updateCoordinates]);

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

            const locationChanged =
                !isEditMode ||
                values.city?.trim() !== initialLocationRef.current.city ||
                (values.district || "").trim() !== initialLocationRef.current.district ||
                values.address?.trim() !== initialLocationRef.current.address;

            const locationQuery = [values.address, values.district, values.city]
                .map((s) => s?.trim())
                .filter(Boolean)
                .join(", ");

            if (locationQuery && locationChanged) {
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

            const isServiceListing = listingType === "SERVICE";

            if (!isServiceListing) {
                const hasFlex = Boolean(values.hasFlexiblePolicy);
                const hasMod = Boolean(values.hasModeratePolicy);
                const hasNonRef = Boolean(values.hasNonRefundablePolicy);

                if (!hasFlex && !hasMod && !hasNonRef) {
                    toast.error(t("policy.owner.atLeastOneRequired") || "Trebuie să selectezi cel puțin o opțiune de preț pentru spațiu.");
                    setLoading(false);
                    return;
                }

                if (hasFlex && (!values.priceFlexible || Number(values.priceFlexible) <= 0)) {
                    toast.error("Te rugăm să introduci prețul pentru Politica Flexibilă.");
                    setLoading(false);
                    return;
                }
                if (hasMod && (!values.priceModerate || Number(values.priceModerate) <= 0)) {
                    toast.error("Te rugăm să introduci prețul pentru Politica Moderată.");
                    setLoading(false);
                    return;
                }
                if (hasNonRef && (!values.priceNonRefundable || Number(values.priceNonRefundable) <= 0)) {
                    toast.error("Te rugăm să introduci prețul pentru Preț Special (Nerambursabil).");
                    setLoading(false);
                    return;
                }
            }

            const endpoint = isEditMode ? `/api/spaces/${targetSpaceId}` : "/api/owner/spaces";
            const method = isEditMode ? "PUT" : "POST";

            const resolvedServiceCategory =
                serviceCategory === "__CUSTOM__" ? customCategory.trim() : serviceCategory;

            const activePrices = !isServiceListing
                ? [
                      values.hasFlexiblePolicy ? Number(values.priceFlexible) : null,
                      values.hasModeratePolicy ? Number(values.priceModerate) : null,
                      values.hasNonRefundablePolicy ? Number(values.priceNonRefundable) : null,
                  ].filter((p): p is number => typeof p === "number" && p > 0)
                : [];
            const effectiveHourlyRate = !isServiceListing && activePrices.length > 0 ? Math.min(...activePrices) : values.hourlyRate;

            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    hourlyRate: effectiveHourlyRate,
                    listingType,
                    isService: isServiceListing,
                    serviceCategory: isServiceListing ? (resolvedServiceCategory || "General") : null,
                    availableHours: isServiceListing ? (availableHours.trim() || "09:00 - 18:00") : null,
                    hasFlexiblePolicy: isServiceListing ? false : Boolean(values.hasFlexiblePolicy),
                    priceFlexible: isServiceListing ? null : (values.hasFlexiblePolicy ? Number(values.priceFlexible) : null),
                    hasModeratePolicy: isServiceListing ? false : Boolean(values.hasModeratePolicy),
                    priceModerate: isServiceListing ? null : (values.hasModeratePolicy ? Number(values.priceModerate) : null),
                    hasNonRefundablePolicy: isServiceListing ? false : Boolean(values.hasNonRefundablePolicy),
                    priceNonRefundable: isServiceListing ? null : (values.hasNonRefundablePolicy ? Number(values.priceNonRefundable) : null),
                    size: isServiceListing ? 1 : (Number(values.size) || 1),
                    capacity: isServiceListing ? 1 : (Number(values.capacity) || 1),
                    officeCount: isServiceListing ? 1 : (Number(values.officeCount) || 1),
                    latitude: Number.isFinite(finalLat) ? finalLat : 44.4268,
                    longitude: Number.isFinite(finalLng) ? finalLng : 26.1025,
                    dailyRate: values.dailyRate || effectiveHourlyRate * 8,
                    weekendRate: values.weekendRate || effectiveHourlyRate * 16,
                    photos: finalPhotos,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(isEditMode ? t("owner.form.updatedToast") : t("owner.form.createBtn"));
                if (onSuccess) {
                    onSuccess(data.space);
                } else if (isEditMode) {
                    router.push(`/spaces/${targetSpaceId}`);
                    router.refresh();
                } else {
                    router.push("/owner/dashboard/earnings");
                    router.refresh();
                }
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
            {/* Type selector: Space vs Service */}
            <div className="flex items-center gap-3 p-1.5 bg-gray-100 dark:bg-gray-700/60 rounded-2xl w-full">
                <button
                    type="button"
                    onClick={() => setListingType("SPACE")}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        listingType === "SPACE"
                            ? "bg-white text-gray-900 shadow-md scale-[1.01]"
                            : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                    <span>🏢</span> {t("service.typeSpace") || "Spațiu fizic de închiriat"}
                </button>
                <button
                    type="button"
                    onClick={() => setListingType("SERVICE")}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        listingType === "SERVICE"
                            ? "bg-[#008080] text-white shadow-md scale-[1.01]"
                            : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                    <Sparkles className="w-4 h-4" /> {t("service.typeService") || "Serviciu profesional"}
                </button>
            </div>

            {listingType === "SERVICE" ? (
                /* SERVICE MODE */
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#008080]" />
                            {t("service.typeService") || "Informații Serviciu Profesional"}
                        </h3>
                        <span className="text-xs bg-teal-50 text-[#008080] border border-[#008080]/20 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {t("service.badge") || "Serviciu"}
                        </span>
                    </div>

                    <div className="grid gap-4">
                        <div>
                            <label className="text-sm font-semibold mb-1 block text-gray-800 dark:text-gray-200">
                                {t("owner.form.spaceName") || "Nume Serviciu"}
                            </label>
                            <Input
                                {...form.register("name")}
                                placeholder="ex. Curățenie Profesională pentru Birouri & Spații Comerciale"
                            />
                            {form.formState.errors.name && (
                                <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-semibold mb-1 block text-gray-800 dark:text-gray-200">
                                {t("service.categoryLabel") || "Categorie Serviciu"}
                            </label>
                            <select
                                value={serviceCategory}
                                onChange={(e) => setServiceCategory(e.target.value)}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium"
                            >
                                {PRESET_SERVICE_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                                <option value="__CUSTOM__">
                                    {t("service.customCategoryOption") || "+ Creează o categorie nouă..."}
                                </option>
                            </select>

                            {serviceCategory === "__CUSTOM__" && (
                                <div className="mt-2.5">
                                    <Input
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        placeholder={t("service.customCategoryPlaceholder") || "Introdu numele categoriei tale personalizate..."}
                                        className="border-[#008080] focus-visible:ring-[#008080]"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    {t("service.descriptionLabel") || "Descrierea Serviciului (max. 500 caractere)"}
                                </label>
                                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                                    (form.watch("description")?.length || 0) >= 480
                                        ? "text-red-600 bg-red-50 border-red-200"
                                        : "text-teal-700 bg-teal-50 border-teal-200"
                                }`}>
                                    {form.watch("description")?.length || 0} / 500 {t("service.charactersRemaining") || "caractere"}
                                </span>
                            </div>
                            <Textarea
                                {...form.register("description")}
                                maxLength={500}
                                rows={5}
                                placeholder={t("service.descriptionPlaceholder") || "Descrie în detaliu serviciul oferit, beneficiile, experiența și ce include prețul..."}
                            />
                            {form.formState.errors.description && (
                                <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* SPACE MODE */
                <>
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">{t("owner.form.basicInfo")}</h3>
                        <div className="grid gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">{t("owner.form.spaceName")}</label>
                                <Input {...form.register("name")} placeholder="e.g. Modern Office Victoriei" />
                                {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">{t("owner.form.category")}</label>
                                <select
                                    {...form.register("category")}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                >
                                    <option value="coworking">{t("catOpt.coworking")}</option>
                                    <option value="cocina">{t("catOpt.cocina")}</option>
                                    <option value="estudio">{t("catOpt.estudio")}</option>
                                    <option value="sala">{t("catOpt.sala")}</option>
                                    <option value="gimnasio">{t("catOpt.gimnasio")}</option>
                                    <option value="terraza">{t("catOpt.terraza")}</option>
                                    <option value="eventos">{t("catOpt.eventos")}</option>
                                    <option value="yoga">{t("catOpt.yoga")}</option>
                                    <option value="fotografia">{t("catOpt.fotografia")}</option>
                                    <option value="taller">{t("catOpt.taller")}</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">{t("owner.form.description")}</label>
                                <Textarea {...form.register("description")} rows={4} />
                                {form.formState.errors.description && <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Space Access Code (Cod Acces Spațiu) - Visible & Editable anytime by Owner */}
                    <div className="space-y-3 p-4 rounded-xl border border-teal-200 bg-teal-50/50 dark:bg-gray-800 dark:border-teal-900/60 shadow-sm">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#008080] text-white flex items-center justify-center shrink-0 shadow-sm">
                                <KeyRound className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {t("owner.form.accessCodeTitle") || "Cod Acces Spațiu (pentru clienți)"}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t("owner.form.accessCodeDesc") || "Codul de acces pe care clientul îl va vedea în panoul său după confirmarea rezervării (ex. cod cutie chei, PIN smart lock, interfon). Poate fi modificat oricând."}
                                </p>
                            </div>
                        </div>
                        <div>
                            <Input
                                {...form.register("accessCode")}
                                placeholder={t("owner.form.accessCodePlaceholder") || "ex. 482910 sau KEY-1234"}
                                className="font-mono text-base font-bold tracking-wider bg-white dark:bg-gray-900 border-teal-300 dark:border-teal-800"
                            />
                            <p className="text-[11px] text-teal-700 dark:text-teal-400 mt-1.5 font-medium">
                                {t("owner.form.accessCodeHint") || "Acest cod este vizibil clienților cu rezervare confirmată și poate fi actualizat oricând de proprietar."}
                            </p>
                        </div>
                    </div>

                    {/* Automated Customer Messages Configuration (24h before renting & 12h before check-in) */}
                    <div className="space-y-4 p-4 rounded-xl border border-violet-200 bg-violet-50/50 dark:bg-gray-800 dark:border-violet-900/60 shadow-sm">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {t("owner.form.remindersTitle") || "Mesaje Automate în Chat & Email pentru Clienți"}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t("owner.form.remindersDesc") || "Personalizează mesajele automate trimise clientului cu 24h și 12h înainte de start. Când se trimit, vei primi notificare direct în chat."}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-1">
                            <div>
                                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-1 block">
                                    {t("owner.form.reminder24hLabel") || "Mesaj automat cu 24 ore înainte de închiriere:"}
                                </label>
                                <Textarea
                                    {...form.register("reminder24hTemplate")}
                                    rows={3}
                                    placeholder="Bună ziua, {nume_client}! Vă reamintim că rezervarea dumneavoastră pentru {nume_spatiu} începe în 24 de ore ({ora_inceput}). Cod acces: {cod_acces}."
                                    className="text-xs bg-white dark:bg-gray-900"
                                />
                                <p className="text-[10px] text-gray-500 mt-1">
                                    Variabile: <code className="bg-gray-100 px-1 py-0.5 rounded text-violet-700 font-mono">{"{nume_client}"}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-violet-700 font-mono">{"{nume_spatiu}"}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-violet-700 font-mono">{"{ora_inceput}"}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-violet-700 font-mono">{"{data_inceput}"}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-violet-700 font-mono">{"{adresa_spatiu}"}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-violet-700 font-mono">{"{cod_acces}"}</code>
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-1 block">
                                    {t("owner.form.reminder12hLabel") || "Mesaj automat cu 12 ore înainte de check-in:"}
                                </label>
                                <Textarea
                                    {...form.register("reminder12hTemplate")}
                                    rows={3}
                                    placeholder="Bună ziua, {nume_client}! În 12 ore începe check-in-ul pentru spațiul {nume_spatiu}. Vă rugăm să pregătiți codul de acces ({cod_acces})."
                                    className="text-xs bg-white dark:bg-gray-900"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}

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

            {listingType === "SERVICE" ? (
                /* SERVICE MODE: Pricing, Time Interval & Availability */
                <div className="space-y-4 p-5 rounded-2xl border border-teal-200 bg-teal-50/40 dark:bg-gray-800 dark:border-teal-900/60 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#008080]" />
                        {t("service.priceDisplay") || "Tarif & Interval Disponibil pentru Rezervare"}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold mb-1 block text-gray-800 dark:text-gray-200">
                                {t("owner.form.hourlyRate") || "Preț pe Oră"} (RON)
                            </label>
                            <Input type="number" {...form.register("hourlyRate")} placeholder="150" />
                            {form.formState.errors.hourlyRate && (
                                <p className="text-red-500 text-xs mt-1">{form.formState.errors.hourlyRate.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-semibold mb-1 block text-gray-800 dark:text-gray-200">
                                {t("service.availableHours") || "Interval Orar Disponibil"}
                            </label>
                            <Input
                                value={availableHours}
                                onChange={(e) => setAvailableHours(e.target.value)}
                                placeholder={t("service.availableHoursPlaceholder") || "09:00 - 18:00"}
                            />
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <span className="text-[10px] text-gray-500 font-semibold mr-0.5">
                                    {t("service.quickHours") || "Preseturi rapide"}:
                                </span>
                                {["09:00 - 18:00", "08:00 - 20:00", "10:00 - 22:00", "Flexibil / La cerere"].map((preset) => (
                                    <button
                                        type="button"
                                        key={preset}
                                        onClick={() => setAvailableHours(preset)}
                                        className={`text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                                            availableHours === preset
                                                ? "bg-[#008080] text-white border-[#008080] font-bold"
                                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-teal-400"
                                        }`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex items-center space-x-2.5">
                        <Checkbox
                            id="serviceActiveStatus"
                            checked={Boolean(form.watch("active"))}
                            onCheckedChange={(c) => form.setValue("active", Boolean(c))}
                        />
                        <label htmlFor="serviceActiveStatus" className="text-sm font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer">
                            {t("service.statusActive") || "Serviciu activ & disponibil pentru rezervare"}
                        </label>
                    </div>
                </div>
            ) : (
                /* SPACE MODE: Specs, Amenities & Rates */
                <>
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
                                <Checkbox
                                    id="wifi"
                                    checked={Boolean(form.watch("hasWifi"))}
                                    onCheckedChange={(c) => form.setValue("hasWifi", Boolean(c))}
                                />
                                <label htmlFor="wifi" className="text-sm font-medium">{translateAmenity("High-Speed Wi-Fi")}</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="proj"
                                    checked={Boolean(form.watch("hasProjector"))}
                                    onCheckedChange={(c) => form.setValue("hasProjector", Boolean(c))}
                                />
                                <label htmlFor="proj" className="text-sm font-medium">{translateAmenity("Projector / Screen")}</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="kit"
                                    checked={Boolean(form.watch("hasKitchen"))}
                                    onCheckedChange={(c) => form.setValue("hasKitchen", Boolean(c))}
                                />
                                <label htmlFor="kit" className="text-sm font-medium">{translateAmenity("Kitchen Access")}</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="ac"
                                    checked={Boolean(form.watch("hasAC"))}
                                    onCheckedChange={(c) => form.setValue("hasAC", Boolean(c))}
                                />
                                <label htmlFor="ac" className="text-sm font-medium">{translateAmenity("Air Conditioning")}</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="parking"
                                    checked={Boolean(form.watch("hasParking"))}
                                    onCheckedChange={(c) => form.setValue("hasParking", Boolean(c))}
                                />
                                <label htmlFor="parking" className="text-sm font-medium">{translateAmenity("On-site Parking")}</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="activeStatus"
                                    checked={Boolean(form.watch("active"))}
                                    onCheckedChange={(c) => form.setValue("active", Boolean(c))}
                                />
                                <label htmlFor="activeStatus" className="text-sm font-semibold text-emerald-700">
                                    {t("owner.form.statusActive")}
                                </label>
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

                    {/* 3 Pricing Options & Cancellation Policies for Spaces (Not applicable to Services) */}
                    <div className="space-y-5 p-5 rounded-2xl border-2 border-indigo-100 bg-gradient-to-b from-indigo-50/40 via-white to-purple-50/30 dark:from-gray-800 dark:border-indigo-900/50 shadow-sm">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                {t("policy.owner.sectionTitle") || "Opțiuni de Preț și Politici de Anulare"}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {t("policy.owner.sectionDesc") || "Alege oricare dintre cele 3 opțiuni (sau pe toate) și setează prețul/oră pentru fiecare. Clientul va putea alege una dintre opțiunile active. Nu se aplică pentru servicii."}
                            </p>
                        </div>

                        {/* Option 1: Flexible Policy */}
                        <div className={`p-4 rounded-xl border-2 transition-all ${
                            form.watch("hasFlexiblePolicy")
                                ? "bg-emerald-50/70 border-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-700 shadow-sm"
                                : "bg-gray-50/50 border-gray-200 dark:bg-gray-800/40 opacity-70"
                        }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="policyFlex"
                                        checked={Boolean(form.watch("hasFlexiblePolicy"))}
                                        onCheckedChange={(c) => form.setValue("hasFlexiblePolicy", Boolean(c))}
                                        className="mt-1 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                    />
                                    <div>
                                        <label htmlFor="policyFlex" className="font-black text-sm text-emerald-950 dark:text-emerald-300 flex items-center gap-2 cursor-pointer">
                                            <span>🟢</span>
                                            <span>{t("policy.flexible.title") || "1. Politică Flexibilă"}</span>
                                        </label>
                                        <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium mt-0.5">
                                            <span className="font-bold">{t("policy.common.whatYouGet")}:</span> {t("policy.flexible.bestFor") || "Clienți care doresc flexibilitate maximă."}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full sm:w-44 shrink-0">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                        {t("policy.owner.pricePerHour") || "Preț pe Oră (RON)"}
                                    </label>
                                    <Input
                                        type="number"
                                        disabled={!form.watch("hasFlexiblePolicy")}
                                        value={form.watch("priceFlexible") ?? ""}
                                        onChange={(e) => {
                                            const val = e.target.value ? parseFloat(e.target.value) : null;
                                            form.setValue("priceFlexible", val);
                                            if (val && val > 0) form.setValue("hourlyRate", val);
                                        }}
                                        placeholder="120"
                                        className="h-10 bg-white font-bold"
                                    />
                                </div>
                            </div>

                            {form.watch("hasFlexiblePolicy") && (
                                <div className="mt-3 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 text-xs space-y-1.5 text-emerald-900 dark:text-emerald-200">
                                    <div className="flex items-center gap-1.5 font-semibold">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <span>{t("policy.flexible.whatYouGet1")}</span>
                                    </div>
                                    <div className="text-[11px] text-gray-500 dark:text-gray-400 pl-5">
                                        ❌ {t("policy.common.notRefundedPlatform")} • ❌ {t("policy.common.notRefundedProcessing")}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Option 2: Moderate Policy */}
                        <div className={`p-4 rounded-xl border-2 transition-all ${
                            form.watch("hasModeratePolicy")
                                ? "bg-amber-50/70 border-amber-400 dark:bg-amber-950/30 dark:border-amber-700 shadow-sm"
                                : "bg-gray-50/50 border-gray-200 dark:bg-gray-800/40 opacity-70"
                        }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="policyMod"
                                        checked={Boolean(form.watch("hasModeratePolicy"))}
                                        onCheckedChange={(c) => form.setValue("hasModeratePolicy", Boolean(c))}
                                        className="mt-1 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                                    />
                                    <div>
                                        <label htmlFor="policyMod" className="font-black text-sm text-amber-950 dark:text-amber-300 flex items-center gap-2 cursor-pointer">
                                            <span>🟡</span>
                                            <span>{t("policy.moderate.title") || "2. Politică Moderată"}</span>
                                        </label>
                                        <p className="text-xs text-amber-800 dark:text-amber-400 font-medium mt-0.5">
                                            <span className="font-bold">{t("policy.common.whatYouGet")}:</span> {t("policy.moderate.bestFor") || "Clienți care caută o rezervare cu risc redus și protecție parțială."}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full sm:w-44 shrink-0">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                        {t("policy.owner.pricePerHour") || "Preț pe Oră (RON)"}
                                    </label>
                                    <Input
                                        type="number"
                                        disabled={!form.watch("hasModeratePolicy")}
                                        value={form.watch("priceModerate") ?? ""}
                                        onChange={(e) => {
                                            const val = e.target.value ? parseFloat(e.target.value) : null;
                                            form.setValue("priceModerate", val);
                                        }}
                                        placeholder="100"
                                        className="h-10 bg-white font-bold"
                                    />
                                </div>
                            </div>

                            {form.watch("hasModeratePolicy") && (
                                <div className="mt-3 pt-3 border-t border-amber-200/80 dark:border-amber-800/60 text-xs space-y-1 text-amber-900 dark:text-amber-200">
                                    <div className="flex items-center gap-1.5 font-semibold">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                        <span>{t("policy.moderate.whatYouGet1")}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-semibold">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                        <span>{t("policy.moderate.whatYouGet2")}</span>
                                    </div>
                                    <div className="text-[11px] text-gray-500 dark:text-gray-400 pl-5">
                                        ❌ {t("policy.common.notRefundedPlatform")} • ❌ {t("policy.common.notRefundedProcessing")}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Option 3: Special Price (Non-Refundable) */}
                        <div className={`p-4 rounded-xl border-2 transition-all ${
                            form.watch("hasNonRefundablePolicy")
                                ? "bg-rose-50/70 border-rose-400 dark:bg-rose-950/30 dark:border-rose-700 shadow-sm"
                                : "bg-gray-50/50 border-gray-200 dark:bg-gray-800/40 opacity-70"
                        }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="policyNonRef"
                                        checked={Boolean(form.watch("hasNonRefundablePolicy"))}
                                        onCheckedChange={(c) => form.setValue("hasNonRefundablePolicy", Boolean(c))}
                                        className="mt-1 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                                    />
                                    <div>
                                        <label htmlFor="policyNonRef" className="font-black text-sm text-rose-950 dark:text-rose-300 flex items-center gap-2 cursor-pointer">
                                            <span>🔴</span>
                                            <span>{t("policy.nonRefundable.title") || "3. Preț Special (Nerambursabil)"}</span>
                                        </label>
                                        <p className="text-xs text-rose-800 dark:text-rose-400 font-medium mt-0.5">
                                            <span className="font-bold">{t("policy.common.whatYouGet")}:</span> {t("policy.nonRefundable.bestFor") || "Clienți care caută cel mai mic preț disponibil."}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full sm:w-44 shrink-0">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                                        {t("policy.owner.pricePerHour") || "Preț pe Oră (RON)"}
                                    </label>
                                    <Input
                                        type="number"
                                        disabled={!form.watch("hasNonRefundablePolicy")}
                                        value={form.watch("priceNonRefundable") ?? ""}
                                        onChange={(e) => {
                                            const val = e.target.value ? parseFloat(e.target.value) : null;
                                            form.setValue("priceNonRefundable", val);
                                        }}
                                        placeholder="80"
                                        className="h-10 bg-white font-bold"
                                    />
                                </div>
                            </div>

                            {form.watch("hasNonRefundablePolicy") && (
                                <div className="mt-3 pt-3 border-t border-rose-200/80 dark:border-rose-800/60 text-xs space-y-1 text-rose-900 dark:text-rose-200">
                                    <div className="flex items-center gap-1.5 font-semibold">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                        <span>{t("policy.nonRefundable.whatYouGet1")}</span>
                                    </div>
                                    <div className="text-[11px] text-gray-500 dark:text-gray-400 pl-5">
                                        ❌ {t("policy.nonRefundable.notRefundedAll")}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Optional full-day / weekend rate shortcuts */}
                        <div className="pt-2 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">{t("owner.form.dailyRate")} ({t("space.perFullDay")})</label>
                                <Input type="number" {...form.register("dailyRate")} placeholder="600" className="h-9" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">{t("owner.form.weekendRate")}</label>
                                <Input type="number" {...form.register("weekendRate")} placeholder="1100" className="h-9" />
                            </div>
                        </div>
                    </div>

                        <div className="pt-6 mt-4 border-t-2 border-dashed border-violet-100 dark:border-violet-900/30">
                            <div className="flex items-start space-x-3 p-4 bg-violet-50 dark:bg-violet-900/10 rounded-2xl border border-violet-100 dark:border-violet-800">
                                <Checkbox
                                    id="selfCleaning"
                                    checked={Boolean(form.watch("selfCleaning"))}
                                    onCheckedChange={c => form.setValue("selfCleaning", Boolean(c))}
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
                </>
            )}

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

            <div className="pt-4 border-t flex gap-3">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="h-12 px-6 font-bold"
                        disabled={loading}
                    >
                        {t("common.cancel")}
                    </Button>
                )}
                <Button type="submit" className="flex-1 h-12 text-lg bg-[#008080] hover:bg-[#006F6F] text-white font-bold" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading
                        ? isEditMode
                            ? t("owner.form.savingChangesBtn")
                            : t("owner.form.creatingBtn")
                        : isEditMode
                        ? t("owner.form.saveChangesBtn")
                        : t("owner.form.createBtn")}
                </Button>
            </div>
        </form>
    );
}
