"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function PortalPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t } = useLanguage();

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.push("/login");
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
                router.push("/dashboard");
                break;
            case "ADMIN":
                router.push("/admin/dashboard");
                break;
            default:
                router.push("/");
        }
    }, [session, status, router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">{t("common.redirecting")}</h2>
                <p className="text-muted-foreground">{t("common.takingToDashboard")}</p>
            </div>
        </div>
    );
}
