"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    LogOut,
    Menu,
    BarChart3,
    DollarSign,
    Activity,
    Building2,
    Calendar,
    UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { t } = useLanguage();

    if (status === "loading") return <div className="flex py-16 items-center justify-center font-bold text-[#008080]">{t("admin.loading")}</div>;

    const navigation = [
        { name: t("admin.nav.graphsCommand"), href: "/admin/dashboard", icon: BarChart3 },
        { name: t("admin.nav.userProfiles"), href: "/admin/dashboard#profiles", icon: Users },
        { name: t("admin.nav.ownerEarnings"), href: "/owner/dashboard/earnings", icon: DollarSign },
        { name: t("admin.nav.ownerIntelligence"), href: "/owner/intelligence", icon: Activity },
        { name: t("admin.nav.allSpaces"), href: "/owner/dashboard/listings", icon: Building2 },
        { name: t("admin.nav.ownerBookings"), href: "/owner/dashboard/bookings", icon: Calendar },
        { name: t("admin.nav.renterDashboard"), href: "/dashboard", icon: LayoutDashboard },
        { name: t("admin.nav.verificationQueue"), href: "/admin/verification", icon: UserCheck },
    ];

    const Sidebar = () => (
        <div className="flex h-full flex-col bg-white dark:bg-gray-900 border-r dark:border-gray-800">
            <div className="flex h-16 items-center justify-between px-6 border-b dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-[#008080]" />
                    <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#008080] to-violet-600">
                        MyGenie Admin
                    </span>
                </div>
            </div>
            <div className="px-4 pt-3">
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] font-bold text-amber-900">
                    {t("admin.superAdminBanner")}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                                    isActive
                                        ? "bg-[#E6F4F4] text-[#006F6F] dark:bg-teal-900/20 dark:text-teal-300"
                                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 ${
                                        isActive ? "text-[#008080]" : "text-gray-400"
                                    }`}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t dark:border-gray-800 p-4">
                <div className="flex items-center mb-4 px-2">
                    <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback className="bg-[#008080] text-white font-bold">
                            {session?.user?.name?.[0] || "A"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate">{session?.user?.name || "MyGenie Super Admin"}</p>
                        <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("nav.signOut")}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-black">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-40">
                <Sidebar />
            </div>

            {/* Mobile Sidebar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 h-16 flex items-center justify-between">
                <span className="font-bold text-[#008080]">MyGenie Admin</span>
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <Sidebar />
                    </SheetContent>
                </Sheet>
            </div>

            <main className="flex-1 md:ml-64 flex flex-col pt-16 md:pt-0 min-w-0">
                <div className="flex-1 p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
