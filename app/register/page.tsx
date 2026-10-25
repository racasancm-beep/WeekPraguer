"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Calendar, Lock, User, Briefcase, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/language-context";

type UserRole = "OWNER" | "RENTER";

function RegisterForm() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const initialRole = searchParams.get("role")?.toUpperCase() as UserRole;
    const [role, setRole] = useState<UserRole>(
        ["OWNER", "RENTER"].includes(initialRole) ? initialRole : "RENTER"
    );
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // If user is already logged in as OWNER or ADMIN and clicks "List a Space", take them straight to Add New Space
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const userRole = (session.user as any).role;
            if (userRole === "OWNER" || userRole === "ADMIN") {
                router.replace("/owner/dashboard/listings/create");
            }
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, role }),
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
                    if (role === "OWNER") {
                        router.push("/owner/dashboard/listings/create");
                    } else {
                        router.push("/dashboard");
                    }
                    router.refresh();
                } else {
                    router.push("/login?registered=true");
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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
                <label className="block text-sm font-medium mb-3">{t("register.iWantTo")}</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setRole("RENTER")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                            role === "RENTER"
                                ? "border-[#008080] bg-[#008080]/10"
                                : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <Briefcase className="w-6 h-6 mx-auto mb-2 text-[#008080]" />
                        <div className="text-sm font-medium">{t("register.rentSpace")}</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setRole("OWNER")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                            role === "OWNER"
                                ? "border-[#008080] bg-[#008080]/10"
                                : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <User className="w-6 h-6 mx-auto mb-2 text-[#008080]" />
                        <div className="text-sm font-medium">{t("register.listSpace")}</div>
                    </button>
                </div>
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
                <Button type="button" variant="outline" className="h-12">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Google
                </Button>
                <Button type="button" variant="outline" className="h-12">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    Apple
                </Button>
            </div>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                {t("register.alreadyHaveAccount")}{" "}
                <Link href="/login" className="text-[#008080] font-semibold hover:underline">
                    {t("register.signIn")}
                </Link>
            </p>
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
