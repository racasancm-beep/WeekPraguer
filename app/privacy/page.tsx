"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

export default function PrivacyPolicyPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/">
                        <Button variant="ghost" className="pl-0 hover:bg-transparent -ml-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t("common.backToHome")}
                        </Button>
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("privacy.title")}</h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">{t("privacy.updated")}</p>
                    </div>

                    <div className="p-8 prose prose-blue dark:prose-invert max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t("privacy.s1Title")}</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t("privacy.s1Body")}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t("privacy.s2Title")}</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t("privacy.s2Body")}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t("privacy.s3Title")}</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t("privacy.s3Body")}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t("privacy.s4Title")}</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t("privacy.s4Body")}
                            </p>
                        </section>

                        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                {t("privacy.contact")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
