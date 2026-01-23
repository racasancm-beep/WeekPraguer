"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, Users, Shield, Settings, LogOut, Menu, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Auth/Role check
    if (status === "loading") return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!session || session?.user?.role !== "ADMIN") {
        // return <div>Access Denied</div>;
    }

    const navigation = [
        { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    const Sidebar = () => (
        <div className="flex h-full flex-col bg-white dark:bg-gray-900 border-r dark:border-gray-800">
            <div className="flex h-16 items-center px-6 border-b dark:border-gray-800">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
                    AdminPanel
                </span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 ${isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-400 group-hover:text-gray-500"
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
                        <AvatarFallback>{session?.user?.name?.[0] || "A"}</AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-black">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
                <Sidebar />
            </div>

            {/* Mobile Sidebar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 h-16 flex items-center justify-between">
                <span className="font-bold text-purple-600">AdminPanel</span>
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

            <main className="flex-1 md:pl-64 flex flex-col pt-16 md:pt-0">
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
