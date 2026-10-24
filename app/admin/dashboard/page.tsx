"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Home,
    DollarSign,
    Activity,
    TrendingUp,
    ShieldCheck,
    UserCircle,
    ExternalLink,
    Eye,
    Search,
    Building2,
    Calendar,
    BarChart3,
    CheckCircle2,
    X
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    LineChart,
    Line,
    AreaChart,
    Area,
    CartesianGrid
} from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfileSpace {
    id: string;
    name: string;
    city: string;
    hourlyRate: number;
    dailyRate: number;
    capacity: number;
    active: boolean;
}

interface ProfileBooking {
    id: string;
    spaceName: string;
    city: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: string;
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: "RENTER" | "OWNER" | "ADMIN";
    phone: string;
    companyName: string;
    billingAddress: string;
    verified: boolean;
    subscriptionTier: string;
    createdAt: string;
    spacesCount: number;
    bookingsCount: number;
    totalRenterSpend: number;
    totalOwnerEarned: number;
    ownedSpaces: ProfileSpace[];
    recentBookings: ProfileBooking[];
}

interface AdminData {
    users: {
        renters: UserProfile[];
        owners: UserProfile[];
        admins: UserProfile[];
        all: UserProfile[];
    };
    totalSpaces: number;
    totalBookings: number;
    totalRevenue: number;
    globalFinancials: {
        totalRenterSpend: number;
        totalOwnerYield: number;
        totalAdminShare: number;
    };
    activityTrend: {
        month: string;
        booked: number;
        available: number;
        renterRevenue: number;
        ownerRevenue: number;
        adminRevenue: number;
    }[];
}

