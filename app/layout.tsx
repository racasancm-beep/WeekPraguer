import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { MainNav } from "@/components/layout/main-nav";
import { FloatingHomeButton } from "@/components/ui/floating-home-button";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "MyGenie — Rent Unique Spaces by the Hour in Romania",
    description: "Hourly space rental marketplace across Romania. Find and book kitchens, coworking spaces, photography studios, event rooms, gyms and more in Bucharest, Cluj-Napoca, Timișoara and more.",
    keywords: ["hourly space rental", "spaces bucharest", "spaces bucuresti", "spaces cluj", "coworking romania", "photography studios", "kitchen rental", "event rooms", "MyGenie"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
                <Providers>
                    <MainNav />
                    {children}
                    <FloatingHomeButton />
                </Providers>
            </body>
        </html>
    );
}
