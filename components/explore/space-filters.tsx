"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Building2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

import { AMENITIES_OPTIONS } from "@/lib/constants/amenities";

const SPACE_CATEGORIES = [
    { id: "", label: "Toate categoriile de spații" },
    { id: "cocina", label: "Bucătării" },
    { id: "coworking", label: "Coworking" },
    { id: "estudio", label: "Studiouri" },
    { id: "sala", label: "Săli & Evenimente" },
    { id: "gimnasio", label: "Săli de sport" },
    { id: "terraza", label: "Terase & Outdoor" },
    { id: "eventos", label: "Evenimente private" },
    { id: "yoga", label: "Yoga & Meditație" },
    { id: "fotografía", label: "Fotografie & Producție" },
    { id: "taller", label: "Ateliere & Cursuri" },
];

const TOP_SERVICES_OPTIONS = [
    { id: "", label: "Toate serviciile (Top 10)" },
    { id: "curatenie", label: "1. Curățenie & Igienizare" },
    { id: "catering", label: "2. Catering & Coffee Break" },
    { id: "fotografie", label: "3. Fotografie & Video" },
    { id: "sonorizare", label: "4. Sonorizare & DJ" },
    { id: "proiectoare", label: "5. Proiectoare & Ecrane LED" },
    { id: "asistenta", label: "6. Asistență Tehnică & IT" },
    { id: "securitate", label: "7. Securitate & Control Acces" },
    { id: "bar", label: "8. Bar Mobil & Barista" },
    { id: "decor", label: "9. Decor & Aranjamente" },
    { id: "hostess", label: "10. Hostess & Primire Oaspeți" },
];

const POPULAR_CITIES = [
    "București",
    "Cluj-Napoca",
    "Timișoara",
    "Iași",
    "Brașov",
    "Constanța",
    "Craiova",
    "Sibiu",
    "Oradea",
    "Galați"
];

interface SpaceFiltersProps {
    initialType?: string;
    initialCategory?: string;
    initialQuery?: string;
    initialCity?: string;
}

