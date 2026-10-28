"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpaceForm } from "@/components/owner/space-form";
import { useLanguage } from "@/lib/i18n/language-context";

export default function EditListingPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const { t } = useLanguage();
    const [space, setSpace] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        if (id && status === "authenticated") {
            fetch(`/api/spaces/${id}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Not found");
                    return res.json();
                })
                .then((data) => {
                    const sessionUserId = (session?.user as any)?.id;
                    const sessionEmail = session?.user?.email?.trim().toLowerCase();
                    const sessionRole = (session?.user as any)?.role;
                    const isOwnerOfThisSpace =
                        sessionRole === "OWNER" &&
                        Boolean(
                            (sessionUserId && data?.ownerId === sessionUserId) ||
                            (sessionEmail && data?.owner?.email?.trim().toLowerCase() === sessionEmail)
                        );
                    if (!isOwnerOfThisSpace) {
                        // ADMIN or non-owner: no edit permission, redirect to read-only space page
                        router.replace(`/spaces/${id}`);
                        return;
                    }
                    setSpace(data);
                })
                .catch(() => {
                    router.push("/owner/dashboard/listings");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [id, status, router]);

    if (status === "loading" || loading) {
        return <div className="p-8 font-bold text-[#008080]">{t("common.loading")}</div>;
    }

    if (!session || !space) {
        return null;
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8">
                <Link href="/owner/dashboard/listings">
                    <Button variant="ghost" className="mb-4 pl-0 hover:pl-0 hover:bg-transparent">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t("owner.form.backToDashboard")}
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">{t("owner.form.editTitle")}</h1>
                <p className="text-gray-500 mt-2">{t("owner.form.editSubtitle")}</p>
            </div>

            <SpaceForm
                initialData={space}
                spaceId={String(id)}
                onCancel={() => router.push(`/spaces/${id}`)}
            />
        </div>
    );
}
