"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Home, CalendarCheck, DollarSign, Activity, TrendingUp, ShieldCheck, Sparkles, UserCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserItem {
    id: string;
    name: string;
    email: string;
}

interface AdminData {
    users: {
        renters: UserItem[];
        owners: UserItem[];
        cleaners: UserItem[];
    };
    totalSpaces: number;
    activeSpacesCount: number;
    totalBookings: number;
    totalRevenue: number;
    activityTrend: { month: string; booked: number; available: number }[];
    userAnalytics: {
        renter: { totalCount: number; monthlyActivity: { month: string; value: number }[] };
        owner: { totalCount: number; monthlyActivity: { month: string; value: number }[] };
        cleaner: { totalCount: number; monthlyActivity: { month: string; value: number }[] };
    };
}

export default function AdminDashboard() {
    const [data, setData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            if (res.ok) {
                const d = await res.json();
                setData(d);
            }
        } catch (error) {
            console.error("Failed to fetch admin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 flex items-center justify-center min-h-screen"><Activity className="animate-spin mr-2" /> Loading Admin Panel...</div>;
    if (!data) return <div className="p-8 text-center">Failed to load system state.</div>;

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter">System Intelligence</h1>
                    <p className="text-xl text-muted-foreground mt-2">Platform monitoring & user distribution</p>
                </div>
                <div className="flex gap-4">
                    <Card className="bg-emerald-50 border-emerald-100 p-4">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">System Status</p>
                        <p className="text-xl font-bold text-emerald-900">Operational</p>
                    </Card>
                </div>
            </header>

            {/* 3 Columns: User Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Renters */}
                <Card className="border-none shadow-xl border-t-4 border-t-blue-500 overflow-hidden">
                    <CardHeader className="bg-blue-50/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl font-black text-blue-900">Renters</CardTitle>
                                <CardDescription className="font-bold text-blue-600">{data.users.renters.length} Accounts</CardDescription>
                            </div>
                            <UserCircle className="w-8 h-8 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[300px] overflow-y-auto">
                            {data.users.renters.map(u => (
                                <div key={u.id} className="p-4 border-b last:border-0 hover:bg-gray-50 flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px] font-bold">{u.name?.[0] || 'R'}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold truncate">{u.name || 'Anonymous'}</p>
                                        <p className="text-[10px] text-gray-400 truncate font-mono uppercase">{u.id}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Owners */}
                <Card className="border-none shadow-xl border-t-4 border-t-violet-500 overflow-hidden">
                    <CardHeader className="bg-violet-50/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl font-black text-violet-900">Owners</CardTitle>
                                <CardDescription className="font-bold text-violet-600">{data.users.owners.length} Accounts</CardDescription>
                            </div>
                            <Home className="w-8 h-8 text-violet-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[300px] overflow-y-auto">
                            {data.users.owners.map(u => (
                                <div key={u.id} className="p-4 border-b last:border-0 hover:bg-gray-50 flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-violet-100 text-violet-600 text-[10px] font-bold">{u.name?.[0] || 'O'}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold truncate">{u.name || 'Anonymous'}</p>
                                        <p className="text-[10px] text-gray-400 truncate font-mono uppercase">{u.id}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Cleaners */}
                <Card className="border-none shadow-xl border-t-4 border-t-emerald-500 overflow-hidden">
                    <CardHeader className="bg-emerald-50/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl font-black text-emerald-900">Cleaners</CardTitle>
                                <CardDescription className="font-bold text-emerald-600">{data.users.cleaners.length} Accounts</CardDescription>
                            </div>
                            <Sparkles className="w-8 h-8 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[300px] overflow-y-auto">
                            {data.users.cleaners.map(u => (
                                <div key={u.id} className="p-4 border-b last:border-0 hover:bg-gray-50 flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-emerald-100 text-emerald-600 text-[10px] font-bold">{u.name?.[0] || 'C'}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold truncate">{u.name || 'Anonymous'}</p>
                                        <p className="text-[10px] text-gray-400 truncate font-mono uppercase">{u.id}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Booked vs Available Chart */}
            <Card className="border-none shadow-2xl p-6 bg-white dark:bg-gray-950">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <CardTitle className="text-3xl font-black">Platform Utilization</CardTitle>
                        <CardDescription>Booked Spaces vs Total Portfolio Capacity</CardDescription>
                    </div>
                    <div className="flex gap-8">
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-gray-400">Total Spaces</p>
                            <p className="text-2xl font-black">{data.totalSpaces}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-blue-500">Total Bookings</p>
                            <p className="text-2xl font-black text-blue-600">{data.totalBookings}</p>
                        </div>
                    </div>
                </div>
                <div className="h-[450px] w-full overflow-x-auto pb-4 custom-scrollbar">
                    <div className="min-w-[1200px] h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.activityTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 600 }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                    formatter={(value: any, name: string) => [value, name]}
                                />
                                <Legend verticalAlign="top" align="center" iconType="circle" wrapperStyle={{ paddingBottom: '30px' }} />
                                <Bar dataKey="available" name="Total Portfolio" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={24} />
                                <Bar dataKey="booked" name="Confirmed Bookings" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>

            {/* Detailed User Type Section: Activity & Earnings */}
            <div className="space-y-6">
                <h2 className="text-3xl font-black italic border-l-8 border-violet-600 pl-4 uppercase tracking-tighter">Role Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Renter Insights */}
                    <Card className="p-6 border-none shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-100 rounded-2xl"><DollarSign className="w-6 h-6 text-blue-600" /></div>
                            <div>
                                <h3 className="font-bold">Renter Flow</h3>
                                <p className="text-[10px] text-gray-500">Monthly Spending Activity</p>
                            </div>
                        </div>
                        <div className="h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.userAnalytics.renter.monthlyActivity}>
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between">
                            <span className="text-sm font-bold text-gray-500">Total Spend</span>
                            <span className="text-lg font-black">{data.userAnalytics.renter.monthlyActivity.reduce((a, b) => a + b.value, 0).toLocaleString()} CZK</span>
                        </div>
                    </Card>

                    {/* Owner Insights */}
                    <Card className="p-6 border-none shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-violet-100 rounded-2xl"><TrendingUp className="w-6 h-6 text-violet-600" /></div>
                            <div>
                                <h3 className="font-bold">Owner Yield</h3>
                                <p className="text-[10px] text-gray-500">Revenue Generation Tracking</p>
                            </div>
                        </div>
                        <div className="h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.userAnalytics.owner.monthlyActivity}>
                                    <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between">
                            <span className="text-sm font-bold text-gray-500">Total Yield</span>
                            <span className="text-lg font-black">{data.userAnalytics.owner.monthlyActivity.reduce((a, b) => a + b.value, 0).toLocaleString()} CZK</span>
                        </div>
                    </Card>

                    {/* Cleaner Insights */}
                    <Card className="p-6 border-none shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-emerald-100 rounded-2xl"><ShieldCheck className="w-6 h-6 text-emerald-600" /></div>
                            <div>
                                <h3 className="font-bold">Cleaner Ops</h3>
                                <p className="text-[10px] text-gray-500">Completed Service Earnings</p>
                            </div>
                        </div>
                        <div className="h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.userAnalytics.cleaner.monthlyActivity}>
                                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between">
                            <span className="text-sm font-bold text-gray-500">Service Payout</span>
                            <span className="text-lg font-black">{data.userAnalytics.cleaner.monthlyActivity.reduce((a, b) => a + b.value, 0).toLocaleString()} CZK</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
