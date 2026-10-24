import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
        NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === "production"
            ? "https://www.mygenieurope.com"
            : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBgYxlln25mL1D5b5IxDn95lVIvs2MPcqM",
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "10mb",
        },
    },
};

export default nextConfig;
