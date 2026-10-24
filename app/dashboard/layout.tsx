"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Calendar, LogOut, Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function RenterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!session) {
        return null;
    }

    const navigation = [
        { name: "My Bookings", href: "/dashboard", icon: Calendar },
        { name: "Explore Spaces", href: "/explore", icon: Search },
    ];

    const Sidebar = () => (
        <div className="flex h-full flex-col bg-white dark:bg-gray-900 border-r dark:border-gray-800">
            <div className="flex h-16 items-center px-6 border-b dark:border-gray-800">
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    MyGenie
                </span>
                <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 uppercase tracking-tighter">
                    {isAdmin ? "Admin → Renter" : "Renter"}
                </span>
            </div>

            {isAdmin && (
                <div className="p-3 bg-amber-50 border-b border-amber-200">
                    <Link href="/admin/dashboard">
                        <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs">
                            <ShieldCheck className="w-4 h-4 mr-1.5" />
                            Back to ADMIN Hub
                        </Button>
                    </Link>
                </div>
            )}

            <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                                    isActive
                                        ? "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 shadow-sm font-bold"
                                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                                }`}
                            >
                                <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-violet-600 dark:text-violet-400" : "text-gray-400"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t dark:border-gray-800 mt-auto bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center mb-4 px-2">
                    <Avatar className="h-9 w-9 mr-3 border-2 border-white dark:border-gray-800 shadow-sm">
                        <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold uppercase">
                            {session.user?.name?.[0] || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{session.user?.name || "Member"}</p>
                        <p className="text-[10px] text-gray-500 truncate">{session.user?.email}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 border-red-100 dark:border-red-900/30 rounded-xl font-semibold text-xs"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 shadow-2xl shadow-violet-500/5">
                <Sidebar />
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b dark:border-gray-800 px-4 h-16 flex items-center justify-between">
                <span className="font-bold text-violet-600">MyGenie</span>
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72 border-none">
                        <Sidebar />
                    </SheetContent>
                </Sheet>
            </div>

            <main className="flex-1 md:ml-64 flex flex-col pt-16 md:pt-0 overflow-y-auto">
                <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
