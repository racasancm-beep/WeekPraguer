"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Bell,
    Clock,
    CheckCircle2,
    CreditCard,
    FileCheck2,
    ShieldCheck,
    Upload,
    KeyRound,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import { toast } from "sonner";

function hasBookingProofOfPayment(booking: any): boolean {
    return (
        Boolean(booking?.paymentId && String(booking.paymentId).trim().length > 0) ||
        booking?.transaction?.paymentStatus === "COMPLETED"
    );
}

export default function RenterDashboard() {
    const { t } = useLanguage();
    return (
        <Suspense fallback={<div className="p-8">{t("owner.bookings.loading")}</div>}>
            <RenterDashboardContent />
        </Suspense>
    );
}

function RenterDashboardContent() {
    const searchParams = useSearchParams();
    const userId = searchParams?.get("userId");
    const { t } = useLanguage();

    const [bookings, setBookings] = useState<any[]>([]);
    const [inspectedUser, setInspectedUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const notifiedIdsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        fetchBookings();
    }, [userId]);

    const fetchBookings = async () => {
        try {
            const url = userId
                ? `/api/renter/bookings?userId=${encodeURIComponent(userId)}`
                : "/api/renter/bookings";
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                const list: any[] = data.bookings || [];
                setBookings(list);
                setInspectedUser(data.inspectedUser || null);

                // Notify renter when a booking has been approved by owner and is awaiting payment
                list.forEach((b) => {
                    if (
                        b.status === "CONFIRMED" &&
                        !hasBookingProofOfPayment(b) &&
                        !notifiedIdsRef.current.has(b.id)
                    ) {
                        notifiedIdsRef.current.add(b.id);
                        toast.info(
                            `${b.space?.name || "Space"}: ${t("renter.status.approved")}`
                        );
                    }
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>{t("owner.bookings.loading")}</div>;

    const confirmedAwaitingPayment = bookings.filter(
        (b) => b.status === "CONFIRMED" && !hasBookingProofOfPayment(b)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {inspectedUser && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-gray-950 px-2 py-0.5 rounded-full">
                            {t("owner.earnings.adminAccess")}
                        </span>
                        <h2 className="text-lg font-bold text-gray-900 mt-1">
                            {t("renter.viewingProfile")}: {inspectedUser.name || inspectedUser.email} ({inspectedUser.email})
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/dashboard">
                            <Button size="sm" variant="outline">{t("renter.viewAllCombined")}</Button>
                        </Link>
                        <Link href="/admin/dashboard">
                            <Button size="sm" className="bg-gray-900 text-white">{t("owner.backToAdminHub")}</Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Renter Notification Banner when Owner approves a reservation request */}
            {confirmedAwaitingPayment.length > 0 && (
                <div className="p-5 rounded-2xl bg-blue-50 border-2 border-blue-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                            <Bell className="w-5 h-5 animate-bounce" />
                        </div>
                        <div>
                            <div className="text-sm font-black text-blue-950 uppercase tracking-wide">
                                {t("renter.confirmedNotificationTitle")}
                            </div>
                            <p className="text-xs sm:text-sm text-blue-900 mt-1 font-medium">
                                {t("renter.confirmedNotificationBody")}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {confirmedAwaitingPayment.map((b) => (
                                    <span
                                        key={b.id}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-xs font-extrabold text-blue-900"
                                    >
                                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                                        {b.space?.name} — {b.totalPrice} RON ({t("renter.status.approved")})
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        {inspectedUser ? `${inspectedUser.name || inspectedUser.email} — ${t("renter.title")}` : t("renter.title")}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        {t("renter.subtitle")} ({bookings.length}).
                    </p>
                </div>
                <Link href="/explore">
                    <Button size="lg" className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 dark:shadow-none rounded-2xl px-8">
                        <Search className="w-4 h-4 mr-2" />
                        {t("renter.findSpace")}
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                {bookings.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <h3 className="text-xl font-medium mb-2">{t("renter.noBookingsTitle")}</h3>
                        <p className="text-muted-foreground mb-4">{t("renter.noBookingsDesc")}</p>
                        <Link href="/explore">
                            <Button variant="outline">{t("renter.browseSpaces")}</Button>
                        </Link>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <BookingClientCard key={booking.id} booking={booking} onUpdate={fetchBookings} />
                    ))
                )}
            </div>
        </div>
    );
}

function BookingClientCard({ booking, onUpdate }: { booking: any; onUpdate: () => void }) {
    const { t } = useLanguage();
    const [paymentMethod, setPaymentMethod] = useState<"CARD_STRIPE" | "BANK_TRANSFER" | "INVOICE">("CARD_STRIPE");
    const [proofReference, setProofReference] = useState("");
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [submittingProof, setSubmittingProof] = useState(false);

    const hasProof = hasBookingProofOfPayment(booking);
    const isReserved = (booking.status === "CONFIRMED" || booking.status === "COMPLETED") && hasProof;
    const isConfirmedAwaitingPayment = booking.status === "CONFIRMED" && !hasProof;
    const isPending = booking.status === "PENDING";
    const isRejected = booking.status === "REJECTED" || booking.status === "CANCELLED";

    const handleAction = async (action: "approve" | "reject") => {
        try {
            const res = await fetch(`/api/renter/bookings/${booking.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (res.ok) {
                onUpdate();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleProofFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedFileName(file.name);
        if (!proofReference.trim()) {
            setProofReference(`RECEIPT-${file.name}`);
        }
    };

    const handleSubmitProofOfPayment = async () => {
        const finalProof =
            proofReference.trim() ||
            (uploadedFileName ? `RECEIPT-${uploadedFileName}` : `PAY-${Date.now().toString().slice(-6)}`);

        setSubmittingProof(true);
        try {
            const res = await fetch(`/api/renter/bookings/${booking.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "submit_payment_proof",
                    paymentMethod,
                    proofOfPayment: finalProof,
                }),
            });

            if (res.ok) {
                toast.success(t("renter.proofSubmittedToast"));
                onUpdate();
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to submit proof of payment");
            }
        } catch (e) {
            toast.error("Error submitting proof of payment");
        } finally {
            setSubmittingProof(false);
        }
    };

    let statusText = booking.status;
    if (isPending) statusText = t("renter.status.pending");
    else if (isConfirmedAwaitingPayment) statusText = t("renter.status.approved");
    else if (isReserved) statusText = t("renter.status.reserved");
    else if (isRejected) statusText = t("renter.status.rejected");

    const proofDisplay = booking.paymentId || booking.transaction?.stripePaymentId;

    return (
        <Card
            className={
                isReserved
                    ? "border-2 border-emerald-300 bg-emerald-50/15"
                    : isConfirmedAwaitingPayment
                    ? "border-2 border-blue-300 bg-blue-50/15"
                    : isPending
                    ? "border border-amber-200 bg-amber-50/10"
                    : ""
            }
        >
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
                <div>
                    <CardTitle className="text-xl">{booking.space?.name}</CardTitle>
                    {booking.renter?.email && (
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                            {t("renter.roleBadge")}: {booking.renter.name || booking.renter.email} ({booking.renter.email})
                        </p>
                    )}
                </div>
                <Badge
                    className={
                        isReserved
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1 text-xs font-extrabold uppercase tracking-wide"
                            : isConfirmedAwaitingPayment
                            ? "bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1 text-xs font-extrabold uppercase tracking-wide"
                            : isPending
                            ? "bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wide"
                            : "bg-red-600 text-white px-3.5 py-1 text-xs font-extrabold uppercase tracking-wide"
                    }
                >
                    {statusText}
                </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* 3-Step Reservation Rules Progress Bar */}
                {!isRejected && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                        <div
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold ${
                                isPending
                                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                                    : "bg-emerald-50 text-emerald-800"
                            }`}
                        >
                            <Clock className="w-4 h-4 shrink-0" />
                            <span>{t("renter.step1Label")}</span>
                        </div>
                        <div
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold ${
                                isConfirmedAwaitingPayment
                                    ? "bg-blue-100 text-blue-900 border border-blue-300"
                                    : isReserved
                                    ? "bg-emerald-50 text-emerald-800"
                                    : "text-gray-400"
                            }`}
                        >
                            <CreditCard className="w-4 h-4 shrink-0" />
                            <span>{t("renter.step2Label")}</span>
                        </div>
                        <div
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold ${
                                isReserved
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-gray-400"
                            }`}
                        >
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            <span>{t("renter.step3Label")}</span>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">{t("renter.dateTime")}</p>
                        <p className="font-medium">
                            {new Date(booking.startTime).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                            {new Date(booking.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{t("owner.form.address")}</p>
                        <p>
                            {booking.space?.address}, {booking.space?.city}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            {isReserved ? t("renter.totalPaid") : t("space.estimatedTotal")}
                        </p>
                        <p className="font-black text-lg">{booking.totalPrice} RON</p>
                    </div>
                </div>

                {/* STAGE 1: PENDING FOR CONFIRMATION (Waiting for Owner Approval) */}
                {isPending && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs sm:text-sm text-amber-900 font-semibold">
                        <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                        <span>{t("renter.pendingDesc")}</span>
                    </div>
                )}

                {/* STAGE 2: CONFIRMED BY OWNER -> PLEASE PROCEED WITH PAYMENT (Gateway Ready + Proof of Payment) */}
                {isConfirmedAwaitingPayment && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/90 border border-blue-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-blue-950 font-black text-sm uppercase tracking-wide">
                                <CreditCard className="w-4 h-4 text-blue-700" />
                                {t("renter.proceedPaymentTitle")}
                            </div>
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white text-blue-800 border border-blue-200">
                                {t("renter.paymentGatewayReady")}
                            </span>
                        </div>

                        {/* Payment Method Connection Selector (Ready for Gateway Integration) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("CARD_STRIPE")}
                                className={`px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all ${
                                    paymentMethod === "CARD_STRIPE"
                                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                                }`}
                            >
                                💳 Card / Stripe Gateway
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("BANK_TRANSFER")}
                                className={`px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all ${
                                    paymentMethod === "BANK_TRANSFER"
                                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                                }`}
                            >
                                🏦 Transfer Bancar (OP)
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("INVOICE")}
                                className={`px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all ${
                                    paymentMethod === "INVOICE"
                                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                                }`}
                            >
                                🧾 Factură Fiscală / Chitanță
                            </button>
                        </div>

                        {/* Proof of Payment Input & File Attachment */}
                        <div className="flex flex-col sm:flex-row gap-2.5">
                            <input
                                type="text"
                                value={proofReference}
                                onChange={(e) => setProofReference(e.target.value)}
                                placeholder={t("renter.proofInputPlaceholder")}
                                className="flex-1 h-10 px-3.5 rounded-xl border border-blue-200 bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <label className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-800 text-xs font-bold cursor-pointer shrink-0">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{uploadedFileName || t("renter.uploadProofBtn")}</span>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleProofFileUpload}
                                    className="hidden"
                                />
                            </label>
                            <Button
                                onClick={handleSubmitProofOfPayment}
                                disabled={submittingProof}
                                className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 text-xs sm:text-sm shrink-0"
                            >
                                <FileCheck2 className="w-4 h-4 mr-1.5" />
                                {submittingProof ? t("renter.submittingProof") : t("renter.submitProofBtn")}
                            </Button>
                        </div>
                    </div>
                )}

                {/* STAGE 3: RESERVED (Has Proof of Payment) */}
                {isReserved && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs sm:text-sm font-black text-emerald-950 uppercase tracking-wide">
                                    {t("renter.reservedBadgeDesc")}
                                </div>
                                {proofDisplay && (
                                    <div className="text-xs font-mono font-bold text-emerald-800 mt-0.5">
                                        {t("renter.proofLabel")} {proofDisplay}
                                    </div>
                                )}
                            </div>
                        </div>

                        {booking.accessCode && booking.accessCode !== "OWNER_BLOCK" && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-xs font-black text-emerald-900">
                                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                                {t("renter.accessCodeLabel")} {booking.accessCode}
                            </div>
                        )}
                    </div>
                )}

                {booking.status === "OWNER_PROPOSED" && (
                    <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200">
                        <p className="text-xs font-bold text-amber-700 mb-1">{t("renter.newProposedInterval")}</p>
                        <p className="text-sm">
                            {new Date(booking.proposedStartTime).toLocaleDateString()}{" "}
                            {new Date(booking.proposedStartTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {new Date(booking.proposedEndTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                        <div className="flex gap-2 mt-2">
                            <Button
                                size="sm"
                                onClick={() => handleAction("approve")}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                {t("renter.approve")}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleAction("reject")}>
                                {t("renter.reject")}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
