"use client";

import { Suspense } from "react";
import { SpaceForm } from "@/components/owner/space-form";
import { ArrowLeft, Sparkles, Building2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function CreateListingContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const role = (session?.user as any)?.role;
    const isService = role === "SERVICE_OWNER" || searchParams?.get("type") === "SERVICE";

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8">
                <Link href="/owner/dashboard">
                    <Button variant="ghost" className="mb-4 pl-0 hover:pl-0 hover:bg-transparent">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t("owner.form.backToDashboard")}
                    </Button>
                </Link>
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
                    {isService ? (
                        <>
                            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-900/40 text-[#008080] flex items-center justify-center shadow-sm">
                                <Sparkles className="w-6 h-6 text-[#008080]" />
                            </div>
                            <span>{t("service.addNewService") || "Adaugă un Serviciu Nou"}</span>
                        </>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-900/40 text-[#008080] flex items-center justify-center shadow-sm">
                                <Building2 className="w-6 h-6 text-[#008080]" />
                            </div>
                            <span>{t("owner.listings.addNewSpace")}</span>
                        </>
                    )}
                </h1>
                <p className="text-gray-500 mt-2">
                    {isService
                        ? (t("service.createSubtitle") || "Completează detaliile serviciului tău, categoria, locația și tariful orar.")
                        : t("owner.form.createSubtitle")}
                </p>
            </div>

            <SpaceForm />
        </div>
    );
}

export default function CreateListingPage() {
    const { t } = useLanguage();
    return (
        <Suspense fallback={<div className="p-8 text-center">{t("common.loading")}</div>}>
            <CreateListingContent />
        </Suspense>
    );
}
