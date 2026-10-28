"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/language-context";
import { useSession } from "next-auth/react";
import { CalendarClock, Check, Mail, Phone, User, Wallet, X } from "lucide-react";

function hasBookingProofOfPayment(booking: any): boolean {
    return (
        Boolean(booking?.paymentId && String(booking.paymentId).trim().length > 0) ||
        booking?.transaction?.paymentStatus === "COMPLETED"
    );
}

function getReservationAmount(booking: any): number {
    if (booking?.accessCode === "OWNER_BLOCK") return 0;
    if (typeof booking?.basePrice === "number" && booking.basePrice > 0) {
        return Math.round(booking.basePrice * 100) / 100;
    }
    if (typeof booking?.totalPrice === "number" && booking.totalPrice > 0) {
        const ins = typeof booking?.insurance === "number" && booking.insurance > 0 ? booking.insurance : 0;
        const net = booking.totalPrice - ins;
        return Math.round((net > 0 ? net : booking.totalPrice) * 100) / 100;
    }
    if (booking?.space && booking?.startTime && booking?.endTime) {
        const hours = Math.max(
            1,
            Math.round(
                (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60)
            )
        );
        return booking.isHourly === false && booking.space.dailyRate
            ? booking.space.dailyRate
            : hours * (booking.space.hourlyRate || 0);
    }
    return 0;
}

