"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
    Camera,
    Music
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { useSession } from "next-auth/react";

export default function HomePage() {
    const { t } = useLanguage();
    const { data: session } = useSession();

    // Genie interactive hover & solidification state (silent - no sound)
    const [isGenieHovered, setIsGenieHovered] = useState(false);
    const [solidProgress, setSolidProgress] = useState(0); // 0 (translucent) -> 1 (fully solid / non-translucent)
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopGenieTimers = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    }, []);

    const startGenieAnimation = useCallback(() => {
        stopGenieTimers();
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
    }, [stopGenieTimers]);

    const handleGenieMouseEnter = useCallback(() => {
        startGenieAnimation();
    }, [startGenieAnimation]);

    const handleGenieMouseLeave = useCallback(() => {
        stopGenieTimers();
        setIsGenieHovered(false);
        setSolidProgress(0);
    }, [stopGenieTimers]);

    useEffect(() => {
        return () => stopGenieTimers();
    }, [stopGenieTimers]);

    // 3 Space Categories (keep only 3 under "Categorii de spații")
    const POPULAR_CATEGORIES = [
        {
            id: "cocina",
            label: t("cat.kitchens"),
            desc: t("cat.kitchens.desc"),
            icon: Utensils,
            count: `40+ ${t("spaces.count")}`
        },
        {
            id: "coworking",
            label: t("cat.coworking"),
            desc: t("cat.coworking.desc"),
            icon: Laptop,
            count: `80+ ${t("spaces.count")}`
        },
        {
            id: "estudio",
            label: t("cat.studios"),
            desc: t("cat.studios.desc"),
            icon: Camera,
            count: `120+ ${t("spaces.count")}`
        },
    ];

    // 3 Services Options (same functions, features, and setup as space categories)
    const POPULAR_SERVICES = [
        {
            id: "curatenie",
            label: t("services.cleaning"),
            desc: t("services.cleaning.desc"),
            icon: Sparkles,
            count: `90+ ${t("services.count")}`,
        },
        {
            id: "catering",
            label: t("services.catering"),
            desc: t("services.catering.desc"),
            icon: Utensils,
            count: `60+ ${t("services.count")}`,
        },
        {
            id: "echipamente",
            label: t("services.tech"),
            desc: t("services.tech.desc"),
            icon: Laptop,
            count: `45+ ${t("services.count")}`,
        },
    ];

    return (
        <div className="min-h-screen bg-[#F3F8F8] text-[#1A2020] selection:bg-[#E6F4F4]">
            {/* Hero Section */}
            <main>
                <section className="relative py-14 lg:py-24 overflow-x-clip bg-gradient-to-b from-[#E6F4F4]/60 via-[#F3F8F8] to-transparent">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 relative z-20 animate-in fade-in slide-in-from-left duration-700">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E6F4F4] text-[#006F6F] text-xs font-black uppercase tracking-widest border border-[#CCE4E4]">
                                <Sparkles className="w-4 h-4 text-[#008080]" />
                                {t("hero.badge")}
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] text-[#1A2020] relative z-20 pointer-events-none">
                                {t("hero.title1")} <br />
                                <span className="text-[#008080]">{t("hero.title2")}</span>
                            </h1>

                            <p className="text-lg text-gray-600 max-w-xl leading-relaxed font-normal relative z-20 pointer-events-none">
                                {t("hero.subtitle")}
                            </p>

                            {/* Search Box */}
                            <div className="relative z-30 bg-white p-3 rounded-3xl shadow-xl shadow-[#008080]/5 border border-[#E2ECEC] flex flex-col sm:flex-row gap-3">
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

                                <div className="relative flex items-center">
                                    {/* Interactive White Genie with Mustache & Beard emerging from "Caută Spații" box */}
                                    <div
                                        onMouseEnter={handleGenieMouseEnter}
                                        onMouseLeave={handleGenieMouseLeave}
                                        onClick={startGenieAnimation}
                                        title="Hover or click to awaken the Genie"
                                        className="group/genie cursor-pointer select-none absolute bottom-[72%] left-1/2 -translate-x-[42%] lg:-translate-x-[32%] w-[280px] sm:w-[350px] lg:w-[420px] z-30 origin-bottom rotate-[6deg] hover:scale-105 transition-transform duration-700"
                                    >
                                        {/* Dynamic 7-level darkening and Level 7 Golden Hat & Arm Jewelry */}
                                        {(() => {
                                            const genieLevel = isGenieHovered
                                                ? Math.min(7, Math.max(1, Math.ceil(solidProgress * 7)))
                                                : 0;
                                            const levelFraction = genieLevel / 7;
                                            const isFinalGoldLevel = genieLevel === 7;

                                            return (
                                                <>
                                                    {/* Dynamic ambient glow that intensifies across 7 levels (warm gold on Level 7) */}
                                                    <div
                                                        className="pointer-events-none absolute inset-x-6 inset-y-8 rounded-full blur-2xl transition-all duration-200"
                                                        style={{
                                                            background: isFinalGoldLevel
                                                                ? "radial-gradient(circle, rgba(218,165,32,0.55) 0%, rgba(0,128,128,0.40) 55%, transparent 100%)"
                                                                : "radial-gradient(circle, rgba(0,128,128,0.48) 0%, rgba(26,32,32,0.38) 60%, transparent 100%)",
                                                            opacity: 0.25 + levelFraction * 0.75,
                                                        }}
                                                    />

                                                    {/* Glowing smoke wisp anchor right at the Caută Spații button */}
                                                    <div
                                                        className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white blur-md transition-opacity duration-300"
                                                        style={{ opacity: 0.65 + levelFraction * 0.35 }}
                                                    />

                                                    {/* Level 0 Base Layer: White & Translucent Genie */}
                                                    <img
                                                        src="/genie-translucent.png?v=7lvl"
                                                        alt="White Translucent Genie"
                                                        className="relative w-full h-auto object-contain transition-all duration-200"
                                                        style={{
                                                            opacity: isGenieHovered ? Math.max(0.15, 1 - levelFraction * 0.85) : 0.72,
                                                            filter: `drop-shadow(0 8px 24px rgba(0, 111, 111, ${0.28 + levelFraction * 0.42}))`,
                                                        }}
                                                    />

                                                    {/* Levels 1..6 Overlay Layer: Steps through 6 progressively darker charcoal levels */}
                                                    <img
                                                        src="/genie-solid.png?v=7lvl"
                                                        alt="Darkening Awakened Genie (Levels 1-6)"
                                                        className="pointer-events-none absolute inset-0 w-full h-auto object-contain transition-all duration-150"
                                                        style={{
                                                            opacity: isFinalGoldLevel ? 0 : levelFraction,
                                                            filter: `brightness(${1.18 - levelFraction * 0.42}) contrast(${1 + levelFraction * 0.28}) drop-shadow(0 12px 32px rgba(15, 30, 30, ${levelFraction * 0.7}))`,
                                                        }}
                                                    />

                                                    {/* Level 7 Final Overlay Layer: Darkest level WITH Golden Hat & Golden Arm Jewelry */}
                                                    <img
                                                        src="/genie-gold.png?v=7lvl"
                                                        alt="Level 7 Genie with Golden Hat and Arm Jewelry"
                                                        className="pointer-events-none absolute inset-0 w-full h-auto object-contain transition-opacity duration-200"
                                                        style={{
                                                            opacity: isFinalGoldLevel ? 1 : 0,
                                                            filter: "contrast(1.12) drop-shadow(0 12px 32px rgba(184, 134, 11, 0.55))",
                                                        }}
                                                    />
                                                </>
                                            );
                                        })()}

                                        {/* Speech text emerging directly from the genie's mouth (only the text) */}
                                        <div
                                            className={`pointer-events-none absolute top-[21%] left-[54%] z-40 w-[230px] sm:w-[270px] origin-left -rotate-[6deg] transition-all duration-300 ${
                                                isGenieHovered
                                                    ? "opacity-100 scale-100 translate-x-0"
                                                    : "opacity-0 scale-75 -translate-x-4"
                                            }`}
                                        >
                                            <div
                                                className="relative bg-white/95 backdrop-blur-md text-[#111A1A] px-4 py-3 rounded-2xl shadow-2xl border-2 border-[#008080] text-xs sm:text-sm font-black leading-snug tracking-tight"
                                                style={{
                                                    boxShadow: `0 10px 30px rgba(0, 128, 128, ${0.25 + solidProgress * 0.45})`,
                                                }}
                                            >
                                                {/* Speech bubble tail pointing right into the genie's mouth */}
                                                <div className="absolute top-4 -left-2.5 w-4 h-4 bg-white border-l-2 border-b-2 border-[#008080] rotate-45" />
                                                <p className="relative z-10 text-[#006F6F]">
                                                    &ldquo;{t("hero.genieQuote")}&rdquo;
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Link href="/explore" className="relative z-40 flex items-center w-full sm:w-auto">
                                        <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-[#008080] hover:bg-[#006F6F] text-white text-base font-bold shadow-lg shadow-[#008080]/20 transition-all hover:scale-105">
                                            {t("hero.searchBtn")}
                                            <Search className="ml-2 w-5 h-5" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-2 text-xs font-bold text-gray-500 uppercase tracking-wider relative z-20">
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
                        <div className="relative z-10 animate-in fade-in slide-in-from-right duration-700">
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#008080]/10 border-[8px] border-white">
                                <img
                                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
                                    alt="MyGenie Exclusive Space"
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
                                    href={`/explore?category=${cat.id}`}
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
                                    href={`/explore?type=servicii&category=${serv.id}`}
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
                                <Link href={session ? "/owner/dashboard/listings/create" : "/register?role=OWNER"}>
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
                            <span className="text-xl font-black tracking-tight">My<span className="text-[#008080]">Genie</span></span>
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
                    <p>&copy; {new Date().getFullYear()} MyGenie. {t("footer.rights")}</p>
                    <p>{t("footer.tagline")}</p>
                </div>
            </footer>
        </div>
    );
}
