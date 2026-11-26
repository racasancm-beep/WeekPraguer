"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { DarkerGenieBadge } from "@/components/referral/darker-genie-badge";
import { DarkerGenieStats, calculateGenieLevel } from "@/lib/referral-utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles, Copy, Check, Download, QrCode, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface ReferralData {
    code: string;
    registrationUrl: string;
    qrDataUrl: string;
    referrerRole: string;
    stats: DarkerGenieStats;
}

export function BottomLeftProfileGenie() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const { t } = useLanguage();
    const [data, setData] = useState<ReferralData | null>(null);
    const [copied, setCopied] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const userRole = (session?.user as any)?.role || "CUSTOMER";

    // Immediate fallback generation to ensure the Genie level is always shown instantly
    const generateClientFallback = (role: string) => {
        try {
            const prefix = role === "SERVICE_OWNER" ? "MG-SERV" : role === "OWNER" ? "MG-OWN" : "MG-CUST";
            const randomCode = `${prefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const origin = typeof window !== "undefined" ? window.location.origin : "https://www.mygenieurope.com";
            const registrationUrl = `${origin}/register?ref=${randomCode}`;
            const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registrationUrl)}`;
            return {
                code: randomCode,
                registrationUrl,
                qrDataUrl,
                referrerRole: role,
                stats: calculateGenieLevel(0),
            };
        } catch {
            return null;
        }
    };

    const fetchCode = async () => {
        try {
            const res = await fetch("/api/referrals/my-code");
            if (res.ok) {
                const json = await res.json();
                if (json?.code) {
                    setData(json);
                    return;
                }
            }
            setData((prev) => prev || generateClientFallback(userRole));
        } catch (e) {
            setData((prev) => prev || generateClientFallback(userRole));
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            setData(generateClientFallback(userRole));
            fetchCode();
        }
    }, [status, userRole]);

    // Don't render for unauthenticated visitors
    if (status !== "authenticated" || !session?.user) {
        return null;
    }

    // On desktop, pages with the persistent left sidebar (/owner/* and /dashboard)
    // already have the QR card docked cleanly inside the sidebar's bottom-left.
    const isSidebarPage = pathname.startsWith("/owner") || pathname.startsWith("/dashboard");

    const level = data?.stats?.genieLevel || 0;
    const confirmedCount = data?.stats?.confirmedReferrals || 0;
    const progressToNext = data?.stats?.progressToNext || 0;
    const code = data?.code || (userRole === "SERVICE_OWNER" ? "MG-SERV-XXXX" : userRole === "OWNER" ? "MG-OWN-XXXX" : "MG-CUST-XXXX");
    const roleLabel =
        userRole === "SERVICE_OWNER"
            ? (t("owner.serviceOwnerRoleBadge") || "Service Owner")
            : userRole === "OWNER"
            ? (t("owner.roleBadge") || "Owner")
            : (t("renter.roleBadge") || "Customer");

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!data?.registrationUrl) return;
        navigator.clipboard.writeText(data.registrationUrl);
        setCopied(true);
        toast.success(t("referral.copiedToast") || "Link de recomandare copiat!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!data?.qrDataUrl) return;
        const link = document.createElement("a");
        link.href = data.qrDataUrl;
        link.download = `MyGenie-QR-${data.code}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(t("referral.downloadToast") || "Cod QR descărcat!");
    };

    return (
        <>
            {/* Left Down Corner Floating Badge (Hidden on desktop for sidebar pages to avoid duplication) */}
            <aside
                aria-label="Profil Genie Level"
                className={`fixed bottom-4 left-4 z-40 select-none transition-all duration-300 ${
                    isSidebarPage ? "md:hidden" : ""
                }`}
            >
                {isMinimized ? (
                    /* Minimized: Ultra-compact circular badge with Genie avatar and Level indicator */
                    <button
                        onClick={() => setIsMinimized(false)}
                        className="group relative flex items-center justify-center p-1 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-2 border-teal-300 dark:border-teal-700 shadow-xl hover:scale-105 transition-all"
                        title={`${t("referral.genieLevel") || "Genie Level"} ${level} — ${t("referral.expand") || "Expand"}`}
                    >
                        <DarkerGenieBadge level={level} size="md" />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[9px] font-black text-white shadow-sm">
                            <ChevronUp className="w-2.5 h-2.5" />
                        </span>
                    </button>
                ) : (
                    /* Expanded: Compact, non-intrusive pill showing Genie image, Level, and quick action */
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-2 border-teal-300/90 dark:border-teal-700 shadow-xl max-w-[270px] hover:border-teal-500 transition-all">
                        {/* Genie Image in line with profile level */}
                        <div
                            onClick={() => setIsDialogOpen(true)}
                            role="button"
                            tabIndex={0}
                            className="relative cursor-pointer hover:scale-105 transition-transform shrink-0"
                            title={t("referral.dialogTitle") || "QR Code"}
                        >
                            <DarkerGenieBadge level={level} size="md" />
                        </div>

                        {/* Profile Level Details */}
                        <div
                            onClick={() => setIsDialogOpen(true)}
                            role="button"
                            tabIndex={0}
                            className="min-w-0 flex-1 cursor-pointer"
                        >
                            <div className="flex items-center gap-1 font-black text-xs text-gray-900 dark:text-gray-100 truncate">
                                <span>{t("referral.genieLevel") || "Genie Level"} {level}</span>
                                <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400">
                                    ({roleLabel})
                                </span>
                                {level > 0 && (
                                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                                )}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                                {confirmedCount} {confirmedCount === 1 ? (t("referral.confirmedCountSingle") || "referral") : (t("referral.confirmedCount") || "referrals")} ({progressToNext}/10)
                            </div>
                        </div>

                        {/* Quick Copy Link Action */}
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-lg text-teal-700 hover:text-teal-900 hover:bg-teal-50 dark:hover:bg-gray-800 transition-colors shrink-0"
                            title={t("referral.copyLink") || "Copy Link"}
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Minimize toggle so it never covers screen data */}
                        <button
                            onClick={() => setIsMinimized(true)}
                            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0"
                            title={t("referral.minimize") || "Minimize"}
                        >
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </aside>

            {/* Modal Dialog with Full QR Code Details */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md p-6 bg-white dark:bg-gray-900 rounded-3xl border-2 border-teal-200">
                    <DialogHeader className="text-center pb-2">
                        <div className="flex justify-center mb-2">
                            <DarkerGenieBadge level={level} size="lg" />
                        </div>
                        <DialogTitle className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
                            <span>{t("referral.genieLevel") || "Genie Level"} {level}</span>
                            {level > 0 && <Sparkles className="w-5 h-5 text-amber-500" />}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            {roleLabel} • {confirmedCount} {confirmedCount === 1 ? (t("referral.confirmedCountSingle") || "referral") : (t("referral.confirmedCount") || "referrals")}
                        </DialogDescription>
                    </DialogHeader>

                    {/* QR Code Presentation */}
                    <div className="bg-gradient-to-b from-teal-50/60 to-white dark:from-gray-800 dark:to-gray-900 p-4 rounded-2xl border border-teal-200/70 flex flex-col items-center">
                        {data?.qrDataUrl ? (
                            <img
                                src={data.qrDataUrl}
                                alt="QR Code"
                                className="w-48 h-48 object-contain rounded-xl bg-white p-2 border border-teal-100 shadow-md"
                            />
                        ) : (
                            <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-xl">
                                <QrCode className="w-10 h-10 text-teal-600 animate-spin" />
                            </div>
                        )}

                        <div className="mt-3 font-mono text-sm font-black text-teal-900 dark:text-teal-200 bg-teal-100/70 dark:bg-teal-950/60 px-3 py-1 rounded-lg border border-teal-300">
                            {code}
                        </div>

                        {/* Darker Genie Progress */}
                        <div className="w-full mt-4 space-y-1">
                            <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                                <span>{t("referral.towardsDarker") || "towards darker Genie"}</span>
                                <span className="text-teal-700">{progressToNext} / 10</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-teal-500 to-teal-800 transition-all duration-500"
                                    style={{ width: `${Math.min(100, (progressToNext / 10) * 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 text-center pt-1">
                                {t("referral.darkerRule") || "For every 10 confirmed referrals, your Genie becomes darker."}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={handleCopy}
                            className="font-bold border-teal-200 hover:bg-teal-50 text-teal-900"
                        >
                            {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-600" /> : <Copy className="w-4 h-4 mr-1.5" />}
                            {copied ? (t("referral.copied") || "Copied!") : (t("referral.copyLink") || "Copy Link")}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleDownload}
                            className="font-bold border-teal-200 hover:bg-teal-50 text-teal-900"
                        >
                            <Download className="w-4 h-4 mr-1.5" />
                            {t("referral.saveQr") || "Save QR"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
