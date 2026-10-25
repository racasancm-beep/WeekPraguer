"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Building2, Calendar, LogOut, DollarSign, Activity, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

export default function OwnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useLanguage();
    const role = (session?.user as any)?.role;
    const isAdmin = role === "ADMIN";

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && role !== "OWNER" && role !== "ADMIN") {
            router.push("/dashboard");
        }
    }, [status, role, router]);

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center">{t("common.loading")}</div>;
    }

    if (!session || (role !== "OWNER" && role !== "ADMIN")) {
        return null;
    }

    const navigation = [
        { name: t("owner.nav.earningsGraphs"), href: "/owner/dashboard/earnings", icon: DollarSign },
        { name: t("owner.nav.aiIntelligence"), href: "/owner/intelligence", icon: Activity },
        { name: t("owner.nav.myListings"), href: "/owner/dashboard/listings", icon: Building2 },
        { name: t("owner.nav.bookings"), href: "/owner/dashboard/bookings", icon: Calendar },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar positioned cleanly below MainNav */}
            <div className="fixed top-[116px] bottom-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 hidden md:block">
                <div className="flex flex-col h-full">
                    {/* Top-Left User Profile + Type + Log Out */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40">
                        <div className="flex items-center mb-3 px-1">
                            <div className="h-9 w-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold shrink-0">
                                {(session.user?.name?.[0] || session.user?.email?.[0] || "O").toUpperCase()}
                            </div>
                            <div className="ml-3 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-[110px]">
                                        {session.user?.name || session.user?.email?.split("@")[0]}
                                    </p>
                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                                        {isAdmin ? "Admin → Owner" : t("owner.roleBadge")}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate max-w-[160px]">
                                    {session.user?.email}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-white rounded-xl font-semibold text-xs"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        >
                            <LogOut className="mr-2.5 h-4 w-4 text-red-600" />
                            {t("nav.signOut")}
                        </Button>
                    </div>

                    {isAdmin && (
                        <div className="p-3 bg-amber-50 border-b border-amber-200">
                            <Link href="/admin/dashboard">
                                <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs">
                                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                                    {t("owner.backToAdminHub")}
                                </Button>
                            </Link>
                        </div>
                    )}

                    <div className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                        isActive
                                            ? "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300 font-bold"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-violet-600" : "text-gray-400"}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="md:ml-64 min-h-screen flex flex-col">
                <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 md:hidden">
                    <span className="text-lg font-bold">{t("owner.dashboardTitle")}</span>
                    {isAdmin && (
                        <Link href="/admin/dashboard">
                            <Button size="sm" variant="outline" className="text-xs font-bold">
                                {t("owner.backToAdminHub")}
                            </Button>
                        </Link>
                    )}
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
