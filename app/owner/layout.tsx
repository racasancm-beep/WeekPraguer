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
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-10 hidden md:block">
                <div className="flex flex-col h-full">
                    <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            MyGenie
                        </span>
                        <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {isAdmin ? "Admin → Owner" : t("owner.roleBadge")}
                        </span>
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

                    <div className="flex-1 py-6 px-4 space-y-1">
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

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-4 px-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {session.user?.name?.[0] || "O"}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                                    {session.user?.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                    {session.user?.email}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        >
                            <LogOut className="mr-3 h-4 w-4" />
                            {t("nav.signOut")}
                        </Button>
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
