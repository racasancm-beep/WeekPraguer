"use client";

import { Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import { useSession } from "next-auth/react";
import { ChevronDown, ChevronUp, Calendar, Sparkles, MapPin, Clock, Pencil, ExternalLink, Building2 } from "lucide-react";

interface StatItem {
    name: string;
    total: number;
    isActual: boolean;
    isProjection?: boolean;
}

export default function EarningsPage() {
    const { t } = useLanguage();
    return (
        <Suspense fallback={<div className="p-8">{t("owner.earnings.loading")}</div>}>
            <EarningsPageContent />
        </Suspense>
    );
}

function EarningsPageContent() {
    const searchParams = useSearchParams();
    const userId = searchParams?.get("userId");
    const { t } = useLanguage();
    const { data: session } = useSession();
    const role = (session?.user as any)?.role;
    const isServiceOwner = role === "SERVICE_OWNER";
    const isOwnerRole = role === "OWNER" || isServiceOwner;

    const [stats, setStats] = useState({
        revenue: 0,
        revenueThisMonth: 0,
        growth: "0.0",
        bookings: 0,
        newBookingsTrend: 0
    });
    const [inspectedUser, setInspectedUser] = useState<any>(null);
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [chartData, setChartData] = useState<StatItem[]>([]);
    const [spaces, setSpaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        try {
            const url = userId ? `/api/owner/dashboard-stats?userId=${encodeURIComponent(userId)}` : "/api/owner/dashboard-stats";
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setStats({
                    revenue: data.revenue || 0,
                    revenueThisMonth: data.revenueThisMonth || 0,
                    growth: data.growth || "0.0",
                    bookings: data.count || 0,
                    newBookingsTrend: data.newBookingsTrend || 0
                });
                setInspectedUser(data.inspectedUser || null);
                setRecentBookings(data.bookings || []);
                setChartData(data.chartData || []);
                setSpaces(data.spaces || []);

                // If this is a Service Owner without any services created yet, route them directly to create their first service!
                if (isServiceOwner && !userId && (!data.spaces || data.spaces.length === 0)) {
                    window.location.href = "/owner/dashboard/listings/create?type=SERVICE";
                    return;
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">{t("owner.earnings.loading")}</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {inspectedUser && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-gray-950 px-2 py-0.5 rounded-full">
                            {t("owner.earnings.adminAccess")}
                        </span>
                        <h2 className="text-lg font-bold text-gray-900 mt-1">
                            {t("owner.earnings.viewingProfile")}: {inspectedUser.name || inspectedUser.email} ({inspectedUser.email})
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/owner/dashboard/earnings">
                            <Button size="sm" variant="outline">{t("owner.earnings.viewAllCombined")}</Button>
                        </Link>
                        <Link href="/admin/dashboard">
                            <Button size="sm" className="bg-gray-900 text-white">{t("owner.backToAdminHub")}</Button>
                        </Link>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                    {t("owner.earnings.title") || "Panou Câștiguri & Grafice"}
                </h1>
                {isOwnerRole && (
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <Link href="/owner/dashboard/listings/create">
                            <Button variant="outline" className="border-teal-300 text-teal-800 hover:bg-teal-50 font-bold rounded-xl shadow-xs text-xs h-9">
                                <Building2 className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                                {t("owner.earnings.listNewSpace") || "+ Adaugă Spațiu"}
                            </Button>
                        </Link>
                        <Link href="/owner/dashboard/listings/create?type=SERVICE">
                            <Button className="bg-[#008080] hover:bg-[#006F6F] text-white rounded-xl shadow-md font-bold text-xs h-9 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                {t("service.addNewService") || "+ Adaugă Serviciu"}
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-br from-white to-violet-50 dark:from-gray-900 dark:to-violet-900/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">💶</span>
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-violet-600 uppercase tracking-wider">
                            {t("owner.earnings.totalRevenue")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-gray-900 dark:text-gray-100">
                            RON{stats.revenue.toFixed(2)}
                        </div>
                        <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center">
                            +RON{stats.revenueThisMonth.toFixed(2)} {t("owner.earnings.thisMonth")}
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-0 shadow-lg bg-white dark:bg-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                            {t("owner.earnings.totalBookings")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-gray-900 dark:text-gray-100">
                            {stats.bookings}
                        </div>
                        <p className="text-xs font-semibold text-violet-600 mt-2">
                            +{stats.newBookingsTrend} {t("owner.earnings.fromLastMonth")}
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-0 shadow-lg bg-white dark:bg-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                            {t("owner.earnings.growth")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-gray-900 dark:text-gray-100">
                            +{stats.growth}%
                        </div>
                        <p className="text-xs font-semibold text-gray-400 mt-2">
                            {t("owner.earnings.yearOverYear")}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 rounded-3xl border-0 shadow-lg bg-white dark:bg-gray-800">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700/50 pb-4">
                        <CardTitle className="text-base font-bold flex items-center">
                            📈 {t("owner.earnings.revenueOverview")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `RON${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar
                                        dataKey="total"
                                        radius={[6, 6, 6, 6]}
                                        maxBarSize={40}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.isProjection ? '#E2E8F0' : '#8B5CF6'}
                                                className={entry.isProjection ? 'opacity-50' : ''}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="rounded-3xl border-0 shadow-lg bg-white dark:bg-gray-800">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700/50 pb-4">
                        <CardTitle className="text-base font-bold flex items-center">
                            🗓️ {t("owner.earnings.recentConfirmed")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            {recentBookings.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">{t("owner.earnings.noRecentBookings")}</p>
                            ) : (
                                recentBookings
                                    .filter((booking: any) => booking.accessCode !== "OWNER_BLOCK" && booking.status !== "REJECTED")
                                    .slice(0, 10)
                                    .map((booking: any) => (
                                        <RecentConfirmedBookingItem key={booking.id} booking={booking} />
                                    ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Prominent Services & Spaces Added on the Platform */}
            <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#008080] flex items-center justify-center font-bold shrink-0">
                            <Sparkles className="w-5 h-5 text-[#008080]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                                {t("owner.mySpacesOnPlatform") || "Spațiile & Serviciile Mele Adăugate"}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {spaces.length} {spaces.length === 1 ? "listare activă" : "listări active"} ({spaces.filter((s: any) => !s.isService).length} spații, {spaces.filter((s: any) => s.isService).length} servicii)
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link href="/owner/dashboard/listings/create">
                            <Button size="sm" variant="outline" className="border-teal-300 text-teal-800 hover:bg-teal-50 font-bold rounded-xl text-xs h-9 px-3.5 flex items-center gap-1.5 shadow-xs">
                                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                                {t("owner.earnings.listNewSpace") || "+ Adaugă Spațiu"}
                            </Button>
                        </Link>
                        <Link href="/owner/dashboard/listings/create?type=SERVICE">
                            <Button size="sm" className="bg-[#008080] hover:bg-[#006F6F] text-white font-bold rounded-xl text-xs h-9 px-3.5 flex items-center gap-1.5 shadow-sm">
                                <Sparkles className="w-3.5 h-3.5" />
                                {t("service.addNewService") || "+ Adaugă Serviciu"}
                            </Button>
                        </Link>
                    </div>
                </div>

                {spaces.length === 0 ? (
                    <Card className="p-8 text-center rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white/50">
                        <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {t("owner.listings.noListingsYet") || "Nu ai adăugat încă nicio listare."}
                        </p>
                        <p className="text-xs text-gray-500 mb-4 mt-1">
                            Adaugă primul tău spațiu sau serviciu pentru a începe să primești rezervări de la clienți.
                        </p>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            <Link href="/owner/dashboard/listings/create">
                                <Button variant="outline" className="border-teal-300 text-teal-800 font-bold rounded-xl text-xs">
                                    <Building2 className="w-3.5 h-3.5 mr-1 text-teal-600" />
                                    {t("owner.earnings.listNewSpace") || "+ Adaugă Spațiu"}
                                </Button>
                            </Link>
                            <Link href="/owner/dashboard/listings/create?type=SERVICE">
                                <Button className="bg-[#008080] hover:bg-[#006F6F] text-white font-bold rounded-xl text-xs">
                                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                    {t("service.addNewService") || "+ Adaugă Serviciu"}
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {spaces.map((space: any) => (
                            <Card key={space.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                                <div className="h-36 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                                    {space.photos?.[0]?.url ? (
                                        <img src={space.photos[0].url} alt={space.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-teal-50 dark:bg-teal-950/20 text-[#008080]">
                                            <Sparkles className="w-8 h-8 opacity-40" />
                                        </div>
                                    )}
                                    {space.isService ? (
                                        <span className="absolute top-2.5 left-2.5 bg-[#008080] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            <span>★ {space.serviceCategory || space.category || "Serviciu"}</span>
                                        </span>
                                    ) : (
                                        <span className="absolute top-2.5 left-2.5 bg-teal-800 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                                            <Building2 className="w-3 h-3" />
                                            <span>🏢 {space.category || "Spațiu"}</span>
                                        </span>
                                    )}
                                    <span className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                                        space.active !== false ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"
                                    }`}>
                                        {space.active !== false ? "Activ" : "Inactiv"}
                                    </span>
                                </div>
                                <CardContent className="p-4 space-y-2.5">
                                    <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate" title={space.name}>
                                        {space.name}
                                    </h3>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <MapPin className="w-3.5 h-3.5 mr-1 text-[#008080] shrink-0" />
                                        <span className="truncate">{space.city}{space.district ? ` • ${space.district}` : ""}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-gray-100 dark:border-gray-700">
                                        <div className="font-extrabold text-[#008080] text-sm">
                                            {space.hourlyRate} RON <span className="text-[10px] text-gray-400 font-normal">/ h</span>
                                        </div>
                                        <div className="flex items-center text-[11px] text-gray-600 dark:text-gray-300 font-bold bg-gray-50 dark:bg-gray-700/60 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600">
                                            <Clock className="w-3 h-3 mr-1 text-[#008080]" />
                                            {space.availableHours || "09:00 - 18:00"}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-1.5">
                                        <Link href={`/owner/dashboard/listings/${space.id}/edit`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-8 rounded-lg">
                                                <Pencil className="w-3 h-3 mr-1" /> Modifică
                                            </Button>
                                        </Link>
                                        <Link href={space.isService ? `/services/${space.id}` : `/spaces/${space.id}`} className="flex-1">
                                            <Button size="sm" className="w-full bg-[#1A2020] hover:bg-[#008080] text-white text-xs font-semibold h-8 rounded-lg transition-colors">
                                                <ExternalLink className="w-3 h-3 mr-1" /> Vezi
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function RecentConfirmedBookingItem({ booking }: { booking: any }) {
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);

    const startDate = new Date(booking.startTime);
    const endDate = new Date(booking.endTime);
    const startTimeStr = startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const endTimeStr = endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const timeIntervalStr = `${startTimeStr} - ${endTimeStr}`;

    // Initial small / collapsed view displaying Space name, Date + Time Interval, Status
    if (!isExpanded) {
        return (
            <div
                onClick={() => setIsExpanded(true)}
                role="button"
                tabIndex={0}
                className="p-3 rounded-2xl bg-gray-50/80 hover:bg-teal-50/30 border border-gray-200 hover:border-teal-300 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-[#008080] flex items-center justify-center font-bold text-xs shrink-0">
                        {booking.space?.name?.[0] || "S"}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-xs text-gray-900 group-hover:text-[#008080] transition-colors truncate">
                            {booking.space?.name}
                        </p>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1.5 flex-wrap">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                                {startDate.toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                <Clock className="w-3 h-3 text-[#008080] shrink-0" />
                                {timeIntervalStr}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {t("renter.status.approved") || "Confirmat"}
                    </span>
                    <div className="p-1 rounded-full bg-white group-hover:bg-[#008080] group-hover:text-white text-gray-400 transition-colors shadow-sm">
                        <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
        );
    }

    // Expanded view showing all details (Customer contact, Time interval, Total, Platform fee, Owner price)
    return (
        <div className="p-3.5 rounded-2xl bg-white border-2 border-teal-200 shadow-sm transition-all space-y-3">
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-gray-100">
                <div>
                    <p className="font-black text-sm text-gray-900">{booking.space?.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {startDate.toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                            <Clock className="w-3.5 h-3.5 text-[#008080]" />
                            {timeIntervalStr}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {t("renter.status.approved") || "Confirmat"}
                    </span>
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                        title={t("common.hideDetails") || "Restrânge"}
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Customer Contact */}
                <div className="space-y-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <span className="text-[10px] uppercase text-gray-400 font-bold">Client:</span>
                        {booking.renter?.name || t("owner.earnings.unknownUser")}
                    </p>
                    {booking.renter?.email && (
                        <a href={`mailto:${booking.renter.email}`} className="block text-[11px] font-mono text-blue-700 hover:underline truncate">
                            {booking.renter.email}
                        </a>
                    )}
                    <p className="text-[11px] text-gray-600">
                        {booking.renter?.phone || t("owner.bookings.noPhoneProvided")}
                    </p>
                </div>

                {/* Price Breakdown */}
                <div className="text-right shrink-0 space-y-0.5 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <div className="text-[10px] font-semibold text-gray-500">
                        {t("owner.bookings.totalAmount")}: {Number(booking.totalPrice || 0).toFixed(2)} RON
                    </div>
                    <div className="text-[10px] font-semibold text-amber-700">
                        {t("owner.bookings.platformFee")}: {Number(booking.platformFee ?? booking.commission ?? 0).toFixed(2)} RON
                    </div>
                    <div className="font-bold text-xs text-emerald-700">
                        {t("owner.bookings.ownerPrice")}: RON{Number(booking.ownerEarnings || 0).toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
}
