"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Calendar, CheckCircle2, UserCheck, Search, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface StatItem {
    name: string;
    total: number;
    isActual: boolean;
    isProjection?: boolean;
}

interface Cleaner {
    id: string;
    name: string;
    email: string;
    image?: string;
    verified: boolean;
}

export default function OwnerDashboard() {
    const [stats, setStats] = useState({ revenue: 0, bookings: 0 });
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [chartData, setChartData] = useState<StatItem[]>([]);
    const [cleaners, setCleaners] = useState<Cleaner[]>([]);
    const [loading, setLoading] = useState(true);

    // Cleaner Selection Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        fetchCleaners();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/owner/dashboard-stats");
            if (res.ok) {
                const data = await res.json();
                setStats({ revenue: data.revenue || 0, bookings: data.count || 0 });
                setRecentBookings(data.bookings || []);
                setChartData(data.chartData || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchCleaners = async () => {
        try {
            const res = await fetch("/api/owner/cleaners");
            if (res.ok) {
                const data = await res.json();
                setCleaners(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const toggleCleaning = async (bookingId: string, wantsCleaning: boolean, cleanerId?: string) => {
        try {
            const res = await fetch("/api/owner/cleaning-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, wantsCleaning, cleanerId }),
            });
            if (res.ok) {
                toast.success(cleanerId ? "Cleaner assigned successfully!" : "Cleaning request updated.");
                setIsModalOpen(false);
                fetchData();
            } else {
                const d = await res.json();
                toast.error(d.error || "Failed to update cleaning request.");
            }
        } catch (e) {
            toast.error("Network error.");
        }
    };

    const handleHireCleanerClick = (bookingId: string) => {
        setSelectedBookingId(bookingId);
        setIsModalOpen(true);
    };

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-extrabold tracking-tight">Owner Dashboard</h1>
                <Link href="/owner/dashboard/listings/create">
                    <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-lg transition-all rounded-xl">
                        + List New Space
                    </Button>
                </Link>
            </div>

            {/* Top Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-none shadow-xl bg-gradient-to-br from-white to-violet-50 dark:from-gray-900 dark:to-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Total Revenue</CardTitle>
                        <span className="text-violet-600 font-bold">CZK</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{stats.revenue.toLocaleString()}</div>
                        <p className="text-xs text-green-600 font-semibold mt-1">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Active Bookings</CardTitle>
                        <Calendar className="h-5 w-5 text-violet-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{stats.bookings}</div>
                        <p className="text-xs text-violet-600 font-semibold mt-1">+2 since last week</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid gap-8 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-none shadow-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2 pb-8">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white dark:bg-gray-800 p-3 border rounded-xl shadow-xl">
                                                    <p className="font-bold text-sm">{data.name}</p>
                                                    <p className="text-violet-600 font-black">{data.total.toLocaleString()} CZK</p>
                                                    <p className="text-[10px] uppercase text-gray-400">
                                                        {data.isActual ? "Earned Revenue" : "Estimated Income"}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.isActual ? "#7c3aed" : "transparent"}
                                            stroke="#7c3aed"
                                            strokeWidth={entry.isActual ? 0 : 2}
                                            strokeDasharray={entry.isProjection ? "5 5" : "0"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentBookings.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">No new bookings.</div>
                            ) : (
                                recentBookings.map((b) => (
                                    <div key={b.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-violet-100 transition-all group">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="space-y-1">
                                                <p className="font-bold group-hover:text-violet-600 transition-colors">{b.space.name}</p>
                                                <p className="text-xs text-gray-500 font-medium">{new Date(b.startTime).toLocaleDateString('en-GB')}</p>
                                            </div>
                                            <div className="text-lg font-black text-gray-900 dark:text-white">+{b.totalPrice.toLocaleString()} CZK</div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-2">
                                                {b.cleaningLog?.cleanerId ? (
                                                    <UserCheck className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border-2 border-dashed border-gray-300" />
                                                )}
                                                <span className="text-xs font-bold text-gray-600">Cleaning Service</span>
                                            </div>

                                            {b.cleaningLog ? (
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${b.cleaningLog.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                                                            b.cleaningLog.cleanerId ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {b.cleaningLog.status === 'ACCEPTED' ? "Accepted" : b.cleaningLog.cleanerId ? "Assigned" : "Log Created"}
                                                    </span>
                                                    {b.cleaningLog.status !== 'ACCEPTED' && !b.cleaningLog.cleanerId && (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                className="h-7 text-[10px] bg-violet-600 hover:bg-violet-700"
                                                                onClick={() => handleHireCleanerClick(b.id)}
                                                            >
                                                                Select Cleaner
                                                            </Button>
                                                            <button
                                                                onClick={() => toggleCleaning(b.id, false)}
                                                                className="text-[10px] text-red-500 hover:underline font-bold"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-[10px] font-bold border-violet-200 text-violet-600 hover:bg-violet-50 rounded-lg"
                                                    onClick={() => toggleCleaning(b.id, true)}
                                                >
                                                    Hire Cleaner
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Cleaner Selection Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Select a Professional Cleaner</DialogTitle>
                        <DialogDescription>
                            Choose one of our verified partners to handle the cleaning of your space.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {cleaners.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No available cleaners found.</p>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {cleaners.map((cleaner) => (
                                    <div
                                        key={cleaner.id}
                                        onClick={() => selectedBookingId && toggleCleaning(selectedBookingId, true, cleaner.id)}
                                        className="flex items-center p-4 rounded-2xl border-2 border-transparent hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10 cursor-pointer transition-all bg-gray-50 dark:bg-gray-800"
                                    >
                                        <Avatar className="h-12 w-12 mr-4 border-2 border-white dark:border-gray-700 shadow-sm">
                                            <AvatarImage src={cleaner.image} />
                                            <AvatarFallback className="bg-violet-100 text-violet-700 font-bold">
                                                {cleaner.name?.[0] || 'C'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                                {cleaner.name}
                                                {cleaner.verified && <CheckCircle2 className="w-3 h-3 text-blue-500" />}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{cleaner.email}</p>
                                        </div>
                                        <Button size="sm" variant="ghost" className="text-violet-600 font-bold">Select</Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
