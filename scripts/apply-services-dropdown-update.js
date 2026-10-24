const fs = require('fs');

// 1. Update app/page.tsx
const pageContent = `"use client";

import Link from "next/link";
import {
    Sparkles,
    ArrowRight,
    CheckCircle2,
    MapPin,
    Clock,
    Search,
    Utensils,
    Laptop,
    Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

export default function HomePage() {
    const { t } = useLanguage();

    // 3 Space Categories (keep only 3 under "Categorii de spații")
    const POPULAR_CATEGORIES = [
        {
            id: "cocina",
            label: t("cat.kitchens"),
            desc: t("cat.kitchens.desc"),
            icon: Utensils,
            count: \`40+ \${t("spaces.count")}\`
        },
        {
            id: "coworking",
            label: t("cat.coworking"),
            desc: t("cat.coworking.desc"),
            icon: Laptop,
            count: \`80+ \${t("spaces.count")}\`
        },
        {
            id: "estudio",
            label: t("cat.studios"),
            desc: t("cat.studios.desc"),
            icon: Camera,
            count: \`120+ \${t("spaces.count")}\`
        },
    ];

    // 3 Services Options (same functions, features, and setup as space categories)
    const POPULAR_SERVICES = [
        {
            id: "curatenie",
            label: t("services.cleaning"),
            desc: t("services.cleaning.desc"),
            icon: Sparkles,
            count: \`90+ \${t("services.count")}\`,
        },
        {
            id: "catering",
            label: t("services.catering"),
            desc: t("services.catering.desc"),
            icon: Utensils,
            count: \`60+ \${t("services.count")}\`,
        },
        {
            id: "echipamente",
            label: t("services.tech"),
            desc: t("services.tech.desc"),
            icon: Laptop,
            count: \`45+ \${t("services.count")}\`,
        },
    ];

    return (
        <div className="min-h-screen bg-[#F3F8F8] text-[#1A2020] selection:bg-[#E6F4F4]">
            {/* Hero Section */}
            <main>
                <section className="relative py-14 lg:py-24 overflow-hidden bg-gradient-to-b from-[#E6F4F4]/60 via-[#F3F8F8] to-transparent">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-left duration-700">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E6F4F4] text-[#006F6F] text-xs font-black uppercase tracking-widest border border-[#CCE4E4]">
                                <Sparkles className="w-4 h-4 text-[#008080]" />
                                {t("hero.badge")}
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] text-[#1A2020]">
                                {t("hero.title1")} <br />
                                <span className="text-[#008080]">{t("hero.title2")}</span>
                            </h1>

                            <p className="text-lg text-gray-600 max-w-xl leading-relaxed font-normal">
                                {t("hero.subtitle")}
                            </p>

                            {/* Search Box */}
                            <div className="bg-white p-3 rounded-3xl shadow-xl shadow-[#008080]/5 border border-[#E2ECEC] flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 px-4 py-2 flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-[#E2ECEC]">
                                    <MapPin className="w-5 h-5 text-[#008080] flex-shrink-0" />
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                                            {t("hero.cityLabel")}
                                        </label>
                                        <input
                                            type="text"
                                            id="hero-city"
                                            placeholder={t("hero.cityPlaceholder")}
                                            className="w-full text-sm font-semibold text-gray-800 focus:outline-none bg-transparent"
                                        />
                                    </div>
                                </div>

                                <Link href="/explore" className="flex items-center">
                                    <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-[#008080] hover:bg-[#006F6F] text-white text-base font-bold shadow-lg shadow-[#008080]/20 transition-all hover:scale-105">
                                        {t("hero.searchBtn")}
                                        <Search className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex items-center gap-6 pt-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[#008080]" />
                                    {t("hero.verified")}
                                </span>
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[#008080]" />
                                    {t("hero.noDeposit")}
                                </span>
                            </div>
                        </div>

                        {/* Hero Image Showcase */}
                        <div className="relative animate-in fade-in slide-in-from-right duration-700">
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#008080]/10 border-[8px] border-white">
                                <img
                                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
                                    alt="TIDO Exclusive Space"
                                    className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-900 shadow-md border border-[#E2ECEC]">
                                    {t("hero.badgeTag")}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categorii de spații (3 Categories as requested) */}
                <section className="py-20 bg-white border-y border-[#E2ECEC]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                            <div>
                                <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-[#1A2020]">
                                    {t("cat.title")}
                                </h2>
                                <p className="text-gray-500 mt-2">
                                    {t("cat.subtitle")}
                                </p>
                            </div>
                            <Link href="/explore" className="text-sm font-bold text-[#008080] hover:text-[#006F6F] flex items-center gap-1">
                                {t("cat.viewAll")} <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {POPULAR_CATEGORIES.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={\`/explore?category=\${cat.id}\`}
                                    className="group p-6 rounded-3xl border border-[#E2ECEC] hover:border-[#008080] hover:shadow-xl hover:shadow-[#008080]/5 transition-all duration-300 bg-white"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[#E6F4F4] flex items-center justify-center text-[#008080] group-hover:bg-[#008080] group-hover:text-white transition-colors duration-300 mb-5">
                                        <cat.icon className="w-7 h-7" />
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#008080] transition-colors">
                                            {cat.label}
                                        </h3>
                                        <span className="text-xs font-semibold text-gray-400">{cat.count}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-normal">
                                        {cat.desc}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Servicii (3 Options + Vezi toate serviciile opens /explore?type=servicii) */}
                <section className="py-20 bg-[#F3F8F8] border-b border-[#E2ECEC]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                            <div>
                                <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-[#1A2020]">
                                    {t("services.title")}
                                </h2>
                                <p className="text-gray-500 mt-2">
                                    {t("services.subtitle")}
                                </p>
                            </div>
                            <Link href="/explore?type=servicii" className="text-sm font-bold text-[#008080] hover:text-[#006F6F] flex items-center gap-1">
                                {t("services.viewAll")} <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* 3 Main Service Options with same function, features, and setup */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {POPULAR_SERVICES.map((serv) => (
                                <Link
                                    key={serv.id}
                                    href={\`/explore?type=servicii&category=\${serv.id}\`}
                                    className="group p-6 rounded-3xl border border-[#E2ECEC] hover:border-[#008080] hover:shadow-xl hover:shadow-[#008080]/5 transition-all duration-300 bg-white"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[#E6F4F4] flex items-center justify-center text-[#008080] group-hover:bg-[#008080] group-hover:text-white transition-colors duration-300 mb-5">
                                        <serv.icon className="w-7 h-7" />
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#008080] transition-colors">
                                            {serv.label}
                                        </h3>
                                        <span className="text-xs font-semibold text-gray-400">{serv.count}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-normal">
                                        {serv.desc}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Host CTA */}
                <section className="py-24 bg-gradient-to-r from-[#004D4D] via-[#006F6F] to-[#008080] text-white relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <span className="text-xs font-black uppercase tracking-widest text-teal-200">
                                {t("host.badge")}
                            </span>
                            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
                                {t("host.title")}
                            </h2>
                            <p className="text-teal-100 text-base leading-relaxed">
                                {t("host.subtitle")}
                            </p>
                            <div className="flex gap-4 pt-2">
                                <Link href="/register?role=OWNER">
                                    <Button size="lg" className="bg-white text-[#006F6F] hover:bg-teal-50 font-bold rounded-2xl px-8 h-14 shadow-lg shadow-black/10">
                                        {t("host.button")}
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15">
                                <div className="text-3xl font-black text-teal-200 mb-2">{t("host.stat1.val")}</div>
                                <div className="text-sm font-semibold">{t("host.stat1.label")}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15">
                                <div className="text-3xl font-black text-teal-200 mb-2">{t("host.stat2.val")}</div>
                                <div className="text-sm font-semibold">{t("host.stat2.label")}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15">
                                <div className="text-3xl font-black text-teal-200 mb-2">{t("host.stat3.val")}</div>
                                <div className="text-sm font-semibold">{t("host.stat3.label")}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15">
                                <div className="text-3xl font-black text-teal-200 mb-2">{t("host.stat4.val")}</div>
                                <div className="text-sm font-semibold">{t("host.stat4.label")}</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#111A1A] py-16 text-white border-t border-teal-950">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
                    <div className="space-y-4 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#008080] rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight">TI<span className="text-[#008080]">DO</span></span>
                        </Link>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {t("footer.desc")}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-4">{t("footer.categories")}</h4>
                        <ul className="space-y-2 text-xs text-gray-400">
                            <li><Link href="/explore?category=cocina" className="hover:text-white">{t("cat.kitchens")}</Link></li>
                            <li><Link href="/explore?category=coworking" className="hover:text-white">{t("cat.coworking")}</Link></li>
                            <li><Link href="/explore?category=estudio" className="hover:text-white">{t("cat.studios")}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-4">{t("services.title")}</h4>
                        <ul className="space-y-2 text-xs text-gray-400">
                            <li><Link href="/explore?type=servicii&category=curatenie" className="hover:text-white">{t("services.cleaning")}</Link></li>
                            <li><Link href="/explore?type=servicii&category=catering" className="hover:text-white">{t("services.catering")}</Link></li>
                            <li><Link href="/explore?type=servicii&category=echipamente" className="hover:text-white">{t("services.tech")}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-4">{t("footer.legal")}</h4>
                        <ul className="space-y-2 text-xs text-gray-400">
                            <li><Link href="/privacy" className="hover:text-white">{t("footer.privacy")}</Link></li>
                            <li><Link href="/terms" className="hover:text-white">{t("footer.terms")}</Link></li>
                            <li><Link href="/gdpr" className="hover:text-white">{t("footer.gdpr")}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-teal-950/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                    <p>&copy; {new Date().getFullYear()} TIDO. {t("footer.rights")}</p>
                    <p>{t("footer.tagline")}</p>
                </div>
            </footer>
        </div>
    );
}
`;
fs.writeFileSync('app/page.tsx', pageContent, 'utf8');
console.log('app/page.tsx updated');

