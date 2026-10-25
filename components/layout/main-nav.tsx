"use client";

import Link from "next/link";
import { Clock, Search, ChevronDown, Package, Shield, Settings, Key, Building, Map, ShieldCheck, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useSession, signOut } from "next-auth/react";

export function MainNav() {
    const { t } = useLanguage();
    const { data: session, status } = useSession();
    const role = (session?.user as any)?.role;
    const isAdmin = role === "ADMIN";
    const isOwner = role === "OWNER";
    const isOwnerOrAdmin = isOwner || isAdmin;
    const listSpaceHref = session ? (isOwnerOrAdmin ? "/owner/dashboard/listings/create" : "/owner/dashboard/listings/create") : "/register?role=OWNER";
    const tickerText = t("nav.tickerText");

    const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "";
    const userEmail = session?.user?.email || "";
    const userInitial = (userName?.[0] || userEmail?.[0] || "U").toUpperCase();
    const userRoleLabel = isAdmin
        ? "ADMIN"
        : isOwner
        ? t("owner.roleBadge")
        : t("renter.roleBadge");

    return (
        <div className="sticky top-0 w-full z-50" suppressHydrationWarning>
            {/* Top Scrolling Ticker Bar (Language selector removed from here and kept on the second bar) */}
            <div className="bg-[#008080] text-white text-xs py-2.5 overflow-hidden shadow-sm border-b border-[#006F6F]">
                <div className="animate-marquee-left whitespace-nowrap font-semibold tracking-wide">
                    <span className="mx-8">{tickerText}</span>
                    <span className="mx-8" aria-hidden="true">• {tickerText}</span>
                </div>
            </div>

            {/* Second Navigation Bar (Contains Top-Left Logged-in User Profile + Logout & Language Selection) */}
            <nav className="w-full bg-white/95 backdrop-blur-xl border-b border-[#E2ECEC] shadow-sm">
                <div className="w-full max-w-[1680px] mx-auto px-3 sm:px-6 min-h-[80px] py-2 flex justify-between items-center gap-3">
                    {/* Top-Left Corner: Logged-in User Profile (Name, Type, Email, Log Out) + Brand Logo */}
                    <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                        {status === "authenticated" && session?.user && (
                            <div className="flex items-center gap-2.5 sm:gap-3 bg-gray-50/90 border border-gray-200/90 rounded-2xl px-2.5 sm:px-3.5 py-1.5 shadow-sm">
                                <div className="h-9 w-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm shrink-0">
                                    {userInitial}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-sm font-bold text-gray-900 truncate max-w-[110px] sm:max-w-[150px]">
                                            {userName}
                                        </span>
                                        <span
                                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                                isAdmin
                                                    ? "bg-amber-100 text-amber-800 border-amber-300"
                                                    : isOwner
                                                    ? "bg-violet-100 text-violet-700 border-violet-200"
                                                    : "bg-[#E6F4F4] text-[#008080] border-[#008080]/20"
                                            }`}
                                        >
                                            {userRoleLabel}
                                        </span>
                                    </div>
                                    {userEmail && (
                                        <p className="text-[11px] text-gray-500 truncate max-w-[130px] sm:max-w-[180px]">
                                            {userEmail}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold text-xs rounded-xl px-2.5 sm:px-3 h-9 flex items-center gap-1.5 shrink-0 bg-white"
                                >
                                    <LogOut className="w-4 h-4 text-red-600 shrink-0" />
                                    <span>{t("nav.signOut")}</span>
                                </Button>
                            </div>
                        )}

                        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                            <div className="w-10 h-10 bg-[#008080] rounded-2xl flex items-center justify-center shadow-md shadow-[#008080]/20 group-hover:scale-105 transition-transform duration-300">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 group-hover:text-[#008080] transition-colors hidden sm:inline">
                                My<span className="text-[#008080]">Genie</span>
                            </span>
                        </Link>
                    </div>

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

                        <Link href={listSpaceHref}>
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