function formatReservationPeriod(booking: any): string {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    if (booking?.accessCode === "OWNER_BLOCK" || booking?.isHourly === false) {
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
    return `${start.toLocaleString()} - ${end.toLocaleString()}`;
}

function toDateTimeLocalValue(dateStrOrObj: string | Date): string {
    const d = new Date(dateStrOrObj);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function BookingsPage() {
    const [pendingBookings, setPendingBookings] = useState<any[]>([]);
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [suggestingBookingId, setSuggestingBookingId] = useState<string | null>(null);
    const [proposedStart, setProposedStart] = useState<string>("");
    const [proposedEnd, setProposedEnd] = useState<string>("");
    const { t } = useLanguage();
    const { data: session, status } = useSession();

    const sessionRole = (session?.user as any)?.role;
    const sessionUserId = (session?.user as any)?.id;
    const sessionEmail = session?.user?.email?.trim().toLowerCase();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/owner/dashboard-stats");
            if (res.ok) {
                const data = await res.json();
                setPendingBookings(data.pendingBookings || []);
                setRecentBookings(data.bookings || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const openSuggestPanel = (booking: any) => {
        if (suggestingBookingId === booking.id) {
            setSuggestingBookingId(null);
            return;
        }
        setSuggestingBookingId(booking.id);
        setProposedStart(toDateTimeLocalValue(booking.proposedStartTime || booking.startTime));
        setProposedEnd(toDateTimeLocalValue(booking.proposedEndTime || booking.endTime));
    };

    const handleSendSuggestedInterval = async (bookingId: string) => {
        if (!proposedStart || !proposedEnd) {
            toast.error("Please select both start and end date/time");
            return;
        }
        const startObj = new Date(proposedStart);
        const endObj = new Date(proposedEnd);
        if (isNaN(startObj.getTime()) || isNaN(endObj.getTime()) || endObj <= startObj) {
            toast.error("End time must be after start time");
            return;
        }

        const res = await fetch(`/api/owner/bookings/${bookingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "SUGGEST",
                proposedStartTime: startObj.toISOString(),
                proposedEndTime: endObj.toISOString(),
            }),
        });

        if (res.ok) {
            toast.success(t("owner.bookings.suggestedToast"));
            setSuggestingBookingId(null);
            fetchData();
        } else {
            const err = await res.json();
            toast.error(err.error || "Failed to send proposal");
        }
    };

    if (loading) return <div className="p-8">{t("owner.bookings.loading")}</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                    {t("owner.bookings.title")}
                </h1>
            </div>

            {/* Pending Requests */}
            {pendingBookings.length > 0 ? (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">{t("owner.bookings.pendingTitle")}</h2>
                    <div className="grid gap-4">
                        {pendingBookings.map((booking) => {
                            // Strictly only the OWNER profile of this specific space can approve, reject, or propose alternatives (never ADMIN)
                            const canApproveThisBooking =
                                status === "authenticated" &&
                                sessionRole === "OWNER" &&
                                Boolean(
                                    (sessionUserId && booking.space?.ownerId === sessionUserId) ||
                                    (sessionEmail &&
                                        booking.space?.owner?.email?.trim().toLowerCase() === sessionEmail)
                                );

                            const isSuggestOpen = suggestingBookingId === booking.id;
                            const reservationAmount = getReservationAmount(booking);

                            return (
                                <Card key={booking.id} className="border-yellow-200 bg-yellow-50/30">
                                    <CardContent className="p-4 space-y-4">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold text-gray-900">{booking.space?.name}</p>
                                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                                                        {booking.status === "OWNER_PROPOSED"
                                                            ? t("renter.newProposedInterval")
                                                            : t("renter.status.pending")}
                                                    </span>
                                                </div>

                                                {/* Period + Reservation Amount (No Platform Fee) side by side */}
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {formatReservationPeriod(booking)}
                                                    </p>
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-extrabold">
                                                        <Wallet className="w-3.5 h-3.5 text-emerald-700" />
                                                        {t("owner.bookings.reservationAmount")}: {reservationAmount} RON
                                                        <span className="text-[10px] font-bold text-emerald-700">
                                                            ({t("owner.bookings.noPlatformFee")})
                                                        </span>
                                                    </span>
                                                </div>

                                                {booking.status === "OWNER_PROPOSED" &&
                                                    booking.proposedStartTime &&
                                                    booking.proposedEndTime && (
                                                        <p className="text-xs font-bold text-violet-700">
                                                            {t("renter.newProposedInterval")}{" "}
                                                            {new Date(booking.proposedStartTime).toLocaleString()} -{" "}
                                                            {new Date(booking.proposedEndTime).toLocaleString()}
                                                        </p>
                                                    )}

                                                {/* Renter Contact Details */}
                                                <div className="p-2.5 rounded-xl bg-white/90 border border-yellow-200 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                                                    <span className="font-black uppercase tracking-wider text-gray-500 text-[10px]">
                                                        {t("owner.bookings.renterContactTitle")}:
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                                                        <User className="w-3.5 h-3.5 text-violet-600" />
                                                        {booking.renter?.name || booking.renter?.email || "Client"}
                                                    </span>
                                                    {booking.renter?.email && (
                                                        <a
                                                            href={`mailto:${booking.renter.email}`}
                                                            className="inline-flex items-center gap-1 font-mono font-semibold text-blue-700 hover:underline"
                                                        >
                                                            <Mail className="w-3.5 h-3.5 text-blue-600" />
                                                            {booking.renter.email}
                                                        </a>
                                                    )}
                                                    <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
                                                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                                        {booking.renter?.phone ? (
                                                            <a
                                                                href={`tel:${booking.renter.phone}`}
                                                                className="hover:underline text-emerald-800 font-bold"
                                                            >
                                                                {booking.renter.phone}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400">
                                                                {t("owner.bookings.noPhoneProvided")}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            {canApproveThisBooking ? (
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        onClick={async () => {
                                                            const res = await fetch(
                                                                `/api/owner/bookings/${booking.id}`,
                                                                {
                                                                    method: "PATCH",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({ action: "APPROVE" }),
                                                                }
                                                            );
                                                            if (res.ok) {
                                                                toast.success(t("owner.bookings.approvedToast"));
                                                                fetchData();
                                                            } else {
                                                                const err = await res.json();
                                                                toast.error(err.error || "Unauthorized");
                                                            }
                                                        }}
                                                        className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                                                    >
                                                        <Check className="w-3.5 h-3.5 mr-1" />
                                                        {t("admin.verification.approve")}
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        onClick={() => openSuggestPanel(booking)}
                                                        className="text-xs h-8 border-violet-300 text-violet-800 hover:bg-violet-50 font-semibold"
                                                    >
                                                        <CalendarClock className="w-3.5 h-3.5 mr-1.5" />
                                                        {t("owner.bookings.suggestAlternative")}
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        onClick={async () => {
                                                            const res = await fetch(
                                                                `/api/owner/bookings/${booking.id}`,
                                                                {
                                                                    method: "PATCH",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({ action: "REJECT" }),
                                                                }
                                                            );
                                                            if (res.ok) {
                                                                toast.success(t("renter.status.rejected"));
                                                                fetchData();
                                                            } else {
                                                                const err = await res.json();
                                                                toast.error(err.error || "Unauthorized");
                                                            }
                                                        }}
                                                        className="text-xs h-8"
                                                    >
                                                        <X className="w-3.5 h-3.5 mr-1" />
                                                        {t("common.reject")}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-full">
                                                        {t("owner.bookings.onlyOwnerCanApprove")}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Inline Date & Time Interval Picker to Reject Current Slot & Suggest Alternative Interval */}
                                        {canApproveThisBooking && isSuggestOpen && (
                                            <div className="p-3.5 rounded-xl bg-white border border-violet-200 shadow-sm space-y-3">
                                                <div className="text-xs font-extrabold text-violet-900 uppercase tracking-wide flex items-center gap-1.5">
                                                    <CalendarClock className="w-4 h-4 text-violet-600" />
                                                    {t("owner.bookings.suggestAlternative")} — {t("renter.newProposedInterval")}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[11px] font-bold text-gray-600 block mb-1">
                                                            {t("space.start")}
                                                        </label>
                                                        <input
                                                            type="datetime-local"
                                                            value={proposedStart}
                                                            onChange={(e) => setProposedStart(e.target.value)}
                                                            className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs font-semibold"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-bold text-gray-600 block mb-1">
                                                            {t("space.end")}
                                                        </label>
                                                        <input
                                                            type="datetime-local"
                                                            value={proposedEnd}
                                                            onChange={(e) => setProposedEnd(e.target.value)}
                                                            className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs font-semibold"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSuggestingBookingId(null)}
                                                        className="h-8 text-xs"
                                                    >
                                                        {t("common.cancel")}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSendSuggestedInterval(booking.id)}
                                                        className="h-8 text-xs bg-violet-600 hover:bg-violet-700 text-white font-bold"
                                                    >
                                                        {t("owner.bookings.suggestAlternative")}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-2xl text-center border border-gray-200">
                    <p className="text-gray-500">{t("owner.bookings.noPending")}</p>
                </div>
            )}

            <div className="mt-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{t("owner.bookings.historyTitle")}</h2>
                <div className="grid gap-4">
                    {recentBookings.map((booking) => {
                        const isOwnerBlock = booking.accessCode === "OWNER_BLOCK";
                        const isRejected = booking.status === "REJECTED" || booking.status === "CANCELLED";
                        const hasProof = !isOwnerBlock && !isRejected && hasBookingProofOfPayment(booking);
                        const proofRef = booking.paymentId || booking.transaction?.stripePaymentId;
                        const reservationAmount = getReservationAmount(booking);

                        return (
                            <Card
                                key={booking.id}
                                className={
                                    isOwnerBlock || isRejected
                                        ? "bg-red-50/40 border-red-200"
                                        : hasProof
                                        ? "bg-emerald-50/30 border-emerald-200"
                                        : "bg-white border-gray-200"
                                }
                            >
                                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-2">
                                        <p className="font-semibold text-gray-900">{booking.space?.name}</p>

                                        {/* Period + Reservation Amount (Platform Fee Removed) side by side */}
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <p className="text-sm font-medium text-gray-700">
                                                {formatReservationPeriod(booking)}
                                            </p>
                                            {!isOwnerBlock && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-extrabold">
                                                    <Wallet className="w-3.5 h-3.5 text-emerald-700" />
                                                    {t("owner.bookings.reservationAmount")}: {reservationAmount} RON
                                                    <span className="text-[10px] font-bold text-emerald-700">
                                                        ({t("owner.bookings.noPlatformFee")})
                                                    </span>
                                                </span>
                                            )}
                                        </div>

                                        {isOwnerBlock ? (
                                            <p className="text-xs text-red-700 font-semibold">
                                                {`${t("card.occupied100")} • ${t("card.otherSources")} (${t("card.notAvailable")})`}
                                            </p>
                                        ) : (
                                            /* Renter Contact Details for Confirmed / Reserved Space */
                                            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                                                <span className="font-black uppercase tracking-wider text-gray-500 text-[10px]">
                                                    {t("owner.bookings.renterContactTitle")}:
                                                </span>
                                                <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                                                    <User className="w-3.5 h-3.5 text-violet-600" />
                                                    {booking.renter?.name || booking.renter?.email || "Client"}
                                                </span>
                                                {booking.renter?.email && (
                                                    <a
                                                        href={`mailto:${booking.renter.email}`}
                                                        className="inline-flex items-center gap-1 font-mono font-semibold text-blue-700 hover:underline"
                                                    >
                                                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                                                        {booking.renter.email}
                                                    </a>
                                                )}
                                                <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
                                                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                                    {booking.renter?.phone ? (
                                                        <a
                                                            href={`tel:${booking.renter.phone}`}
                                                            className="hover:underline text-emerald-800 font-bold"
                                                        >
                                                            {booking.renter.phone}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            {t("owner.bookings.noPhoneProvided")}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        {hasProof && proofRef && (
                                            <p className="text-xs font-mono font-bold text-emerald-700">
                                                {t("renter.proofLabel")} {proofRef}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span
                                            className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                isOwnerBlock || isRejected
                                                    ? "bg-red-100 text-red-800 border border-red-200"
                                                    : hasProof
                                                    ? "bg-emerald-600 text-white"
                                                    : "bg-blue-100 text-blue-800 border border-blue-200"
                                            }`}
                                        >
                                            {isOwnerBlock
                                                ? `${t("card.occupied100")} • ${t("card.otherSources")}`
                                                : isRejected
                                                ? t("renter.status.rejected")
                                                : hasProof
                                                ? t("renter.status.reserved")
                                                : booking.status === "CONFIRMED"
                                                ? t("renter.status.approved")
                                                : booking.status}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
