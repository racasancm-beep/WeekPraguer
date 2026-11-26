"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, Building2, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useSession } from "next-auth/react";

interface ListSpaceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ListSpaceModal({ open, onOpenChange }: ListSpaceModalProps) {
    const { t } = useLanguage();
    const { data: session } = useSession();
    const role = (session?.user as any)?.role;
    const isOwner = role === "OWNER" || role === "ADMIN" || role === "SERVICE_OWNER";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white border border-gray-150 shadow-2xl">
                <DialogHeader className="text-center sm:text-left space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#008080]/10 text-[#008080] flex items-center justify-center mb-1">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
                        {t("listSpaceModal.title")}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        {t("listSpaceModal.subtitle")}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 pt-4">
                    {/* Option 1: Log In */}
                    <Link
                        href="/login?callbackUrl=/owner/dashboard/listings/create"
                        onClick={() => onOpenChange(false)}
                        className="group p-4 rounded-2xl border-2 border-gray-200 hover:border-[#008080] hover:bg-teal-50/40 transition-all flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#008080] text-gray-700 group-hover:text-white flex items-center justify-center transition-colors">
                                <LogIn className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-gray-900 group-hover:text-[#008080] transition-colors">
                                    {t("listSpaceModal.loginOption")}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {t("listSpaceModal.loginDesc")}
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#008080] group-hover:translate-x-1 transition-all" />
                    </Link>

                    {/* Option 2: Create New Owner Account */}
                    <Link
                        href="/register?role=OWNER"
                        onClick={() => onOpenChange(false)}
                        className="group p-4 rounded-2xl border-2 border-[#008080] bg-teal-50/20 hover:bg-teal-50/60 transition-all flex items-center justify-between shadow-sm"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[#008080] text-white flex items-center justify-center">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-black text-gray-900 group-hover:text-[#008080] transition-colors">
                                    {t("listSpaceModal.createOwnerOption")}
                                </div>
                                <div className="text-xs text-gray-600">
                                    {t("listSpaceModal.createOwnerDesc")}
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#008080] group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Option 3: Create New Service Owner Account */}
                    <Link
                        href="/register?role=SERVICE_OWNER"
                        onClick={() => onOpenChange(false)}
                        className="group p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50/20 hover:bg-emerald-50/60 transition-all flex items-center justify-between shadow-sm"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-black text-gray-900 group-hover:text-emerald-700 transition-colors">
                                    {t("listSpaceModal.createServiceOwnerOption") || "Creează cont de Proprietar Servicii"}
                                </div>
                                <div className="text-xs text-gray-600">
                                    {t("listSpaceModal.createServiceOwnerDesc") || "Înregistrează-te pentru a publica și oferi servicii clienților."}
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Quick shortcut if already signed in as owner */}
                    {isOwner && (
                        <div className="pt-2 text-center">
                            <Link
                                href="/owner/dashboard/listings/create"
                                onClick={() => onOpenChange(false)}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs font-bold text-[#008080] hover:text-[#006F6F]"
                                >
                                    {t("listSpaceModal.alreadyLoggedInDirect")} →
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
