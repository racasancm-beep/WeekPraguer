"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Calendar, Lock, User, Briefcase, Eye, EyeOff, QrCode, Upload, CheckCircle2, XCircle, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/language-context";
import { scanQRCodeFromImageFile } from "@/lib/qr-scanner";
import { extractReferralCode } from "@/lib/referral-utils";

type UserRole = "OWNER" | "RENTER" | "SERVICE_OWNER";

function RegisterForm() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const initialRole = searchParams.get("role")?.toUpperCase() as UserRole;
    const mode = searchParams.get("mode") || searchParams.get("context");
    const isOwnerOnlyMode =
        mode === "owner" ||
        mode === "list-space" ||
        initialRole === "OWNER" ||
        initialRole === "SERVICE_OWNER" ||
        searchParams.get("type") === "owner";

    const paramCallbackUrl = searchParams.get("callbackUrl");
    const [resolvedCallbackUrl, setResolvedCallbackUrl] = useState<string | null>(null);
    const [role, setRole] = useState<UserRole>(
        isOwnerOnlyMode
            ? (initialRole === "SERVICE_OWNER" ? "SERVICE_OWNER" : "OWNER")
            : (["OWNER", "RENTER", "SERVICE_OWNER"].includes(initialRole) ? initialRole : "RENTER")
    );
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Referral QR code states
    const urlRef = searchParams.get("ref");
    const [hasQrCode, setHasQrCode] = useState<boolean>(Boolean(urlRef));
    const [referralCode, setReferralCode] = useState<string>(urlRef ? extractReferralCode(urlRef) : "");
    const [scanningQr, setScanningQr] = useState(false);
    const [qrImagePreview, setQrImagePreview] = useState<string | null>(null);
    const [verifiedReferrer, setVerifiedReferrer] = useState<{ name: string; role: string } | null>(null);
    const [referralError, setReferralError] = useState<string | null>(null);

    // Social Auth modal states (Google & Apple)
    const [socialModalOpen, setSocialModalOpen] = useState(false);
    const [socialProvider, setSocialProvider] = useState<"google" | "apple">("google");
    const [socialEmail, setSocialEmail] = useState("");
    const [socialName, setSocialName] = useState("");
    const [socialLoading, setSocialLoading] = useState(false);

    const handleSocialClick = (provider: "google" | "apple") => {
        setSocialProvider(provider);
        const defaultEmail = formData.email || (provider === "google" ? "user@gmail.com" : "user@icloud.com");
        const defaultName = formData.name || (formData.email ? formData.email.split("@")[0] : (provider === "google" ? "Google User" : "Apple User"));
        setSocialEmail(defaultEmail);
        setSocialName(defaultName);
        setSocialModalOpen(true);
    };

    const handleSocialSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!socialEmail.trim()) {
            toast.error(t("register.socialAccountEmail") || "Te rugăm să introduci o adresă de email.");
            return;
        }

        setSocialLoading(true);
        try {
            const result = await signIn("social-auth", {
                provider: socialProvider,
                email: socialEmail.trim(),
                name: socialName.trim() || socialEmail.split("@")[0],
                role,
                referralCode: referralCode || "",
                redirect: false,
            });

            if (result?.error) {
                toast.error(result.error || "Eroare la autentificarea socială");
                return;
            }

            if (result?.ok) {
                const roleName =
                    role === "SERVICE_OWNER"
                        ? (t("service.serviceOwner") || "Service Owner")
                        : role === "OWNER"
                        ? (t("owner.roleBadge") || "Space Owner")
                        : (t("renter.roleBadge") || "Customer");
                toast.success(
                    `${socialProvider === "google" ? "Google" : "Apple"}: ${roleName} ${t("register.createBtn") || "Cont creat cu succes"}!`
                );

                setSocialModalOpen(false);

                if (role === "SERVICE_OWNER") {
                    router.push("/owner/dashboard/listings/create?type=SERVICE");
                    return;
                }
                if (role === "OWNER") {
                    router.push("/owner/dashboard/listings/create");
                    return;
                }
                if (activeCallback && activeCallback.startsWith("/") && activeCallback !== "/dashboard") {
                    router.push(activeCallback);
                    return;
                }
                router.push("/portal");
            }
        } catch (err: any) {
            console.error("Social auth error:", err);
            toast.error("Eroare la conectare");
        } finally {
            setSocialLoading(false);
        }
    };

    const verifyCode = async (codeToVerify: string) => {
        const clean = extractReferralCode(codeToVerify);
        if (!clean) {
            setVerifiedReferrer(null);
            setReferralError(null);
            return;
        }

        try {
            const res = await fetch(`/api/referrals/verify?code=${encodeURIComponent(clean)}`);
            const json = await res.json();
            if (json.valid) {
                setVerifiedReferrer({
                    name: json.referrerName,
                    role: json.referrerRole === "OWNER" ? (t("owner.roleBadge") || "Owner") : (t("renter.roleBadge") || "Customer"),
                });
                setReferralError(null);
            } else {
                setVerifiedReferrer(null);
                setReferralError(json.error || "Cod QR invalid sau deja utilizat.");
            }
        } catch {
            setVerifiedReferrer(null);
            setReferralError("Eroare la verificarea codului QR.");
        }
    };

    useEffect(() => {
        if (urlRef) {
            verifyCode(urlRef);
        }
    }, [urlRef]);

    const handleQrImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setScanningQr(true);
        setReferralError(null);

        // Preview image
        const objectUrl = URL.createObjectURL(file);
        setQrImagePreview(objectUrl);

        try {
            const scannedCode = await scanQRCodeFromImageFile(file);
            if (scannedCode) {
                setReferralCode(scannedCode);
                toast.success(t("referral.scannedSuccess") || "Cod QR scanat cu succes din imagine!");
                await verifyCode(scannedCode);
            } else {
                setReferralError(t("referral.scanFailed") || "Nu s-a putut citi niciun cod QR valid din această imagine. Te rugăm să introduci codul manual.");
            }
        } catch (err) {
            console.error("QR Scan error:", err);
            setReferralError("Eroare la procesarea imaginii codului QR.");
        } finally {
            setScanningQr(false);
        }
    };

    useEffect(() => {
        if (paramCallbackUrl && paramCallbackUrl.startsWith("/")) {
            setResolvedCallbackUrl(paramCallbackUrl);
            try {
                sessionStorage.setItem("postAuthRedirectUrl", paramCallbackUrl);
            } catch {
                // ignore storage errors
            }
        } else {
            try {
                const stored = sessionStorage.getItem("postAuthRedirectUrl");
                if (stored && stored.startsWith("/")) {
                    setResolvedCallbackUrl(stored);
                }
            } catch {
                // ignore storage errors
            }
        }
    }, [paramCallbackUrl]);

    const activeCallback = paramCallbackUrl || resolvedCallbackUrl;

    // If user is already logged in, route Service Owner to Create Service, Owner to Create Space, or callback
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const userRole = (session.user as any).role;
            try {
                sessionStorage.removeItem("postAuthRedirectUrl");
            } catch {
                // ignore
            }

            if (userRole === "SERVICE_OWNER") {
                router.push("/owner/dashboard/listings/create?type=SERVICE");
                return;
            }
            if (userRole === "OWNER") {
                router.push("/owner/dashboard/listings/create");
                return;
            }
            if (userRole === "ADMIN") {
                router.push("/admin/dashboard");
                return;
            }
            if (activeCallback && activeCallback.startsWith("/") && activeCallback !== "/dashboard") {
                router.push(activeCallback);
                return;
            }
            router.push("/dashboard");
        }
    }, [status, session, router, activeCallback]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: any = { ...formData, role };
            if (hasQrCode && referralCode.trim()) {
                payload.referralCode = referralCode.trim();
            }

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(t("register.createBtn"));
                const signInResult = await signIn("credentials", {
                    email: formData.email.trim(),
                    password: formData.password,
                    redirect: false,
                });

                if (signInResult?.ok) {
                    try {
                        sessionStorage.removeItem("postAuthRedirectUrl");
                    } catch {
                        // ignore
                    }

                    if (role === "SERVICE_OWNER") {
                        router.push("/owner/dashboard/listings/create?type=SERVICE");
                    } else if (role === "OWNER") {
                        router.push("/owner/dashboard/listings/create");
                    } else if (activeCallback && activeCallback.startsWith("/") && activeCallback !== "/dashboard") {
                        router.push(activeCallback);
                    } else {
                        router.push("/dashboard");
                    }
                } else {
                    const loginUrl = activeCallback
                        ? `/login?registered=true&callbackUrl=${encodeURIComponent(activeCallback)}`
                        : "/login?registered=true";
                    router.push(loginUrl);
                }
            } else {
                toast.error(data.message || "Registration failed");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const loginHref = activeCallback
        ? `/login?callbackUrl=${encodeURIComponent(activeCallback)}`
        : "/login";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
                <label className="block text-sm font-medium mb-3">{t("register.iWantTo")}</label>
                {isOwnerOnlyMode ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setRole("OWNER")}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center ${
                                role === "OWNER"
                                    ? "border-[#008080] bg-[#008080]/10 shadow-sm font-bold"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <User className="w-6 h-6 mb-2 text-[#008080]" />
                            <div className="text-sm font-semibold">{t("register.listSpace")}</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setRole("SERVICE_OWNER")}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center ${
                                role === "SERVICE_OWNER"
                                    ? "border-[#008080] bg-[#008080]/10 shadow-sm font-bold"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <Sparkles className="w-6 h-6 mb-2 text-[#008080]" />
                            <div className="text-sm font-semibold">{t("register.serviceOwner") || "Service owner"}</div>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setRole("RENTER")}
                            className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all ${
                                role === "RENTER"
                                    ? "border-[#008080] bg-[#008080]/10 shadow-sm"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <Briefcase className="w-6 h-6 mx-auto mb-2 text-[#008080]" />
                            <div className="text-sm font-semibold">{t("register.rentSpace")}</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setRole("OWNER")}
                            className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all ${
                                role === "OWNER"
                                    ? "border-[#008080] bg-[#008080]/10 shadow-sm"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <User className="w-6 h-6 mx-auto mb-2 text-[#008080]" />
                            <div className="text-sm font-semibold">{t("register.listSpace")}</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setRole("SERVICE_OWNER")}
                            className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all ${
                                role === "SERVICE_OWNER"
                                    ? "border-[#008080] bg-[#008080]/10 shadow-sm"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <Sparkles className="w-6 h-6 mx-auto mb-2 text-[#008080]" />
                            <div className="text-sm font-semibold">{t("register.serviceOwner") || "Service owner"}</div>
                        </button>
                    </div>
                )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                        {t("register.fullName")}
                    </label>
                    <Input
                        id="name"
                        type="text"
                        placeholder={t("register.fullNamePlaceholder")}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                        {t("register.emailAddress")}
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="user@mygenieurope.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                        {t("register.password")}
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={8}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        {t("register.phone")} <span className="text-gray-400 font-normal">{t("register.optional")}</span>
                    </label>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="+40 700 000 000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>
            </div>

            {/* Referral QR Code Option */}
            <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-[#008080]" />
                        {t("register.hasQrQuestion") || "Ai un cod QR de la un utilizator existent?"}
                    </label>
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-teal-200/60 text-xs font-semibold self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => {
                                setHasQrCode(false);
                                setReferralCode("");
                                setVerifiedReferrer(null);
                                setReferralError(null);
                                setQrImagePreview(null);
                            }}
                            className={`px-3 py-1 rounded-lg transition-all ${
                                !hasQrCode ? "bg-gray-200 text-gray-800 font-bold shadow-sm" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {t("common.no") || "Nu"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setHasQrCode(true)}
                            className={`px-3 py-1 rounded-lg transition-all ${
                                hasQrCode ? "bg-[#008080] text-white font-bold shadow-sm" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {t("common.yes") || "Da, am cod QR"}
                        </button>
                    </div>
                </div>

                {hasQrCode && (
                    <div className="space-y-3 pt-2 border-t border-teal-200/40">
                        {/* Upload QR Image Box */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                {t("register.uploadQrLabel") || "Încarcă imaginea codului QR (poză / captură de ecran):"}
                            </label>
                            <div className="relative border-2 border-dashed border-teal-300 hover:border-[#008080] bg-white rounded-xl p-3 text-center transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleQrImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {scanningQr ? (
                                    <div className="flex items-center justify-center gap-2 text-xs text-teal-700 font-bold py-2">
                                        <QrCode className="w-4 h-4 animate-spin text-[#008080]" />
                                        {t("register.scanningQr") || "Se scanează imaginea codului QR..."}
                                    </div>
                                ) : qrImagePreview ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <img
                                            src={qrImagePreview}
                                            alt="QR Preview"
                                            className="w-12 h-12 object-contain rounded-lg border border-teal-200"
                                        />
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-teal-900">
                                                {t("register.qrImageLoaded") || "Imagine QR încărcată"}
                                            </p>
                                            <p className="text-[10px] text-gray-500">
                                                {t("register.clickToChange") || "Apasă pentru a alege altă imagine"}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-1">
                                        <Upload className="w-6 h-6 text-[#008080] mb-1" />
                                        <p className="text-xs font-bold text-gray-800">
                                            {t("register.uploadQrAction") || "Apasă sau trage poza codului QR aici"}
                                        </p>
                                        <p className="text-[10px] text-gray-400">PNG, JPG, WEBP, Captură ecran</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Manual Code Input */}
                        <div>
                            <label htmlFor="referralCode" className="block text-xs font-bold text-gray-700 mb-1">
                                {t("register.orEnterCode") || "Sau introdu codul de recomandare manual:"}
                            </label>
                            <Input
                                id="referralCode"
                                type="text"
                                placeholder="MG-OWN-1234 sau MG-CUST-1234"
                                value={referralCode}
                                onChange={(e) => {
                                    const val = e.target.value.toUpperCase();
                                    setReferralCode(val);
                                    verifyCode(val);
                                }}
                                className="h-10 text-xs font-mono font-bold uppercase tracking-wider bg-white"
                            />
                        </div>

                        {/* Verification Status */}
                        {verifiedReferrer && (
                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-2 text-xs text-emerald-900 font-bold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>
                                    {t("register.referrerVerified") || "Recomandat de"}:{" "}
                                    <span className="text-emerald-950 font-black">{verifiedReferrer.name}</span> ({verifiedReferrer.role})
                                </span>
                            </div>
                        )}

                        {referralError && (
                            <div className="p-2.5 rounded-xl bg-red-50 border border-red-300 flex items-center gap-2 text-xs text-red-800 font-semibold">
                                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                                <span>{referralError}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* GDPR Consent */}
            <div className="flex items-start gap-3">
                <input
                    type="checkbox"
                    required
                    className="mt-1 w-4 h-4 text-[#008080] border-gray-300 rounded focus:ring-[#008080]"
                />
                <label className="text-sm text-gray-600 dark:text-gray-400">
                    {t("register.gdprPrefix")}{" "}
                    <Link href="/terms" className="text-[#008080] hover:underline">
                        {t("footer.terms")}
                    </Link>{" "}
                    {t("register.and")}{" "}
                    <Link href="/privacy" className="text-[#008080] hover:underline">
                        {t("footer.privacy")}
                    </Link>
                    {t("register.gdprSuffix")}
                </label>
            </div>

            <Button type="submit" className="w-full h-12 text-base bg-[#008080] hover:bg-[#006F6F] text-white font-bold" disabled={loading}>
                {loading ? t("register.creating") : t("register.createBtn")}
            </Button>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">{t("register.orContinueWith")}</span>
                </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialClick("google")}
                    className="h-12 border-gray-300 hover:border-[#008080] hover:bg-teal-50/30 transition-all font-semibold"
                >
                    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Google
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialClick("apple")}
                    className="h-12 border-gray-300 hover:border-gray-900 hover:bg-gray-50 transition-all font-semibold"
                >
                    <svg className="w-5 h-5 mr-2 shrink-0 fill-current" viewBox="0 0 24 24">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    Apple
                </Button>
            </div>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                {t("register.alreadyHaveAccount")}{" "}
                <Link href={loginHref} className="text-[#008080] font-semibold hover:underline">
                    {t("register.signIn")}
                </Link>
            </p>

            {/* Social Auth Modal based on user choice */}
            <Dialog open={socialModalOpen} onOpenChange={setSocialModalOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl border-2 border-teal-500/30 shadow-2xl p-6 bg-white dark:bg-gray-900">
                    <DialogHeader className="text-center pb-2">
                        <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-sm border border-gray-200 bg-white">
                            {socialProvider === "google" ? (
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 fill-current text-gray-900" viewBox="0 0 24 24">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                </svg>
                            )}
                        </div>
                        <DialogTitle className="text-xl font-black">
                            {socialProvider === "google" ? "Google" : "Apple"}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {t("register.socialRoleNotice") || "Contul va fi creat pe baza opțiunii tale de profil:"}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Prominent Role Badge showing User's Choice */}
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500">Profil selectat:</span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                            role === "SERVICE_OWNER"
                                ? "bg-teal-100 text-teal-900 border border-teal-300"
                                : role === "OWNER"
                                ? "bg-purple-100 text-purple-900 border border-purple-300"
                                : "bg-blue-100 text-blue-900 border border-blue-300"
                        }`}>
                            {role === "SERVICE_OWNER" ? (
                                <>
                                    <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                                    <span>{t("register.serviceOwner") || "Service owner"}</span>
                                </>
                            ) : role === "OWNER" ? (
                                <>
                                    <User className="w-3.5 h-3.5 text-purple-700" />
                                    <span>{t("register.listSpace") || "Space owner"}</span>
                                </>
                            ) : (
                                <>
                                    <Briefcase className="w-3.5 h-3.5 text-blue-700" />
                                    <span>{t("register.rentSpace") || "Customer"}</span>
                                </>
                            )}
                        </span>
                    </div>

                    {referralCode && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Cod Recomandare: <strong>{referralCode}</strong></span>
                        </div>
                    )}

                    <div className="space-y-3 pt-2">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                {t("register.socialAccountEmail") || "Adresă de email asociată"}
                            </label>
                            <Input
                                type="email"
                                value={socialEmail}
                                onChange={(e) => setSocialEmail(e.target.value)}
                                placeholder={socialProvider === "google" ? "user@gmail.com" : "user@icloud.com"}
                                className="h-10 text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                {t("register.socialAccountName") || "Nume complet"}
                            </label>
                            <Input
                                type="text"
                                value={socialName}
                                onChange={(e) => setSocialName(e.target.value)}
                                placeholder="Numele tău"
                                className="h-10 text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-3">
                        <Button
                            type="button"
                            onClick={handleSocialSubmit}
                            disabled={socialLoading || !socialEmail.trim()}
                            className="w-full h-11 bg-[#008080] hover:bg-[#006F6F] text-white font-extrabold rounded-xl shadow-md transition-all text-sm"
                        >
                            {socialLoading ? (
                                "Se conectează..."
                            ) : (
                                socialProvider === "google"
                                    ? "Continuă cu Google"
                                    : "Continuă cu Apple"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setSocialModalOpen(false)}
                            className="w-full text-xs text-gray-500"
                        >
                            {t("common.cancel") || "Anulează"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </form>
    );
}

export default function RegisterPage() {
    const { t } = useLanguage();
    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-2xl border-t-4 border-t-[#008080]">
                <CardHeader className="text-center">
                    <Link href="/" className="flex items-center justify-center gap-2 mb-4">
                        <Calendar className="w-8 h-8 text-[#008080]" />
                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                            My<span className="text-[#008080]">Genie</span>
                        </span>
                    </Link>
                    <CardTitle className="text-3xl font-bold">{t("register.title")}</CardTitle>
                    <CardDescription className="text-base">
                        {t("register.subtitle")}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Suspense fallback={<div className="text-center p-8">{t("common.loading")}</div>}>
                        <RegisterForm />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
