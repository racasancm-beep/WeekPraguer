"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PortalPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.push("/login"); // Redirect to login if not authenticated
            return;
        }

        const role = session.user?.role;

        if (!role) {
            router.push("/login");
            return;
        }

        switch (role) {
            case "OWNER":
                router.push("/owner/dashboard");
                break;
            case "RENTER":
                router.push("/dashboard"); // Renter dashboard (default public dashboard or specific renter one)
                break;
            
            case "ADMIN":
                router.push("/admin/dashboard");
                break;
            default:
                router.push("/"); // Fallback
        }
    }, [session, status, router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Redirecting...</h2>
                <p className="text-muted-foreground">Taking you to your dashboard.</p>
                {/* You could add a spinner here */}
            </div>
        </div>
    );
}
