"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Mail, Lock, Eye, EyeOff, ShieldCheck, BarChart3 } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [adminLoading, setAdminLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Invalid email or password");
                return;
            }

            if (result?.ok) {
                toast.success("Welcome back!");
                router.push("/portal");
                router.refresh();
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleAdminQuickLogin = async () => {
        setAdminLoading(true);
        setFormData({
            email: "admin@mygenie.com",
            password: "admin123",
        });

        try {
            const result = await signIn("credentials", {
                email: "admin@mygenie.com",
                password: "admin123",
                redirect: false,
            });

            if (result?.error) {
                toast.error("Admin sign-in failed");
                return;
            }

            if (result?.ok) {
                toast.success("Signed in as ADMIN — Full Platform Access");
                router.push("/admin/dashboard");
                router.refresh();
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setAdminLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-[#008080]">
                <CardHeader className="text-center">
                    <Link href="/" className="flex items-center justify-center gap-2 mb-4">
                        <Calendar className="w-8 h-8 text-[#008080]" />
                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                            My<span className="text-[#008080]">Genie</span>
                        </span>
                    </Link>
                    <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
                    <CardDescription className="text-base">
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Dedicated ADMIN Login Card */}
                    <div className="rounded-2xl bg-gradient-to-r from-[#004D4D] via-[#006F6F] to-[#008080] p-4 text-white shadow-lg border border-teal-400/30">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-amber-300" />
                                <span className="text-sm font-black uppercase tracking-wider">ADMIN Super Profile</span>
                            </div>
                            <span className="text-[10px] font-bold bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full border border-amber-300/30">
                                All Graphs &amp; Profiles
                            </span>
                        </div>
                        <p className="text-xs text-teal-100 mb-3 leading-relaxed">
                            Full access to all platform graphs, Owner &amp; Renter dashboards, and every user profile.
                        </p>
                        <div className="bg-black/20 rounded-xl px-3 py-2 mb-3 text-xs font-mono flex flex-col gap-0.5 border border-white/10">
                            <div><span className="text-teal-200">Email:</span> <strong className="text-white">admin@mygenie.com</strong></div>
                            <div><span className="text-teal-200">Password:</span> <strong className="text-white">admin123</strong></div>
                        </div>
                        <Button
                            type="button"
                            onClick={handleAdminQuickLogin}
                            disabled={adminLoading || loading}
                            className="w-full h-11 bg-amber-400 hover:bg-amber-300 text-gray-950 font-black rounded-xl shadow-md transition-all"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            {adminLoading ? "Opening Admin Command Center..." : "Log In as ADMIN (1-Click)"}
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                            <span className="px-2 bg-white dark:bg-gray-900 text-gray-400">Or sign in with credentials</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@mygenie.com"
                                    className="pl-10"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-medium">
                                    Password
                                </label>
                                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                    Forgot?
                                </Link>
                            </div>
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

                        <Button type="submit" className="w-full h-12 text-base bg-[#008080] hover:bg-[#006F6F] text-white font-bold" disabled={loading || adminLoading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>

                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="text-[#008080] font-semibold hover:underline">
                                Sign up for free
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