export function SpaceFilters({ initialType, initialCategory, initialQuery, initialCity }: SpaceFiltersProps = {}) {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Genie interactive hover & solidification state (no music on Explore page)
    const [isGenieHovered, setIsGenieHovered] = useState(false);
    const [solidProgress, setSolidProgress] = useState(0);
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopGenieTimer = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    }, []);

    const handleGenieMouseEnter = useCallback(() => {
        stopGenieTimer();
        setIsGenieHovered(true);
        const startTime = Date.now();
        const totalDurationMs = 2500;

        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const nextProgress = Math.min(1, elapsed / totalDurationMs);
            setSolidProgress(nextProgress);
            if (nextProgress >= 1 && progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
        }, 40);
    }, [stopGenieTimer]);

    const handleGenieMouseLeave = useCallback(() => {
        stopGenieTimer();
        setIsGenieHovered(false);
        setSolidProgress(0);
    }, [stopGenieTimer]);

    useEffect(() => {
        return () => stopGenieTimer();
    }, [stopGenieTimer]);

    const currentType = searchParams.get("type") || initialType;
    const currentQ = searchParams.get("q") || initialQuery;
    const isServiceMode = currentType === "servicii" || searchParams.get("category") === "servicii" || (currentQ && currentQ.toLowerCase() === "servicii");

    const [city, setCity] = useState(searchParams.get("city") || initialCity || "");
    const [category, setCategory] = useState(searchParams.get("category") || initialCategory || "");
    const [query, setQuery] = useState(currentQ && currentQ.toLowerCase() !== "servicii" ? currentQ : "");
    const [priceRange, setPriceRange] = useState([0, parseInt(searchParams.get("maxPrice") || "200")]);
    const [sort, setSort] = useState(searchParams.get("sort") || "");
    const [capacity, setCapacity] = useState(searchParams.get("capacity") || "");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
        searchParams.get("amenities")?.split(",").filter(Boolean) || []
    );

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Sync state if searchParams change
    useEffect(() => {
        setCategory(searchParams.get("category") || "");
        if (searchParams.get("q") && searchParams.get("q")?.toLowerCase() !== "servicii") {
            setQuery(searchParams.get("q")!);
        } else if (!searchParams.get("q")) {
            setQuery("");
        }
    }, [searchParams]);

    const setMode = (mode: "spaces" | "services") => {
        const params = new URLSearchParams(searchParams.toString());
        if (mode === "services") {
            params.set("type", "servicii");
            params.delete("category");
            if (params.get("q")?.toLowerCase() === "servicii") params.delete("q");
        } else {
            params.delete("type");
            params.delete("category");
        }
        setCategory("");
        router.push(`${pathname}?${params.toString()}`);
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (city) {
            params.set("city", city);
            params.delete("lat");
            params.delete("lng");
        } else {
            if (searchParams.get("lat")) params.set("lat", searchParams.get("lat")!);
            if (searchParams.get("lng")) params.set("lng", searchParams.get("lng")!);
        }
        if (category) params.set("category", category);
        if (isServiceMode) {
            params.set("type", "servicii");
        }
        if (priceRange[1] < 200) params.set("maxPrice", priceRange[1].toString());
        if (capacity) params.set("capacity", capacity);
        if (sort && priceRange[1] < 200) params.set("sort", sort);
        if (selectedAmenities.length > 0) params.set("amenities", selectedAmenities.join(","));

        router.push(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        setQuery("");
        setCity("");
        setCategory("");
        setPriceRange([0, 200]);
        setSort("");
        setCapacity("");
        setSelectedAmenities([]);
        if (isServiceMode) {
            router.push(`${pathname}?type=servicii`);
        } else {
            router.push(pathname);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                {/* Header & Clear */}
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center justify-between">
                    <span>Search filters</span>
                    {(mounted && (city || category || query || capacity || selectedAmenities.length > 0 || priceRange[1] < 200)) && (
                        <button onClick={clearFilters} className="text-xs text-[#008080] hover:underline font-normal">
                            Clear
                        </button>
                    )}
                </h3>

                {/* Filter Mode Switch: Spații vs Servicii */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-5 text-xs font-bold border border-gray-200/60 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => setMode("spaces")}
                        className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                            !isServiceMode
                                ? "bg-white dark:bg-gray-700 text-[#008080] shadow-sm font-black"
                                : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                        }`}
                    >
                        <Building2 className="w-3.5 h-3.5" />
                        Spații
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("services")}
                        className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                            isServiceMode
                                ? "bg-[#008080] text-white shadow-sm font-black"
                                : "text-gray-500 hover:text-[#008080]"
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Servicii
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Search Query */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Search</Label>
                        <Input
                            placeholder={isServiceMode ? "Caută servicii, furnizori..." : "Nume, zonă, cuvinte cheie..."}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                            className="text-sm"
                        />
                    </div>

                    {/* Category Dropdown (dynamically switches to Top 10 Services when in service mode) */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                {isServiceMode ? "Categorie Servicii (Top 10)" : "Categorie Spațiu"}
                            </Label>
                            {isServiceMode && (
                                <span className="text-[10px] bg-[#E6F4F4] text-[#008080] px-2 py-0.5 rounded-full font-bold">
                                    Servicii
                                </span>
                            )}
                        </div>
                        <select
                            value={category}
                            onChange={(e) => {
                                const newCat = e.target.value;
                                setCategory(newCat);
                                const params = new URLSearchParams(searchParams.toString());
                                if (newCat) params.set("category", newCat);
                                else params.delete("category");
                                if (isServiceMode) params.set("type", "servicii");
                                router.push(`${pathname}?${params.toString()}`);
                            }}
                            className="w-full h-10 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        >
                            {(isServiceMode ? TOP_SERVICES_OPTIONS : SPACE_CATEGORIES).map(c => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">City</Label>
                        <Input
                            placeholder="e.g. București, Cluj-Napoca..."
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                            className="text-sm"
                        />
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {POPULAR_CITIES.slice(0, 6).map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => {
                                        const newCity = c === city ? "" : c;
                                        setCity(newCity);
                                        const params = new URLSearchParams(searchParams.toString());
                                        if (newCity) {
                                            params.set("city", newCity);
                                            params.delete("lat");
                                            params.delete("lng");
                                        }
                                        else params.delete("city");
                                        router.push(`${pathname}?${params.toString()}`);
                                    }}
                                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                                        (!mounted ? false : city === c)
                                            ? "bg-[#008080] text-white shadow-sm"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Capacity */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Min. Capacity</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 10 people"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                            className="text-sm"
                        />
                    </div>

                    {/* Price Range */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <Label className="font-semibold uppercase tracking-wider text-gray-500">Max Price / hour</Label>
                            <span className="font-bold text-[#008080]">{!mounted || priceRange[1] >= 200 ? "No limit" : `${priceRange[1]} RON/h`}</span>
                        </div>
                        <Slider
                            defaultValue={[priceRange[1]]}
                            value={[priceRange[1]]}
                            max={200}
                            step={10}
                            onValueChange={(val) => setPriceRange([0, val[0]])}
                            className="py-2"
                        />
                        {mounted && priceRange[1] < 200 && (
                            <div className="pt-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">Sort by Price</Label>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="w-full text-xs p-1.5 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800"
                                >
                                    <option value="">Default (Popularitate)</option>
                                    <option value="price_asc">Preț: Mic la Mare (Ascending)</option>
                                    <option value="price_desc">Preț: Mare la Mic (Descending)</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Amenities */}
                    <div className="space-y-2 relative z-30">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Amenities</Label>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {AMENITIES_OPTIONS.map((amenity) => (
                                <div key={amenity} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={amenity}
                                        checked={selectedAmenities.includes(amenity)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedAmenities([...selectedAmenities, amenity]);
                                            } else {
                                                setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                                            }
                                        }}
                                    />
                                    <label htmlFor={amenity} className="text-xs text-gray-600 dark:text-gray-300 font-normal cursor-pointer select-none">
                                        {amenity}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative pt-2 flex flex-col gap-2">
                        <div className="relative">
                            {/* Single-tail White Translucent Genie (no music): body sits on the far left beside Amenities, single long tail starts directly from the "Apply filters" box */}
                            <div
                                className="pointer-events-none select-none absolute bottom-[18px] -left-[200px] sm:-left-[220px] w-[320px] sm:w-[350px] z-25 transition-transform duration-700"
                                style={{
                                    transform: isGenieHovered ? "scale(1.05)" : "scale(1)",
                                    transformOrigin: "93% 96%",
                                }}
                            >
                                {/* Interactive hover zone strictly over the genie's body on the left (never overlaps Amenities) */}
                                <div
                                    onMouseEnter={handleGenieMouseEnter}
                                    onMouseLeave={handleGenieMouseLeave}
                                    title="Hover to awaken the Genie"
                                    className="pointer-events-auto cursor-pointer absolute left-[8%] top-[4%] w-[44%] h-[68%] z-40"
                                />

                                {/* Dynamic ambient glow behind the genie's body on the left (turns warm gold on Level 7) */}
                                {(() => {
                                    const genieLevel = isGenieHovered
                                        ? Math.min(7, Math.max(1, Math.ceil(solidProgress * 7)))
                                        : 0;
                                    const levelFraction = genieLevel / 7;
                                    const isFinalGoldLevel = genieLevel === 7;

                                    return (
                                        <>
                                            <div
                                                className="pointer-events-none absolute left-[10%] top-[8%] w-[42%] h-[58%] rounded-full blur-2xl transition-all duration-200"
                                                style={{
                                                    background: isFinalGoldLevel
                                                        ? "radial-gradient(circle, rgba(218,165,32,0.55) 0%, rgba(0,128,128,0.40) 55%, transparent 100%)"
                                                        : "radial-gradient(circle, rgba(0,128,128,0.48) 0%, rgba(26,32,32,0.38) 60%, transparent 100%)",
                                                    opacity: 0.25 + levelFraction * 0.75,
                                                }}
                                            />

                                            {/* Level 0 Base Layer: Single Long-Tail White & Translucent Genie */}
                                            <img
                                                src="/genie-explore-translucent.png?v=7lvl"
                                                alt="White Translucent Genie"
                                                className="relative w-full h-auto object-contain transition-all duration-200"
                                                style={{
                                                    opacity: isGenieHovered ? Math.max(0.15, 1 - levelFraction * 0.85) : 0.72,
                                                    filter: `drop-shadow(0 8px 20px rgba(0, 111, 111, ${0.28 + levelFraction * 0.42}))`,
                                                }}
                                            />

                                            {/* Levels 1..6 Overlay Layer: Steps through 6 progressively darker charcoal levels */}
                                            <img
                                                src="/genie-explore-solid.png?v=7lvl"
                                                alt="Darkening Awakened Genie (Levels 1-6)"
                                                className="pointer-events-none absolute inset-0 w-full h-auto object-contain transition-all duration-150"
                                                style={{
                                                    opacity: isFinalGoldLevel ? 0 : levelFraction,
                                                    filter: `brightness(${1.18 - levelFraction * 0.42}) contrast(${1 + levelFraction * 0.28}) drop-shadow(0 10px 26px rgba(15, 30, 30, ${levelFraction * 0.7}))`,
                                                }}
                                            />

                                            {/* Level 7 Final Overlay Layer: Darkest level WITH Golden Hat & Golden Arm Jewelry */}
                                            <img
                                                src="/genie-explore-gold.png?v=7lvl"
                                                alt="Level 7 Genie with Golden Hat and Arm Jewelry"
                                                className="pointer-events-none absolute inset-0 w-full h-auto object-contain transition-opacity duration-200"
                                                style={{
                                                    opacity: isFinalGoldLevel ? 1 : 0,
                                                    filter: "contrast(1.12) drop-shadow(0 12px 28px rgba(184, 134, 11, 0.55))",
                                                }}
                                            />
                                        </>
                                    );
                                })()}

                                {/* Speech text emerging from the genie's mouth to the left */}
                                <div
                                    className={`pointer-events-none absolute top-[18%] right-[73%] z-50 w-[195px] sm:w-[215px] origin-right transition-all duration-300 ${
                                        isGenieHovered
                                            ? "opacity-100 scale-100 translate-x-0"
                                            : "opacity-0 scale-75 translate-x-4"
                                    }`}
                                >
                                    <div
                                        className="relative bg-white/95 backdrop-blur-md text-[#111A1A] px-3.5 py-2.5 rounded-2xl shadow-2xl border-2 border-[#008080] text-xs font-black leading-snug tracking-tight"
                                        style={{
                                            boxShadow: `0 10px 30px rgba(0, 128, 128, ${0.25 + solidProgress * 0.45})`,
                                        }}
                                    >
                                        <div className="absolute top-3.5 -right-2 w-3.5 h-3.5 bg-white border-r-2 border-t-2 border-[#008080] rotate-45" />
                                        <p className="relative z-10 text-[#006F6F]">
                                            &ldquo;{t("hero.genieQuote")}&rdquo;
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={applyFilters} className="relative z-20 w-full bg-[#008080] hover:bg-[#006F6F] text-white">
                                Apply filters
                            </Button>
                        </div>
                        <Button onClick={clearFilters} variant="outline" className="relative z-20 w-full text-xs">
                            Reset
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