// 2. Update components/explore/space-filters.tsx
const filtersContent = `"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sparkles, Building2 } from "lucide-react";

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

export function SpaceFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const isServiceMode = searchParams.get("type") === "servicii" || searchParams.get("category") === "servicii" || searchParams.get("q")?.toLowerCase() === "servicii";

    const [city, setCity] = useState(searchParams.get("city") || "");
    const [category, setCategory] = useState(searchParams.get("category") || "");
    const [query, setQuery] = useState(searchParams.get("q") && searchParams.get("q")?.toLowerCase() !== "servicii" ? searchParams.get("q")! : "");
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
        router.push(\`\${pathname}?\${params.toString()}\`);
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

        router.push(\`\${pathname}?\${params.toString()}\`);
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
            router.push(\`\${pathname}?type=servicii\`);
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
                        className={\`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all \${
                            !isServiceMode
                                ? "bg-white dark:bg-gray-700 text-[#008080] shadow-sm font-black"
                                : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                        }\`}
                    >
                        <Building2 className="w-3.5 h-3.5" />
                        Spații
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("services")}
                        className={\`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all \${
                            isServiceMode
                                ? "bg-[#008080] text-white shadow-sm font-black"
                                : "text-gray-500 hover:text-[#008080]"
                        }\`}
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
                                router.push(\`\${pathname}?\${params.toString()}\`);
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
                                        router.push(\`\${pathname}?\${params.toString()}\`);
                                    }}
                                    className={\`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors \${
                                        (!mounted ? false : city === c)
                                            ? "bg-[#008080] text-white shadow-sm"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                                    }\`}
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
                            <span className="font-bold text-[#008080]">{!mounted || priceRange[1] >= 200 ? "No limit" : \`\${priceRange[1]} RON/h\`}</span>
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
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Amenities</Label>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {AMENITIES_OPTIONS.map((amenity) => (
                                <div key={amenity.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={amenity.id}
                                        checked={selectedAmenities.includes(amenity.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedAmenities([...selectedAmenities, amenity.id]);
                                            } else {
                                                setSelectedAmenities(selectedAmenities.filter(a => a !== amenity.id));
                                            }
                                        }}
                                    />
                                    <label htmlFor={amenity.id} className="text-xs text-gray-600 dark:text-gray-300 font-normal cursor-pointer select-none">
                                        {amenity.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                        <Button onClick={applyFilters} className="w-full bg-[#008080] hover:bg-[#006F6F] text-white">
                            Apply filters
                        </Button>
                        <Button onClick={clearFilters} variant="outline" className="w-full text-xs">
                            Reset
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
`;
fs.writeFileSync('components/explore/space-filters.tsx', filtersContent, 'utf8');
console.log('components/explore/space-filters.tsx updated');

