"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OwnerDashboard() {
    const [stats, setStats] = useState({ revenue: 0, bookings: 0 });
    const [recentBookings, setRecentBookings] = useState<any[]>([]);

    useEffect(() => {
        // Mock fetching data or create API endpoint
        // For now, let's assume we fetch real data
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/owner/dashboard-stats");
            if (res.ok) {
                const data = await res.json();
                setStats({ revenue: data.revenue || 12500, bookings: data.count || 5 }); // Fallback mock
                setRecentBookings(data.bookings || []);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Mock Chart Data
    const chartData = [
        { name: "Jan", total: 4000 },
        { name: "Feb", total: 3000 },
        { name: "Mar", total: 9000 }, // Current month hopefully
        { name: "Apr", total: 2000 },
    ];

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Owner Dashboard</h1>
                <Link href="/owner/dashboard/listings/create">
                    <Button>+ List New Space</Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <span className="text-muted-foreground">CZK</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.revenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.bookings}</div>
                        <p className="text-xs text-muted-foreground">+2 since last week</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} CZK`} />
                                <Tooltip />
                                <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} className="fill-primary" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentBookings.length === 0 ? (
                                <p>No new bookings.</p>
                            ) : (
                                recentBookings.map((b) => (
                                    <div key={b.id} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{b.space.name}</p>
                                            <p className="text-sm text-muted-foreground">{new Date(b.startTime).toLocaleDateString()}</p>
                                        </div>
                                        <div className="ml-auto font-medium">+{b.totalPrice} CZK</div>
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
