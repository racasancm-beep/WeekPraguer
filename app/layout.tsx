import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Weekend Space Booker - Rent Office Spaces on Weekends",
    description: "Connect building owners with renters for weekend-only office space bookings in Prague. Perfect for therapists, workshops, and events.",
    keywords: ["office rental", "weekend booking", "Prague", "coworking", "therapy rooms", "event space"],
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
                    {children}
                </Providers>
            </body>
        </html>
    );
}