export default function AdminDashboard() {
    const [data, setData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

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

    if (loading) {
        return (
            <div className="p-8 py-12 flex items-center justify-center font-bold text-lg text-[#008080]">
                <Activity className="animate-spin mr-2 text-[#008080]" /> Loading Admin Super Control Center...
            </div>
        );
    }
    if (!data) {
        return (
            <div className="p-8 py-12 text-center space-y-4">
                <p className="text-lg font-bold text-red-600">Failed to load system state.</p>
                <Button onClick={() => { setLoading(true); fetchStats(); }} className="bg-[#008080] hover:bg-[#006666] text-white font-bold">
                    Retry Loading Admin Data
                </Button>
            </div>
        );
    }

    const filterUser = (u: UserProfile) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.id?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
        );
    };

    const filteredRenters = data.users.renters.filter(filterUser);
    const filteredOwners = data.users.owners.filter(filterUser);
    const filteredAdmins = (data.users.admins || []).filter(filterUser);

    return (
        <div className="p-6 lg:p-8 space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            {/* Top Header */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-3 border border-amber-300">
                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                        SUPER ADMIN PROFILE • UNRESTRICTED ACCESS
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-gray-900 dark:text-white">
                        MyGenie System Intelligence
                    </h1>
                    <p className="text-base lg:text-lg text-muted-foreground mt-1">
                        Complete access to all platform graphs, Owner &amp; Renter dashboards, and every user profile
                    </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                    <Card className="bg-blue-50 border-blue-100 p-4">
                        <p className="text-[10px] font-bold text-blue-600 uppercase">Total Renter Spend</p>
                        <p className="text-xl font-black text-blue-900">{data.globalFinancials.totalRenterSpend.toLocaleString()} RON</p>
                    </Card>
                    <Card className="bg-violet-50 border-violet-100 p-4">
                        <p className="text-[10px] font-bold text-violet-600 uppercase">Owner Yield (60%)</p>
                        <p className="text-xl font-black text-violet-900">{data.globalFinancials.totalOwnerYield.toLocaleString()} RON</p>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100 p-4">
                        <p className="text-[10px] font-bold text-amber-600 uppercase">Admin Share (25%)</p>
                        <p className="text-xl font-black text-amber-900">{data.globalFinancials.totalAdminShare.toLocaleString()} RON</p>
                    </Card>
                    <Card className="bg-emerald-50 border-emerald-100 p-4">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Active Spaces</p>
                        <p className="text-xl font-black text-emerald-900">{data.totalSpaces} Spaces</p>
                    </Card>
                </div>
            </header>

            {/* Quick Access to All Platform Dashboards */}
            <section className="space-y-3">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">
                    All Platform Dashboards (1-Click Admin Access)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Link href="/owner/dashboard/earnings">
                        <Card className="p-4 hover:border-violet-500 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-violet-600">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-violet-600 uppercase">Owner Dashboard</p>
                                    <p className="text-base font-black text-gray-900 mt-0.5">Earnings &amp; Graphs</p>
                                </div>
                                <DollarSign className="w-6 h-6 text-violet-600" />
                            </div>
                        </Card>
                    </Link>

                    <Link href="/owner/intelligence">
                        <Card className="p-4 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-indigo-600">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-indigo-600 uppercase">AI Forecast</p>
                                    <p className="text-base font-black text-gray-900 mt-0.5">Owner Intelligence</p>
                                </div>
                                <BarChart3 className="w-6 h-6 text-indigo-600" />
                            </div>
                        </Card>
                    </Link>

                    <Link href="/owner/dashboard/listings">
                        <Card className="p-4 hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-[#008080]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-[#008080] uppercase">All Spaces ({data.totalSpaces})</p>
                                    <p className="text-base font-black text-gray-900 mt-0.5">Listings Manager</p>
                                </div>
                                <Building2 className="w-6 h-6 text-[#008080]" />
                            </div>
                        </Card>
                    </Link>

                    <Link href="/owner/dashboard/bookings">
                        <Card className="p-4 hover:border-amber-500 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-amber-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-amber-600 uppercase">Host Reservations</p>
                                    <p className="text-base font-black text-gray-900 mt-0.5">Owner Bookings</p>
                                </div>
                                <Calendar className="w-6 h-6 text-amber-600" />
                            </div>
                        </Card>
                    </Link>

                    <Link href="/dashboard">
                        <Card className="p-4 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-600">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-blue-600 uppercase">Renter Portal</p>
                                    <p className="text-base font-black text-gray-900 mt-0.5">Renter Bookings</p>
                                </div>
                                <UserCircle className="w-6 h-6 text-blue-600" />
                            </div>
                        </Card>
                    </Link>
                </div>
            </section>

            {/* All Profiles Directory & Inspector */}
            <section id="profiles" className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">
                            All User Profiles ({data.users.all?.length || (data.users.renters.length + data.users.owners.length)})
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Click <strong>Inspect Profile</strong> to view any user&apos;s full profile &amp; activity, or <strong>Open Dashboard</strong> to view their personal dashboard &amp; graphs.
                        </p>
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Search name, email, role, ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white"
                        />
                    </div>
                </div>

                {/* Selected Profile Inspector Drawer / Card */}
                {selectedProfile && (
                    <Card className="border-2 border-[#008080] shadow-2xl bg-gradient-to-br from-white to-teal-50/30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <CardHeader className="bg-[#008080] text-white flex flex-row items-center justify-between py-4 px-6">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-11 w-11 border-2 border-white">
                                    <AvatarFallback className="bg-white text-[#008080] font-black">
                                        {selectedProfile.name?.[0] || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-xl font-black text-white">
                                            {selectedProfile.name}
                                        </CardTitle>
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-gray-950">
                                            {selectedProfile.role}
                                        </span>
                                        {selectedProfile.verified && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-400/20 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300/40">
                                                <CheckCircle2 className="w-3 h-3" /> Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-teal-100 font-mono">{selectedProfile.email} • ID: {selectedProfile.id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedProfile.role === "OWNER" && (
                                    <Link href={`/owner/dashboard/earnings?userId=${selectedProfile.id}`}>
                                        <Button size="sm" className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-black">
                                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                            Open Owner Dashboard &amp; Graphs
                                        </Button>
                                    </Link>
                                )}
                                {selectedProfile.role === "RENTER" && (
                                    <Link href={`/dashboard?userId=${selectedProfile.id}`}>
                                        <Button size="sm" className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-black">
                                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                            Open Renter Dashboard
                                        </Button>
                                    </Link>
                                )}
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setSelectedProfile(null)}
                                    className="text-white hover:bg-white/20"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                <div className="p-3 rounded-xl bg-white border">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Role</p>
                                    <p className="text-sm font-black text-gray-900">{selectedProfile.role}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white border">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Subscription</p>
                                    <p className="text-sm font-black text-violet-700">{selectedProfile.subscriptionTier}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white border">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p>
                                    <p className="text-sm font-bold text-gray-800">{selectedProfile.phone}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white border">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Spaces Listed</p>
                                    <p className="text-sm font-black text-[#008080]">{selectedProfile.spacesCount}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white border">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Bookings Count</p>
                                    <p className="text-sm font-black text-blue-600">{selectedProfile.bookingsCount}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white border">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                                        {selectedProfile.role === "OWNER" ? "Owner Yield" : "Total Spend"}
                                    </p>
                                    <p className="text-sm font-black text-emerald-700">
                                        {selectedProfile.role === "OWNER"
                                            ? `${selectedProfile.totalOwnerEarned.toLocaleString()} RON`
                                            : `${selectedProfile.totalRenterSpend.toLocaleString()} RON`}
                                    </p>
                                </div>
                            </div>

                            {selectedProfile.ownedSpaces.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                                        Owned Spaces ({selectedProfile.ownedSpaces.length})
                                    </h4>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {selectedProfile.ownedSpaces.map((sp) => (
                                            <Link key={sp.id} href={`/spaces/${sp.id}`}>
                                                <div className="p-3 rounded-xl bg-white border hover:border-[#008080] transition-colors flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">{sp.name}</p>
                                                        <p className="text-[10px] text-gray-500">{sp.city} • {sp.capacity} ppl</p>
                                                    </div>
                                                    <span className="text-xs font-black text-[#008080]">{sp.hourlyRate} RON/hr</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedProfile.recentBookings.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                                        Recent Bookings ({selectedProfile.recentBookings.length})
                                    </h4>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {selectedProfile.recentBookings.map((bk) => (
                                            <div key={bk.id} className="p-3 rounded-xl bg-white border flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900">{bk.spaceName}</p>
                                                    <p className="text-[10px] text-gray-500">
                                                        {new Date(bk.startTime).toLocaleDateString()} • {bk.status}
                                                    </p>
                                                </div>
                                                <span className="text-xs font-black text-blue-600">{bk.totalPrice} RON</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* 3 Columns: Renters, Owners, Admins */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Renters */}
                    <Card className="border-none shadow-xl border-t-4 border-t-blue-500 overflow-hidden">
                        <CardHeader className="bg-blue-50/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl font-black text-blue-900">Renters</CardTitle>
                                    <CardDescription className="font-bold text-blue-600">
                                        {filteredRenters.length} Profiles
                                    </CardDescription>
                                </div>
                                <UserCircle className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[380px] overflow-y-auto divide-y">
                                {filteredRenters.map((u) => (
                                    <div key={u.id} className="p-4 hover:bg-blue-50/30 flex items-center justify-between gap-2 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                                                    {u.name?.[0] || "R"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-900 truncate">{u.name}</p>
                                                <p className="text-[11px] text-gray-500 truncate">{u.email}</p>
                                                <p className="text-[10px] text-blue-600 font-semibold">
                                                    {u.bookingsCount} bookings • {u.totalRenterSpend.toLocaleString()} RON
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setSelectedProfile(u)}
                                                className="h-8 px-2.5 text-[11px] font-bold"
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                                Profile
                                            </Button>
                                            <Link href={`/dashboard?userId=${u.id}`}>
                                                <Button size="sm" className="h-8 px-2.5 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Button>
                                            </Link>
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
                                    <CardDescription className="font-bold text-violet-600">
                                        {filteredOwners.length} Profiles
                                    </CardDescription>
                                </div>
                                <Home className="w-8 h-8 text-violet-500" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[380px] overflow-y-auto divide-y">
                                {filteredOwners.map((u) => (
                                    <div key={u.id} className="p-4 hover:bg-violet-50/30 flex items-center justify-between gap-2 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
                                                    {u.name?.[0] || "O"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-900 truncate">{u.name}</p>
                                                <p className="text-[11px] text-gray-500 truncate">{u.email}</p>
                                                <p className="text-[10px] text-violet-600 font-semibold">
                                                    {u.spacesCount} spaces • {u.totalOwnerEarned.toLocaleString()} RON yield
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setSelectedProfile(u)}
                                                className="h-8 px-2.5 text-[11px] font-bold"
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                                Profile
                                            </Button>
                                            <Link href={`/owner/dashboard/earnings?userId=${u.id}`}>
                                                <Button size="sm" className="h-8 px-2.5 text-[11px] font-bold bg-violet-600 hover:bg-violet-700 text-white">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admins */}
                    <Card className="border-none shadow-xl border-t-4 border-t-amber-500 overflow-hidden">
                        <CardHeader className="bg-amber-50/60">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl font-black text-amber-900">Admins</CardTitle>
                                    <CardDescription className="font-bold text-amber-700">
                                        {filteredAdmins.length} Super Profiles
                                    </CardDescription>
                                </div>
                                <ShieldCheck className="w-8 h-8 text-amber-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[380px] overflow-y-auto divide-y">
                                {filteredAdmins.map((u) => (
                                    <div key={u.id} className="p-4 hover:bg-amber-50/30 flex items-center justify-between gap-2 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-amber-100 text-amber-800 text-xs font-bold">
                                                    {u.name?.[0] || "A"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-900 truncate">{u.name}</p>
                                                <p className="text-[11px] text-gray-500 truncate">{u.email}</p>
                                                <p className="text-[10px] text-amber-700 font-semibold">
                                                    Full System Access
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedProfile(u)}
                                            className="h-8 px-2.5 text-[11px] font-bold"
                                        >
                                            <Eye className="w-3.5 h-3.5 mr-1" />
                                            Profile
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* GRAPH 1: Platform Utilization (Hours Based) */}
            <Card className="border-none shadow-2xl p-6 bg-white dark:bg-gray-950">
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-3xl font-black">1. Platform Hours Utilization Graph</CardTitle>
                        <CardDescription>Total Available Hours vs Booked Hours across all spaces (18-Month View)</CardDescription>
                    </div>
                    <div className="flex gap-8">
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-gray-400">Total Portfolio Capacity</p>
                            <p className="text-2xl font-black">{data.activityTrend[0]?.available?.toLocaleString()} <span className="text-xs text-gray-400">Hours/mo</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-blue-500">Total Booked Sessions</p>
                            <p className="text-2xl font-black text-blue-600">{data.totalBookings} <span className="text-xs text-blue-400">Bookings</span></p>
                        </div>
                    </div>
                </div>
                <div className="h-[420px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.activityTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                                cursor={{ fill: "#f8fafc" }}
                            />
                            <Legend verticalAlign="top" align="center" iconType="circle" wrapperStyle={{ paddingBottom: "24px" }} />
                            <Bar dataKey="available" name="Available Portfolio (Hours)" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={22} />
                            <Bar dataKey="booked" name="Booked Action (Hours)" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={22} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* GRAPH 2: Combined Revenue Distribution Graph */}
            <Card className="border-none shadow-2xl p-6 bg-white dark:bg-gray-950">
                <div className="mb-6">
                    <CardTitle className="text-3xl font-black">2. Complete Financial Revenue Distribution Graph</CardTitle>
                    <CardDescription>Monthly comparison of Renter Spend (100%), Owner Yield (60–70%), and Admin Share (25–30%)</CardDescription>
                </div>
                <div className="h-[380px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.activityTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} RON`} />
                            <Tooltip
                                contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                            />
                            <Legend verticalAlign="top" align="center" iconType="circle" wrapperStyle={{ paddingBottom: "24px" }} />
                            <Bar dataKey="renterRevenue" name="Renter Spend (RON)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="ownerRevenue" name="Owner Yield (RON)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="adminRevenue" name="Admin Share (RON)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* GRAPHS 3, 4, 5: Individual Role Analytics */}
            <div className="space-y-6">
                <h2 className="text-3xl font-black italic border-l-8 border-[#008080] pl-4 uppercase tracking-tighter">
                    3. Role-Specific Financial Graphs (Renter • Owner • Admin)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Renter Insights */}
                    <Card className="p-6 border-none shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-100 rounded-2xl"><DollarSign className="w-6 h-6 text-blue-600" /></div>
                            <div>
                                <h3 className="font-bold">Renter Flow Graph</h3>
                                <p className="text-[10px] text-gray-500">Monthly Spending Activity (Past + Future)</p>
                            </div>
                        </div>
                        <div className="h-[170px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.activityTrend}>
                                    <Tooltip />
                                    <Line type="monotone" dataKey="renterRevenue" name="Renter Spend" stroke="#3b82f6" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-end">
                            <span className="text-xs font-bold text-gray-400 uppercase">Total Spend</span>
                            <span className="text-2xl font-black text-blue-600">{data.globalFinancials.totalRenterSpend.toLocaleString()} <span className="text-xs text-gray-400">RON</span></span>
                        </div>
                    </Card>

                    {/* Owner Insights */}
                    <Card className="p-6 border-none shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-violet-100 rounded-2xl"><TrendingUp className="w-6 h-6 text-violet-600" /></div>
                            <div>
                                <h3 className="font-bold">Owner Yield Graph</h3>
                                <p className="text-[10px] text-gray-500">60–70% Revenue Share Generation</p>
                            </div>
                        </div>
                        <div className="h-[170px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.activityTrend}>
                                    <Tooltip />
                                    <Line type="monotone" dataKey="ownerRevenue" name="Owner Yield" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-end">
                            <span className="text-xs font-bold text-gray-400 uppercase">Total Yield</span>
                            <span className="text-2xl font-black text-violet-600">{data.globalFinancials.totalOwnerYield.toLocaleString()} <span className="text-xs text-gray-400">RON</span></span>
                        </div>
                    </Card>

                    {/* Admin Share Insights */}
                    <Card className="p-6 border-none shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-amber-100 rounded-2xl"><ShieldCheck className="w-6 h-6 text-amber-600" /></div>
                            <div>
                                <h3 className="font-bold">Admin Commission Graph</h3>
                                <p className="text-[10px] text-gray-500">25–30% Platform Share Revenue</p>
                            </div>
                        </div>
                        <div className="h-[170px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.activityTrend}>
                                    <Tooltip />
                                    <Area type="monotone" dataKey="adminRevenue" name="Admin Share" stroke="#f59e0b" fill="#fef3c7" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-end">
                            <span className="text-xs font-bold text-gray-400 uppercase">Total Admin Share</span>
                            <span className="text-2xl font-black text-amber-600">{data.globalFinancials.totalAdminShare.toLocaleString()} <span className="text-xs text-gray-400">RON</span></span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