// 3. Update app/explore/page.tsx
const exploreContent = `import { SpaceFilters } from "@/components/explore/space-filters";
import { SpaceGrid } from "@/components/explore/space-grid";
import MapComponent from "@/components/ui/map-component";
import React from "react";

export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";

async function getSpaces(searchParams: { [key: string]: string | string[] | undefined }) {
    const city = searchParams.city as string | undefined;
    const category = searchParams.category as string | undefined;
    const q = searchParams.q as string | undefined;
    const minPrice = searchParams.minPrice as string | undefined;
    const maxPrice = searchParams.maxPrice as string | undefined;
    const capacity = searchParams.capacity as string | undefined;
    const amenities = searchParams.amenities as string | undefined;
    const lat = searchParams.lat ? parseFloat(searchParams.lat as string) : undefined;
    const lng = searchParams.lng ? parseFloat(searchParams.lng as string) : undefined;
    const type = searchParams.type as string | undefined;

    const where: any = { active: true };

    if (lat && lng) {
        const latOffset = 0.45;
        const lngOffset = 0.60;
        where.latitude = { gte: lat - latOffset, lte: lat + latOffset };
        where.longitude = { gte: lng - lngOffset, lte: lng + lngOffset };
    } else if (city) {
        where.city = { contains: city, mode: 'insensitive' };
    }

    if (category) {
        const serviceKeywords: Record<string, string[]> = {
            curatenie: ["curatenie", "clean", "igienizare"],
            catering: ["catering", "coffee", "mancare", "kitchen", "cocina"],
            fotografie: ["foto", "video", "estudio", "camera"],
            sonorizare: ["sunet", "sound", "dj", "audio", "microfon"],
            proiectoare: ["proiector", "ecran", "led", "tv", "projector"],
            asistenta: ["tehnic", "tech", "wifi", "internet", "it"],
            securitate: ["securitate", "security", "paza", "acces"],
            bar: ["bar", "bauturi", "cocktail", "barista"],
            decor: ["decor", "flori", "mobilier", "design"],
            hostess: ["hostess", "receptie", "protocol"]
        };

        const keywords = serviceKeywords[category.toLowerCase()];
        if (keywords && keywords.length > 0) {
            where.OR = [
                { category: { contains: category, mode: 'insensitive' } },
                ...keywords.map(kw => ({ description: { contains: kw, mode: 'insensitive' } })),
                ...keywords.map(kw => ({ name: { contains: kw, mode: 'insensitive' } })),
                ...keywords.map(kw => ({ amenitiesList: { contains: kw, mode: 'insensitive' } }))
            ];
        } else {
            where.OR = [
                { category: { contains: category, mode: 'insensitive' } },
                { description: { contains: category, mode: 'insensitive' } },
                { name: { contains: category, mode: 'insensitive' } }
            ];
        }
    }

    // Do not filter out if q is literally "servicii"
    if (q && q.toLowerCase() !== "servicii") {
        where.OR = [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } }
        ];
    }

    if (minPrice || maxPrice) {
        where.hourlyRate = {};
        if (minPrice) where.hourlyRate.gte = parseFloat(minPrice);
        if (maxPrice) where.hourlyRate.lte = parseFloat(maxPrice);
    }

    if (capacity) {
        where.capacity = { gte: parseInt(capacity) };
    }

    if (amenities) {
        const amenityList = amenities.split(",");
        where.AND = amenityList.map((amenity) => ({
            amenitiesList: { contains: amenity }
        }));
    }

    const sort = searchParams.sort as string | undefined;

    let spaces = await prisma.space.findMany({
        where,
        include: {
            photos: true,
            bookings: {
                where: {
                    status: { in: ["CONFIRMED", "COMPLETED"] }
                },
                select: {
                    startTime: true,
                    endTime: true
                }
            }
        },
        orderBy: {
            id: 'asc'
        }
    });

    const spacesWithHours = spaces.map(space => {
        const totalBookedHours = space.bookings.reduce((total, booking) => {
            const start = new Date(booking.startTime).getTime();
            const end = new Date(booking.endTime).getTime();
            const hours = (end - start) / (1000 * 60 * 60);
            return total + (hours > 0 ? hours : 0);
        }, 0);
        return {
            ...space,
            totalBookedHours
        };
    });

    if (sort === "price_asc") {
        spacesWithHours.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sort === "price_desc") {
        spacesWithHours.sort((a, b) => b.hourlyRate - a.hourlyRate);
    } else {
        spacesWithHours.sort((a, b) => b.totalBookedHours - a.totalBookedHours);
    }

    return spacesWithHours;
}

export default async function ExploreSpacesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const spaces = await getSpaces(params);
    const selectedCity = params.city as string | undefined;
    const isServiceMode = params.type === "servicii" || params.category === "servicii";

    const romaniaCitiesCoords: Record<string, [number, number]> = {
        "București": [44.4268, 26.1025],
        "Cluj-Napoca": [46.7712, 23.6236],
        "Timișoara": [45.7489, 21.2087],
        "Iași": [47.1585, 27.6014],
        "Constanța": [44.1792, 28.6499],
        "Brașov": [45.6427, 25.5887],
        "Craiova": [44.3302, 23.7949],
        "Galați": [45.4353, 28.0080],
        "Oradea": [47.0465, 21.9189],
        "Brăila": [45.2692, 27.9575],
    };

    let defaultLat = 44.4268;
    let defaultLng = 26.1025;
    
    const urlLat = params.lat ? parseFloat(params.lat as string) : null;
    const urlLng = params.lng ? parseFloat(params.lng as string) : null;
    
    const normalizeString = (str: string) => str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();
    
    if (urlLat && urlLng) {
        defaultLat = urlLat;
        defaultLng = urlLng;
    } else if (selectedCity) {
        const normalizedSelected = normalizeString(selectedCity);
        const foundKey = Object.keys(romaniaCitiesCoords).find(k => normalizeString(k) === normalizedSelected);
        if (foundKey) {
            defaultLat = romaniaCitiesCoords[foundKey][0];
            defaultLng = romaniaCitiesCoords[foundKey][1];
        }
    } else if (spaces.length > 0 && spaces[0].latitude && spaces[0].longitude) {
        defaultLat = spaces[0].latitude;
        defaultLng = spaces[0].longitude;
    }

    const centerLat = defaultLat;
    const centerLng = defaultLng;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                            {isServiceMode ? "Explorează Servicii & Spații" : "Explore Spaces by the Hour"}
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm font-medium">
                            {isServiceMode
                                ? \`Găsește spații cu servicii verificate (\${spaces.length} spații disponibile).\`
                                : \`Find and book unique spaces for any project or event (\${spaces.length} spaces available).\`
                            }
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm sticky top-8">
                            <React.Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />}>
                                <SpaceFilters />
                            </React.Suspense>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="w-full h-[300px] md:h-[400px]">
                            <MapComponent lat={centerLat} lng={centerLng} zoom={13} showDirectionsLink={false} spaces={spaces} />
                        </div>
                        <SpaceGrid spaces={spaces} />
                    </div>
                </div>
            </div>
        </div>
    );
}
`;
fs.writeFileSync('app/explore/page.tsx', exploreContent, 'utf8');
console.log('app/explore/page.tsx updated');
