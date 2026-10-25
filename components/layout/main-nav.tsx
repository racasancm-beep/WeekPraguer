"use client";

import Link from "next/link";
import { Clock, Search, Globe, ChevronDown, Package, Shield, Settings, Key, Building, Map, ShieldCheck, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage, LANGUAGES } from "@/lib/i18n/language-context";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useSession } from "next-auth/react";

export function MainNav() {
    const { t, language, setLanguage } = useLanguage();
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    return (
        <div className="sticky top-0 w-full z-50" suppressHydrationWarning>
            {/* Top Multi-Language Bar */}
            <div className="bg-[#008080] text-white text-xs py-2 px-4 shadow-sm border-b border-[#006F6F]">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-medium">
                        <Globe className="w-3.5 h-3.5 opacity-80" />
                        <span>{t("hero.badge")}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#006F6F]/60 p-0.5 rounded-full border border-white/20">
                        {LANGUAGES.map((l) => {
                            const active = l.code === language;
                            return (
                                <button
                                    key={l.code}
                                    type="button"
                                    onClick={() => setLanguage(l.code)}
                                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                                        active
                                            ? "bg-white text-[#008080] shadow-sm"
                                            : "text-white/90 hover:text-white hover:bg-white/10"
                                    }`}
                                >
                                    <span>{l.flag}</span>
                                    <span>{l.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className="w-full bg-white/95 backdrop-blur-xl border-b border-[#E2ECEC] shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 bg-[#008080] rounded-2xl flex items-center justify-center shadow-md shadow-[#008080]/20 group-hover:scale-105 transition-transform duration-300">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-gray-900 group-hover:text-[#008080] transition-colors">
                            My<span className="text-[#008080]">Genie</span>
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-6">
                        <Link href="/explore" className="text-sm font-bold text-gray-600 hover:text-[#008080] transition-colors tracking-wide">
                            {t("nav.explore")}
                        </Link>
                        
                        <div className="relative group">
                            <div className="flex items-center gap-1 text-sm font-bold text-gray-600 group-hover:text-[#008080] transition-colors tracking-wide outline-none cursor-pointer py-4">
                                {t("nav.services")} <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                            </div>
                            <div className="absolute top-full left-0 w-56 p-2 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                {/* Ad block */}
                                <div className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 mb-2 rounded border border-yellow-200 text-center">
                                    {t("nav.sponsoredCleaning")}
                                </div>
                                <Link href="/explore?type=servicii&category=curatenie" className="cursor-pointer flex items-center gap-2 font-medium hover:bg-gray-50 px-2 py-1.5 rounded-md text-sm text-gray-700">
                                    <Package className="w-4 h-4 text-[#008080]" /> {t("nav.cleaning")}
                                </Link>
                                <Link href="/explore?type=servicii&category=securitate" className="cursor-pointer flex items-center gap-2 font-medium hover:bg-gray-50 px-2 py-1.5 rounded-md text-sm text-gray-700">
                                    <Shield className="w-4 h-4 text-[#008080]" /> {t("nav.security")}
                                </Link>
                                <Link href="/explore?type=servicii&category=asistenta" className="cursor-pointer flex items-center gap-2 font-medium hover:bg-gray-50 px-2 py-1.5 rounded-md text-sm text-gray-700">
                                    <Settings className="w-4 h-4 text-[#008080]" /> {t("nav.itManagement")}
                                </Link>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="flex items-center gap-1 text-sm font-bold text-gray-600 group-hover:text-[#008080] transition-colors tracking-wide outline-none cursor-pointer py-4">
                                {t("nav.renting")} <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                            </div>
                            <div className="absolute top-full left-0 w-56 p-2 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <Link href="/explore" className="cursor-pointer flex items-center gap-2 font-medium hover:bg-gray-50 px-2 py-1.5 rounded-md text-sm text-gray-700">
                                    <Key className="w-4 h-4 text-[#008080]" /> {t("nav.longTerm")}
                                </Link>
                                <Link href="/explore" className="cursor-pointer flex items-center gap-2 font-medium hover:bg-gray-50 px-2 py-1.5 rounded-md text-sm text-gray-700">
                                    <Building className="w-4 h-4 text-[#008080]" /> {t("nav.commercialSpaces")}
                                </Link>
                                <Link href="/explore" className="cursor-pointer flex items-center gap-2 font-medium hover:bg-gray-50 px-2 py-1.5 rounded-md text-sm text-gray-700">
                                    <Map className="w-4 h-4 text-[#008080]" /> {t("nav.locationsMap")}
                                </Link>
                            </div>
                        </div>

                        {isAdmin ? (
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider hover:bg-amber-200 transition-colors"
                            >
                                <ShieldCheck className="w-4 h-4 text-amber-700" />
                                {t("nav.adminHub")}
                            </Link>
                        ) : session ? (
                            <Link
                                href="/portal"
                                className="flex items-center gap-1.5 text-sm font-bold text-[#008080] hover:text-[#006F6F] transition-colors"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                {t("nav.dashboard")}
                            </Link>
                        ) : (
                            <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-[#008080] transition-colors tracking-wide">
                                {t("nav.login")}
                            </Link>
                        )}

                        <LanguageSelector variant="dropdown" />

                        <Link href="/register?role=OWNER">
                            <Button className="bg-[#008080] hover:bg-[#006F6F] text-white rounded-2xl px-6 h-11 font-bold shadow-md shadow-[#008080]/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                                {t("nav.listSpace")}
                            </Button>
                        </Link>
                    </div>

                    <div className="flex lg:hidden items-center gap-2">
                        <LanguageSelector variant="dropdown" />
                        <Link href="/explore" className="p-2 text-[#008080]">
                            <Search className="w-6 h-6" />
                        </Link>
                    </div>
                </div>
            </nav>
        </div>
    );
}
