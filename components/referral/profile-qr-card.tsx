"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { DarkerGenieBadge } from "@/components/referral/darker-genie-badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { QrCode, Copy, Check, RefreshCw, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/language-context";
import { DarkerGenieStats, calculateGenieLevel } from "@/lib/referral-utils";

interface ReferralData {
    code: string;
    registrationUrl: string;
    qrDataUrl: string;
    referrerRole: string;
    createdAt?: string;
    stats: DarkerGenieStats;
}

export function ProfileQrCard({ role }: { role: "OWNER" | "CUSTOMER" }) {
    const { t } = useLanguage();
    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Immediate client-side fallback generation to ensure the QR code is NEVER blank
    const generateClientFallback = async (forcedRole: "OWNER" | "CUSTOMER") => {
        try {
            const prefix = forcedRole === "OWNER" ? "MG-OWN" : "MG-CUST";
            const randomCode = `${prefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const origin = typeof window !== "undefined" ? window.location.origin : "https://www.mygenieurope.com";
            const registrationUrl = `${origin}/register?ref=${randomCode}`;
            const qrDataUrl = await QRCode.toDataURL(registrationUrl, {
                width: 320,
                margin: 2,
                color: { dark: "#111827", light: "#ffffff" },
            });
            return {
                code: randomCode,
                registrationUrl,
                qrDataUrl,
                referrerRole: forcedRole,
                stats: calculateGenieLevel(0),
            };
        } catch {
            return null;
        }
    };

    const fetchCode = async (refresh: boolean = false) => {
        try {
            if (refresh) setRefreshing(true);
            const res = await fetch(`/api/referrals/my-code${refresh ? "?refresh=true" : ""}`, {
                method: refresh ? "POST" : "GET",
            });
            if (res.ok) {
                const json = await res.json();
                if (json?.code && json?.qrDataUrl) {
                    setData(json);
                    return;
                }
            }
            // If server returned non-ok or empty, ensure client fallback is shown
            setData((prev) => {
                if (prev) return prev;
                generateClientFallback(role).then((fb) => fb && setData(fb));
                return prev;
            });
        } catch (e) {
            console.error("Failed to load referral QR code from server", e);
            setData((prev) => {
                if (prev) return prev;
                generateClientFallback(role).then((fb) => fb && setData(fb));
                return prev;
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Immediately generate client fallback first, then fetch live stats from server
        generateClientFallback(role).then((fallback) => {
            if (fallback) setData(fallback);
            fetchCode(false);
        });
    }, [role]);

    const handleCopy = () => {
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

    const level = data?.stats?.genieLevel || 0;
    const confirmedCount = data?.stats?.confirmedReferrals || 0;
    const progressToNext = data?.stats?.progressToNext || 0;
    const needed = data?.stats?.referralsNeededForNext || 10;
    const code = data?.code || (role === "OWNER" ? "MG-OWN-XXXX" : "MG-CUST-XXXX");

    return (
        <>
            <div className="p-3 m-2.5 rounded-2xl bg-gradient-to-br from-teal-50/90 via-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-teal-200/80 dark:border-teal-900/50 shadow-md">
                {/* Header with Darker Genie preview */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-teal-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 min-w-0">
                        <DarkerGenieBadge level={level} size="sm" />
                        <div className="min-w-0">
                            <div className="text-[11px] font-black text-gray-900 dark:text-gray-100 truncate flex items-center gap-1">
                                <span>Genie Nivel {level}</span>
                                {level > 0 && <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />}
                            </div>
                            <div className="text-[9px] text-gray-500 truncate">
                                {confirmedCount} {confirmedCount === 1 ? "recomandare" : "recomandări"} active
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => fetchCode(true)}
                        disabled={refreshing}
                        className="p-1 rounded-md text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        title={t("referral.refreshCode") || "Generează cod QR nou"}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-teal-600" : ""}`} />
                    </button>
                </div>

                {/* QR Code Preview (Click to Enlarge) */}
                <div
                    onClick={() => setIsDialogOpen(true)}
                    role="button"
                    tabIndex={0}
                    className="group relative bg-white p-2 rounded-xl border border-teal-100 shadow-inner flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 transition-all mb-2"
                >
                    {data?.qrDataUrl ? (
                        <img
                            src={data.qrDataUrl}
                            alt="Referral QR Code"
                            className="w-24 h-24 object-contain group-hover:scale-105 transition-transform"
                        />
                    ) : (
                        <div className="w-24 h-24 flex items-center justify-center bg-gray-50 rounded-lg">
                            <QrCode className="w-10 h-10 text-teal-600 animate-spin" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-teal-900/10 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-[10px] font-bold bg-white text-teal-900 px-2 py-0.5 rounded-full shadow">
                            {t("referral.viewLarge") || "Mărește"}
                        </span>
                    </div>
                </div>

                {/* Code badge */}
                <div className="text-center mb-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-teal-800 dark:text-teal-300 border border-teal-200/50">
                        {code}
                    </span>
                    <p className="text-[9px] text-gray-400 mt-0.5">
                        {t("referral.singleUseNotice") || "Cod unic cu fiecare logare (1 utilizare)"}
                    </p>
                </div>

                {/* Progress bar towards next Darker Genie */}
                <div className="space-y-1 mb-2.5">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                        <span>{t("referral.nextLevel") || "Spre următorul Genie"}:</span>
                        <span className="font-bold text-teal-700">{progressToNext} / 10</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-800 transition-all duration-500"
                            style={{ width: `${Math.min(100, (progressToNext / 10) * 100)}%` }}
                        />
                    </div>
                    <p className="text-[8.5px] text-gray-500 leading-tight">
                        {needed > 0
                            ? `Încă ${needed} recomandări confirmate pentru un Genie mai întunecat!`
                            : "Nivel maxim de Genie atins!"}
                    </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-1.5">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopy}
                        className="h-7 text-[10px] font-bold border-teal-200 hover:bg-teal-50 text-teal-900 px-1"
                    >
                        {copied ? <Check className="w-3 h-3 mr-1 text-emerald-600" /> : <Copy className="w-3 h-3 mr-1" />}
                        {copied ? "Copiat" : "Link"}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownload}
                        className="h-7 text-[10px] font-bold border-teal-200 hover:bg-teal-50 text-teal-900 px-1"
                    >
                        <Download className="w-3 h-3 mr-1" />
                        {t("referral.saveImage") || "Imagine"}
                    </Button>
                </div>
            </div>

            {/* Large Modal Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 text-center">
                    <DialogHeader className="text-center space-y-1">
                        <div className="mx-auto mb-2">
                            <DarkerGenieBadge level={level} size="lg" />
                        </div>
                        <DialogTitle className="text-xl font-black text-gray-900">
                            {t("referral.dialogTitle") || "Codul tău QR Unic de Recomandare"}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            {t("referral.dialogSubtitle") ||
                                "Partajează acest cod la crearea unui cont nou. Pentru fiecare 10 noi utilizatori cu închiriere confirmată, Genie-ul tău devine mai întunecat!"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-4 flex flex-col items-center">
                        <div className="p-4 bg-white rounded-2xl border-2 border-teal-200 shadow-lg">
                            {data?.qrDataUrl && (
                                <img
                                    src={data.qrDataUrl}
                                    alt="Referral QR Code Large"
                                    className="w-56 h-56 object-contain"
                                />
                            )}
                        </div>
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-900 border border-teal-200 rounded-lg text-sm font-mono font-bold">
                            {code}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 max-w-xs">
                            {t("referral.activationRules") ||
                                "Codul se consumă la crearea contului și devine confirmat după prima închiriere confirmată."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={handleCopy}
                            className="font-bold text-xs"
                        >
                            {copied ? <Check className="w-4 h-4 mr-1 text-emerald-600" /> : <Copy className="w-4 h-4 mr-1" />}
                            {copied ? "Link Copiat" : "Copiază Linkul"}
                        </Button>
                        <Button
                            onClick={handleDownload}
                            className="bg-[#008080] hover:bg-[#006F6F] text-white font-bold text-xs"
                        >
                            <Download className="w-4 h-4 mr-1" />
                            {t("referral.downloadBtn") || "Descarcă QR"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
