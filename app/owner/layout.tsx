"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Building2, Calendar, Settings, LogOut, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function OwnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && (session?.user as any)?.role !== "OWNER") {
            router.push("/dashboard"); // Redirect non-owners
        }
    }, [status, session, router]);

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!session || (session.user as any)?.role !== "OWNER") {
        return null;
    }

    const navigation = [
        { name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
        { name: "My Listings", href: "/owner/dashboard/listings", icon: Building2 },
        { name: "Bookings", href: "/owner/dashboard/bookings", icon: Calendar },
        { name: "Earnings", href: "/owner/dashboard/earnings", icon: DollarSign },
        { name: "Settings", href: "/owner/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-10 hidden md:block">
                <div className="flex flex-col h-full">
                    <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            Space Booker
                        </span>
                        <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            Owner
                        </span>
                    </div>

                    <div className="flex-1 py-6 px-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            const isInactive = ["Bookings", "Earnings", "Settings"].includes(item.name);
                            return (
                                <Link
                                    key={item.name}
                                    href={isInactive ? "#" : item.href}
                                    onClick={(e) => isInactive && e.preventDefault()}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : isInactive
                                            ? "text-gray-400 opacity-40 grayscale cursor-not-allowed"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                    title={isInactive ? "Coming Soon" : ""}
                                >
                                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-primary" : isInactive ? "text-gray-300" : "text-gray-400"}`} />
                                    {item.name}
                                    {isInactive && <span className="ml-auto text-[8px] uppercase tracking-tighter opacity-70">Soon</span>}
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
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="md:ml-64 min-h-screen flex flex-col">
                <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 md:hidden">
                    <span className="text-lg font-bold">Owner Dashboard</span>
                    {/* Mobile menu trigger would go here */}
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
