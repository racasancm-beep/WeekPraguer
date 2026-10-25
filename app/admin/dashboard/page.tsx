"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
    X,
    Clock,
    AlertTriangle
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
import { useLanguage } from "@/lib/i18n/language-context";

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

interface PendingOver24hItem {
    bookingId: string;
    spaceId: string;
    spaceName: string;
    city: string;
    address: string;
    ownerId: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    renterName: string;
    renterEmail: string;
    startTime: string;
    endTime: string;
    createdAt: string;
    requestedPeriod: string;
    hoursPending: number;
    chartLabel: string;
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
    pendingOver24h?: PendingOver24hItem[];
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
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    const [data, setData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
    const { t } = useLanguage();

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
                <Activity className="animate-spin mr-2 text-[#008080]" /> {t("admin.loadingCenter")}
            </div>
        );
    }
    if (!data) {
        return (
            <div className="p-8 py-12 text-center space-y-4">
                <p className="text-lg font-bold text-red-600">{t("admin.loadFailed")}</p>
                <Button onClick={() => { setLoading(true); fetchStats(); }} className="bg-[#008080] hover:bg-[#006666] text-white font-bold">
                    {t("admin.retry")}
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
                        {t("admin.badge")}
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-gray-900 dark:text-white">
                        {t("admin.title")}
                    </h1>
                    <p className="text-base lg:text-lg text-muted-foreground mt-1">
                        {t("admin.subtitle")}
                    </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                    <Card className="bg-blue-50 border-blue-100 p-4">
                        <p className="text-[10px] font-bold text-blue-600 uppercase">{t("admin.kpi.renterSpend")}</p>
                        <p className="text-xl font-black text-blue-900">{data.globalFinancials.totalRenterSpend.toLocaleString()} RON</p>
                    </Card>
                    <Card className="bg-violet-50 border-violet-100 p-4">
                        <p className="text-[10px] font-bold text-violet-600 uppercase">{t("admin.kpi.ownerYield")}</p>
                        <p className="text-xl font-black text-violet-900">{data.globalFinancials.totalOwnerYield.toLocaleString()} RON</p>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100 p-4">
                        <p className="text-[10px] font-bold text-amber-600 uppercase">{t("admin.kpi.adminShare")}</p>
                        <p className="text-xl font-black text-amber-900">{data.globalFinancials.totalAdminShare.toLocaleString()} RON</p>
                    </Card>
                    <Card className="bg-emerald-50 border-emerald-100 p-4">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">{t("admin.kpi.activeSpaces")}</p>
                        <p className="text-xl font-black text-emerald-900">{data.totalSpaces} {t("admin.spacesUnit")}</p>
                    </Card>
                </div>
            </header>

            {/* Quick Access to All Platform Dashboards */}
            <section className="space-y-3">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">
                    {t("admin.quickAccess")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Link href="/owner/dashboard/earnings">
                        <Card className="p-4 hover:border-violet-500 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-violet-600">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-violet-600 uppercase">{t("admin.card.ownerDashboard")}</p>
                                    <p className="text-base font-black text-gray-900 mt-0.5">{t("admin.card.earningsGraphs")}</p>
                                </div>
                                <DollarSign className="w-6 h-6 text-violet-600" />
                            </div>
                        </Card>
                    </Link>

                    <Link href="/owner/intelligence">
                        <Card className="p-4 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-indigo-600">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-indigo-600 uppercase">{t("admin.card.aiForecast")}</p>
                                    <p className="text-base font-black text-gray-900 mt-0.5">{t("admin.card.ownerIntelligence")}</p>
                                </div>
                                <BarChart3 className="w-6 h-6 text-indigo-600" />
                            </div>
                        </Card>
                    </Link>

                    <Link href="/owner/dashboard/listings">
                        <Card className="p-4 hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-[#008080]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-[#008080] uppercase">{t("admin.card.allSpaces")} ({data.totalSpaces})</p>
                                    <p className="text-base font-black text-gray-900 mt-0.5">{t("admin.card.listingsManager")}</p>
                                </div>
                                <Building2 className="w-6 h-6 text-[#008080]" />
                            </div>
                        </Card>
                    </Link>

                    <Link href="/owner/dashboard/bookings">
                        <Card className="p-4 hover:border-amber-500 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-amber-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-amber-600 uppercase">{t("admin.card.hostReservations")}</p>
                                    <p className="text-base font-black text-gray-900 mt-0.5">{t("admin.card.ownerBookings")}</p>
                                </div>
                                <Calendar className="w-6 h-6 text-amber-600" />
                            </div>
                        </Card>
                    </Link>

                    <Link href="/dashboard">
                        <Card className="p-4 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-600">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-blue-600 uppercase">{t("admin.card.renterPortal")}</p>
                                    <p className="text-base font-black text-gray-900 mt-0.5">{t("admin.card.renterBookings")}</p>
                                </div>
                                <UserCircle className="w-6 h-6 text-blue-600" />
                            </div>
                        </Card>
                    </Link>
                </div>
            </section>

            {/* ADMIN-ONLY: Spaces Pending Approval for More Than 24 Hours Graph & Details */}
            {isAdmin && (
                <Card className="border-2 border-red-200 shadow-2xl p-6 bg-white dark:bg-gray-950">
                    <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-black uppercase tracking-wider mb-2 border border-red-200">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                {t("admin.pending24.badge")}
                            </div>
                            <CardTitle className="text-2xl lg:text-3xl font-black text-gray-900">
                                {t("admin.pending24.title")} ({(data.pendingOver24h || []).length})
                            </CardTitle>
                            <CardDescription className="text-sm mt-1">
                                {t("admin.pending24.desc")}
                            </CardDescription>
                        </div>
                        <div className="px-4 py-2 rounded-2xl bg-red-50 border border-red-200 text-right">
                            <p className="text-[10px] uppercase font-bold text-red-600">{t("admin.pending24.countLabel")}</p>
                            <p className="text-2xl font-black text-red-700">
                                {(data.pendingOver24h || []).length} <span className="text-xs font-bold">{t("admin.bookingsLower")}</span>
                            </p>
                        </div>
                    </div>

                    {(data.pendingOver24h || []).length > 0 ? (
                        <div className="space-y-8">
                            {/* Bar Graph of Spaces Pending Approval > 24h */}
                            <div className="h-[340px] w-full bg-red-50/20 rounded-2xl p-4 border border-red-100">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={data.pendingOver24h}
                                        margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fee2e2" />
                                        <XAxis
                                            dataKey="chartLabel"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fontWeight: 700, fill: "#7f1d1d" }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fontWeight: 600 }}
                                            tickFormatter={(v) => `${v}h`}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (!active || !payload || !payload.length) return null;
                                                const item = payload[0].payload as PendingOver24hItem;
                                                return (
                                                    <div className="bg-white p-4 rounded-2xl shadow-2xl border border-red-200 space-y-2 text-xs max-w-xs">
                                                        <div className="font-black text-sm text-gray-900 flex items-center justify-between gap-2">
                                                            <span>{item.spaceName}</span>
                                                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black">
                                                                {item.hoursPending}h (&gt; 24h)
                                                            </span>
                                                        </div>
                                                        <div className="text-gray-600">
                                                            <span className="font-bold text-gray-800">{t("admin.pending24.ownerDetails")}:</span>{" "}
                                                            {item.ownerName} ({item.ownerEmail}
                                                            {item.ownerPhone && item.ownerPhone !== "—" ? ` • ${item.ownerPhone}` : ""})
                                                        </div>
                                                        <div className="text-red-700 font-semibold">
                                                            <span className="font-bold text-gray-800">{t("admin.pending24.periodPending")}:</span>{" "}
                                                            {item.requestedPeriod}
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        />
                                        <Legend verticalAlign="top" align="center" iconType="circle" wrapperStyle={{ paddingBottom: "16px" }} />
                                        <Bar
                                            dataKey="hoursPending"
                                            name={t("admin.pending24.legendHours")}
                                            fill="#dc2626"
                                            radius={[8, 8, 0, 0]}
                                            barSize={42}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Detailed Table/Cards displaying Space Name, Owner Details, and Period Pending for Approval */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(data.pendingOver24h || []).map((item) => (
                                    <div
                                        key={item.bookingId}
                                        className="p-4 rounded-2xl bg-red-50/40 border border-red-200 flex flex-col justify-between gap-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 block">
                                                    {t("admin.pending24.spaceName")}
                                                </span>
                                                <Link
                                                    href={`/spaces/${item.spaceId}`}
                                                    className="text-lg font-black text-gray-900 hover:text-[#008080] transition-colors inline-flex items-center gap-1.5"
                                                >
                                                    {item.spaceName}
                                                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                                </Link>
                                                <p className="text-xs text-gray-500">
                                                    {item.address ? `${item.address}, ` : ""}{item.city}
                                                </p>
                                            </div>
                                            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                                                <Clock className="w-3.5 h-3.5" />
                                                {item.hoursPending}h (&gt; 24h)
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-red-200/70 text-xs">
                                            <div className="p-2.5 rounded-xl bg-white border border-red-100">
                                                <span className="text-[10px] font-black uppercase text-gray-400 block mb-0.5">
                                                    {t("admin.pending24.ownerDetails")}
                                                </span>
                                                <p className="font-bold text-gray-900">{item.ownerName}</p>
                                                <p className="text-gray-600 font-mono text-[11px] truncate">{item.ownerEmail}</p>
                                                {item.ownerPhone && item.ownerPhone !== "—" && (
                                                    <p className="text-gray-500 text-[11px]">{item.ownerPhone}</p>
                                                )}
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-white border border-red-100">
                                                <span className="text-[10px] font-black uppercase text-gray-400 block mb-0.5">
                                                    {t("admin.pending24.periodPending")}
                                                </span>
                                                <p className="font-bold text-red-700">{item.requestedPeriod}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5">
                                                    {t("owner.bookings.requestedBy")}: <span className="font-semibold text-gray-800">{item.renterName}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center rounded-2xl bg-gray-50 border border-gray-200 text-gray-500 font-semibold">
                            {t("admin.pending24.empty")}
                        </div>
                    )}
                </Card>
            )}

            {/* All Profiles Directory & Inspector */}
            <section id="profiles" className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">
                            {t("admin.profilesTitle")} ({data.users.all?.length || (data.users.renters.length + data.users.owners.length)})
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t("admin.profilesDesc")}
                        </p>
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder={t("admin.searchPlaceholder")}
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
                                                <CheckCircle2 className="w-3 h-3" /> {t("admin.verified")}
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
                                            {t("admin.openOwnerDashboard")}
                                        </Button>
                                    </Link>
                                )}
                                {selectedProfile.role === "RENTER" && (
                                    <Link href={`/dashboard?userId=${selectedProfile.id}`}>
                                        <Button size="sm" className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-black">
                                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                            {t("admin.openRenterDashboard")}
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
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{t("admin.field.role")}</p>
                                    <p className="text-sm font-black text-gray-900">{selectedProfile.role}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white border">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{t("admin.field.subscription")}</p>
                                    <p className="text-sm font-black text-violet-700">{selectedProfile.subscriptionTier}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white border">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{t("admin.field.phone")}</p>
                                    <p className="text-sm font-bold text-gray-800">{selectedProfile.phone}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white border">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{t("admin.field.spacesListed")}</p>
                                    <p className="text-sm font-black text-[#008080]">{selectedProfile.spacesCount}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white border">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{t("admin.field.bookingsCount")}</p>
                                    <p className="text-sm font-black text-blue-600">{selectedProfile.bookingsCount}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white border">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                                        {selectedProfile.role === "OWNER" ? t("admin.field.ownerYield") : t("admin.field.totalSpend")}
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
                                        {t("admin.ownedSpaces")} ({selectedProfile.ownedSpaces.length})
                                    </h4>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {selectedProfile.ownedSpaces.map((sp) => (
                                            <Link key={sp.id} href={`/spaces/${sp.id}`}>
                                                <div className="p-3 rounded-xl bg-white border hover:border-[#008080] transition-colors flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">{sp.name}</p>
                                                        <p className="text-[10px] text-gray-500">{sp.city} • {sp.capacity} {t("explore.ppl")}</p>
                                                    </div>
                                                    <span className="text-xs font-black text-[#008080]">{sp.hourlyRate} RON/{t("explore.perHour")}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedProfile.recentBookings.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                                        {t("admin.recentBookings")} ({selectedProfile.recentBookings.length})
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
                                    <CardTitle className="text-2xl font-black text-blue-900">{t("admin.col.renters")}</CardTitle>
                                    <CardDescription className="font-bold text-blue-600">
                                        {filteredRenters.length} {t("admin.col.profiles")}
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
                                                    {u.bookingsCount} {t("admin.bookingsLower")} • {u.totalRenterSpend.toLocaleString()} RON
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
                                                {t("admin.profileBtn")}
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
                                    <CardTitle className="text-2xl font-black text-violet-900">{t("admin.col.owners")}</CardTitle>
                                    <CardDescription className="font-bold text-violet-600">
                                        {filteredOwners.length} {t("admin.col.profiles")}
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
                                                    {u.spacesCount} {t("admin.spacesLower")} • {u.totalOwnerEarned.toLocaleString()} RON {t("admin.yieldLower")}
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
                                                {t("admin.profileBtn")}
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
                                    <CardTitle className="text-2xl font-black text-amber-900">{t("admin.col.admins")}</CardTitle>
                                    <CardDescription className="font-bold text-amber-700">
                                        {filteredAdmins.length} {t("admin.col.superProfiles")}
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
                                                    {t("admin.fullSystemAccess")}
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
                                            {t("admin.profileBtn")}
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
                        <CardTitle className="text-3xl font-black">{t("admin.graph1.title")}</CardTitle>
                        <CardDescription>{t("admin.graph1.desc")}</CardDescription>
                    </div>
                    <div className="flex gap-8">
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-gray-400">{t("admin.graph1.capacity")}</p>
                            <p className="text-2xl font-black">{data.activityTrend[0]?.available?.toLocaleString()} <span className="text-xs text-gray-400">{t("admin.graph1.hoursMo")}</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-blue-500">{t("admin.graph1.bookedSessions")}</p>
                            <p className="text-2xl font-black text-blue-600">{data.totalBookings} <span className="text-xs text-blue-400">{t("admin.graph1.bookings")}</span></p>
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
                            <Bar dataKey="available" name={t("admin.graph1.legendAvailable")} fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={22} />
                            <Bar dataKey="booked" name={t("admin.graph1.legendBooked")} fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={22} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* GRAPH 2: Combined Revenue Distribution Graph */}
            <Card className="border-none shadow-2xl p-6 bg-white dark:bg-gray-950">
                <div className="mb-6">
                    <CardTitle className="text-3xl font-black">{t("admin.graph2.title")}</CardTitle>
                    <CardDescription>{t("admin.graph2.desc")}</CardDescription>
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
                            <Bar dataKey="renterRevenue" name={t("admin.graph2.legendRenter")} fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="ownerRevenue" name={t("admin.graph2.legendOwner")} fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="adminRevenue" name={t("admin.graph2.legendAdmin")} fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* GRAPHS 3, 4, 5: Individual Role Analytics */}
            <div className="space-y-6">
                <h2 className="text-3xl font-black italic border-l-8 border-[#008080] pl-4 uppercase tracking-tighter">
                    {t("admin.graph3.sectionTitle")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Renter Insights */}
                    <Card className="p-6 border-none shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-100 rounded-2xl"><DollarSign className="w-6 h-6 text-blue-600" /></div>
                            <div>
                                <h3 className="font-bold">{t("admin.graph3.renterFlow")}</h3>
                                <p className="text-[10px] text-gray-500">{t("admin.graph3.renterFlowSub")}</p>
                            </div>
                        </div>
                        <div className="h-[170px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.activityTrend}>
                                    <Tooltip />
                                    <Line type="monotone" dataKey="renterRevenue" name={t("admin.graph2.legendRenter")} stroke="#3b82f6" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-end">
                            <span className="text-xs font-bold text-gray-400 uppercase">{t("admin.field.totalSpend")}</span>
                            <span className="text-2xl font-black text-blue-600">{data.globalFinancials.totalRenterSpend.toLocaleString()} <span className="text-xs text-gray-400">RON</span></span>
                        </div>
                    </Card>

                    {/* Owner Insights */}
                    <Card className="p-6 border-none shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-violet-100 rounded-2xl"><TrendingUp className="w-6 h-6 text-violet-600" /></div>
                            <div>
                                <h3 className="font-bold">{t("admin.graph3.ownerYield")}</h3>
                                <p className="text-[10px] text-gray-500">{t("admin.graph3.ownerYieldSub")}</p>
                            </div>
                        </div>
                        <div className="h-[170px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.activityTrend}>
                                    <Tooltip />
                                    <Line type="monotone" dataKey="ownerRevenue" name={t("admin.graph2.legendOwner")} stroke="#8b5cf6" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-end">
                            <span className="text-xs font-bold text-gray-400 uppercase">{t("admin.graph3.totalYield")}</span>
                            <span className="text-2xl font-black text-violet-600">{data.globalFinancials.totalOwnerYield.toLocaleString()} <span className="text-xs text-gray-400">RON</span></span>
                        </div>
                    </Card>

                    {/* Admin Share Insights */}
                    <Card className="p-6 border-none shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-amber-100 rounded-2xl"><ShieldCheck className="w-6 h-6 text-amber-600" /></div>
                            <div>
                                <h3 className="font-bold">{t("admin.graph3.adminCommission")}</h3>
                                <p className="text-[10px] text-gray-500">{t("admin.graph3.adminCommissionSub")}</p>
                            </div>
                        </div>
                        <div className="h-[170px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.activityTrend}>
                                    <Tooltip />
                                    <Area type="monotone" dataKey="adminRevenue" name={t("admin.graph2.legendAdmin")} stroke="#f59e0b" fill="#fef3c7" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-end">
                            <span className="text-xs font-bold text-gray-400 uppercase">{t("admin.graph3.totalAdminShare")}</span>
                            <span className="text-2xl font-black text-amber-600">{data.globalFinancials.totalAdminShare.toLocaleString()} <span className="text-xs text-gray-400">RON</span></span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
