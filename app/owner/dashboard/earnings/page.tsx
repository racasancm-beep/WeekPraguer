"use client";

import { Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

interface StatItem {
    name: string;
    total: number;
    isActual: boolean;
    isProjection?: boolean;
}

export default function EarningsPage() {
    return (
        <Suspense fallback={<div className="p-8">Loading earnings...</div>}>
            <EarningsPageContent />
        </Suspense>
    );
}

function EarningsPageContent() {
    const searchParams = useSearchParams();
    const userId = searchParams?.get("userId");

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

    if (loading) return <div className="p-8">Loading earnings...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {inspectedUser && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-gray-950 px-2 py-0.5 rounded-full">
                            ADMIN Profile Access
                        </span>
                        <h2 className="text-lg font-bold text-gray-900 mt-1">
                            Viewing Owner Profile: {inspectedUser.name || inspectedUser.email} ({inspectedUser.email})
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/owner/dashboard/earnings">
                            <Button size="sm" variant="outline">View All Owners Combined</Button>
                        </Link>
                        <Link href="/admin/dashboard">
                            <Button size="sm" className="bg-gray-900 text-white">Back to Admin Hub</Button>
                        </Link>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Earnings Dashboard</h1>
                <Link href="/owner/dashboard/listings/create">
                    <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-lg shadow-violet-600/20 font-bold">
                        + List New Space
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-br from-white to-violet-50 dark:from-gray-900 dark:to-violet-900/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">💶</span>
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-violet-600 uppercase tracking-wider">
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-gray-900 dark:text-gray-100">
                            RON{stats.revenue.toFixed(2)}
                        </div>
                        <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center">
                            +RON{stats.revenueThisMonth.toFixed(2)} this month
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-0 shadow-lg bg-white dark:bg-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                            Total Bookings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-gray-900 dark:text-gray-100">
                            {stats.bookings}
                        </div>
                        <p className="text-xs font-semibold text-violet-600 mt-2">
                            +{stats.newBookingsTrend} from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-0 shadow-lg bg-white dark:bg-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                            Growth
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-gray-900 dark:text-gray-100">
                            +{stats.growth}%
                        </div>
                        <p className="text-xs font-semibold text-gray-400 mt-2">
                            Year over year
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 rounded-3xl border-0 shadow-lg bg-white dark:bg-gray-800">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700/50 pb-4">
                        <CardTitle className="text-base font-bold flex items-center">
                            📈 Revenue Overview
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
                            🗓️ Recent Confirmed Bookings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {recentBookings.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">No recent bookings.</p>
                            ) : (
                                recentBookings.map((booking: any) => (
                                    <div key={booking.id} className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 font-bold">
                                            {booking.renter?.name?.[0] || "U"}
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
                                                {booking.renter?.name || "Unknown User"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {booking.space?.name}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-bold text-sm text-gray-900 dark:text-gray-100">
                                            +RON{booking.totalPrice?.toFixed(2)}
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
