"use client";

import { SpaceForm } from "@/components/owner/space-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

export default function CreateListingPage() {
    const { t } = useLanguage();

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8">
                <Link href="/owner/dashboard">
                    <Button variant="ghost" className="mb-4 pl-0 hover:pl-0 hover:bg-transparent">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t("owner.form.backToDashboard")}
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">{t("owner.listings.addNewSpace")}</h1>
                <p className="text-gray-500 mt-2">
                    {t("owner.form.createSubtitle")}
                </p>
            </div>

            <SpaceForm />
        </div>
    );
}
