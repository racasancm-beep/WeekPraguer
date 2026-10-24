"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { usePathname } from "next/navigation";

import { useEffect, useState } from "react";

export function FloatingHomeButton() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    
    // Don't show the button if not mounted or already on the home page
    if (!mounted || pathname === "/") return null;

    return (
        <Link 
            href="/"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#008080] hover:bg-[#006F6F] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
            aria-label="Go to Home Page"
        >
            <Home className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            
            {/* Tooltip on hover */}
            <span className="absolute right-full mr-4 bg-gray-900 text-white text-sm font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                Back to Home
            </span>
        </Link>
    );
}
