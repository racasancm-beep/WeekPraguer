"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { OwnerListingsView } from "@/components/owner/owner-listings-view";
import { useLanguage } from "@/lib/i18n/language-context";

function ListingsPageContent() {
    const searchParams = useSearchParams();
    const userId = searchParams?.get("userId");
    const { t } = useLanguage();
    const [spaces, setSpaces] = useState<any[]>([]);
    const [isAdminAllView, setIsAdminAllView] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpaces = async () => {
            try {
                const url = userId
                    ? `/api/owner/spaces?userId=${encodeURIComponent(userId)}`
                    : "/api/owner/spaces";
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setSpaces(data);
                    } else {
                        setSpaces(data.spaces || []);
                        setIsAdminAllView(Boolean(data.isAdminAllView));
                    }
                }
            } catch (err) {
                console.error("Failed to load spaces:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSpaces();
    }, [userId]);

    if (loading) {
        return <div className="p-8">{t("common.loading")}</div>;
    }

    return (
        <OwnerListingsView
            spaces={spaces}
            isAdminAllView={isAdminAllView}
        />
    );
}

export default function MyListingsPage() {
    const { t } = useLanguage();
    return (
        <Suspense fallback={<div className="p-8">{t("common.loading")}</div>}>
            <ListingsPageContent />
        </Suspense>
    );
}
