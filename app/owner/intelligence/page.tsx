"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"; // Changed to Area/Line
import { TrendingUp, Activity, BarChart3 } from "lucide-react";

export default function OwnerIntelligencePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/owner/intelligence")
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    if (loading) return <div className="p-8">Loading Intelligence...</div>;

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <Activity className="w-8 h-8 text-violet-600" />
                Owner Intelligence
            </h1>
            <p className="text-muted-foreground text-lg">AI-driven insights to optimize your weekend space listings.</p>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Utilization Card */}
                <Card className="border-t-4 border-t-blue-500 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Weekend Utilization</CardTitle>
                        <CardDescription>Current Month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900 dark:text-white">
                            {data.utilization}%
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">of available weekend slots booked</p>
                    </CardContent>
                </Card>

                {/* Forecast Card */}
                <Card className="border-t-4 border-t-green-500 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Revenue Forecast</CardTitle>
                        <CardDescription>Next Month Projection</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900 dark:text-white">
                            {data.forecast.toLocaleString()} CZK
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-green-600 font-medium text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span>+10% predicted growth</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Spaces */}
                <Card className="border-t-4 border-t-purple-500 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Spaces</CardTitle>
                        <CardDescription>Contributing to revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900 dark:text-white">
                            {data.spacesCount}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">spaces listed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart */}
            <Card className="col-span-4 shadow-md">
                <CardHeader>
                    <CardTitle>Revenue Trend & Forecast</CardTitle>
                    <CardDescription>Historical performance vs AI prediction</CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.history}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} CZK`} />
                                <Tooltip />
                                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
