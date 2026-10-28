"use client";

import { Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import { useSession } from "next-auth/react";

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
    const isOwnerRole = (session?.user as any)?.role === "OWNER";

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

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{t("owner.earnings.title")}</h1>
                {isOwnerRole && (
                    <Link href="/owner/dashboard/listings/create">
                        <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-lg shadow-violet-600/20 font-bold">
                            {t("owner.earnings.listNewSpace")}
                        </Button>
                    </Link>
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
                        <div className="space-y-6">
                            {recentBookings.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">{t("owner.earnings.noRecentBookings")}</p>
                            ) : (
                                recentBookings
                                    .filter((booking: any) => booking.accessCode !== "OWNER_BLOCK" && booking.status !== "REJECTED")
                                    .slice(0, 10)
                                    .map((booking: any) => (
                                    <div key={booking.id} className="flex items-start">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 font-bold">
                                            {booking.renter?.name?.[0] || "U"}
                                        </div>
                                        <div className="ml-4 space-y-1 min-w-0">
                                            <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
                                                {booking.renter?.name || t("owner.earnings.unknownUser")}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {booking.space?.name} • {new Date(booking.startTime).toLocaleDateString()} - {new Date(booking.endTime).toLocaleDateString()}
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
                                        <div className="ml-auto pl-2 text-right shrink-0 space-y-0.5">
                                            <div className="text-[10px] font-semibold text-gray-500">
                                                {t("owner.bookings.totalAmount")}: {Number(booking.totalPrice || 0).toFixed(2)} RON
                                            </div>
                                            <div className="text-[10px] font-semibold text-amber-700">
                                                {t("owner.bookings.platformFee")}: -{Number(booking.platformFee ?? booking.commission ?? 0).toFixed(2)} RON
                                            </div>
                                            <div className="font-bold text-sm text-emerald-700">
                                                +RON{Number(booking.ownerEarnings || 0).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
