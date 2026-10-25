"use client";

import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

export default function GDPRPage() {
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
                    <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 text-center">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Landmark className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("gdpr.title")}</h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">{t("gdpr.subtitle")}</p>
                    </div>

                    <div className="p-8 prose prose-emerald dark:prose-invert max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t("gdpr.s1Title")}</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t("gdpr.s1Body")}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t("gdpr.s2Title")}</h2>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                <li>{t("gdpr.p1")}</li>
                                <li>{t("gdpr.p2")}</li>
                                <li>{t("gdpr.p3")}</li>
                                <li>{t("gdpr.p4")}</li>
                                <li>{t("gdpr.p5")}</li>
                                <li>{t("gdpr.p6")}</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t("gdpr.s3Title")}</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t("gdpr.s3Body")}
                            </p>
                        </section>

                        <div className="mt-12 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                                {t("gdpr.contact")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
