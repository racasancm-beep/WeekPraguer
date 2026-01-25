"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, CalendarCheck, DollarSign, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AdminStats {
    totalUsers: number;
    usersByRole: { role: string; _count: number }[];
    totalSpaces: number;
    totalBookings: number;
    totalRevenue: number;
    recentActivity: {
        type: string;
        title: string;
        detail: string;
        value: string;
        time: string;
    }[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/stats");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Activity className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading statistics...</span>
            </div>
        );
    }

    if (!stats) {
        return <div className="text-center p-8 text-red-500">Error loading data. Please try again.</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
                <p className="text-muted-foreground">Platform-wide statistics and management.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-violet-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                        <div className="flex gap-2 mt-1">
                            {stats.usersByRole.map(r => (
                                <span key={r.role} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                                    {r.role}: {r._count}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Spaces</CardTitle>
                        <Home className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSpaces}</div>
                        <p className="text-xs text-muted-foreground">Currently published</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalBookings}</div>
                        <p className="text-xs text-muted-foreground">Total reservations</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} CZK</div>
                        <p className="text-xs text-muted-foreground">Confirmed & Completed</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats.recentActivity.length > 0 ? (
                                stats.recentActivity.map((activity, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-4 ${activity.type === 'booking' ? 'bg-blue-500' :
                                                activity.type === 'space' ? 'bg-emerald-500' : 'bg-violet-500'
                                            }`} />
                                        <div className="space-y-1 flex-1">
                                            <p className="text-sm font-medium leading-none">{activity.title}</p>
                                            <p className="text-sm text-muted-foreground">{activity.detail}</p>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <div className="text-sm font-medium">{activity.value}</div>
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No recent activity.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                    <CardHeader>
                        <CardTitle>Platform Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span>Server Status</span>
                                    <span className="font-bold text-green-600">Optimal</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[15%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span>Database Health</span>
                                    <span className="font-bold text-blue-600">Stable</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[8%]"></div>
                                </div>
                            </div>
                            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="text-[10px] p-2 bg-white dark:bg-gray-800 border rounded hover:bg-gray-50 transition-colors">Clear Cache</button>
                                    <button className="text-[10px] p-2 bg-white dark:bg-gray-800 border rounded hover:bg-gray-50 transition-colors">Backup DB</button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
