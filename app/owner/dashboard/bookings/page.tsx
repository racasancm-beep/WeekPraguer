"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/language-context";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    Calendar,
    CalendarClock,
    Check,
    ChevronDown,
    ChevronUp,
    Mail,
    Phone,
    User,
    X,
    MessageSquare,
    CreditCard,
    UploadCloud,
    CheckCircle2,
} from "lucide-react";
import { BookingPriceBreakdown } from "@/components/booking/booking-price-breakdown";

function hasBookingProofOfPayment(booking: any): boolean {
    return (
        Boolean(booking?.paymentId && String(booking.paymentId).trim().length > 0) ||
        booking?.transaction?.paymentStatus === "COMPLETED"
    );
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
    const [myCustomerBookings, setMyCustomerBookings] = useState<any[]>([]);
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
                setMyCustomerBookings(data.myCustomerBookings || []);
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
                    {sessionRole === "SERVICE_OWNER"
                        ? (t("service.serviceRequests") || "Cereri Servicii")
                        : t("owner.bookings.title")}
                </h1>
            </div>

            {/* Pending Requests */}
            {pendingBookings.length > 0 ? (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        {sessionRole === "SERVICE_OWNER"
                            ? (t("service.pendingServiceRequests") || t("owner.bookings.pendingTitle"))
                            : t("owner.bookings.pendingTitle")}
                    </h2>
                    <div className="grid gap-4">
                        {pendingBookings.map((booking) => {
                            // Strictly only the OWNER or SERVICE_OWNER profile of this specific space/service can approve, reject, or propose alternatives (never ADMIN)
                            const canApproveThisBooking =
                                status === "authenticated" &&
                                (sessionRole === "OWNER" || sessionRole === "SERVICE_OWNER") &&
                                Boolean(
                                    (sessionUserId && booking.space?.ownerId === sessionUserId) ||
                                    (sessionEmail &&
                                        booking.space?.owner?.email?.trim().toLowerCase() === sessionEmail)
                                );

                            const isSuggestOpen = suggestingBookingId === booking.id;

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

                                                {/* Period + Reservation Pricing (15% Platform Fee + 85% Owner Net) */}
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {formatReservationPeriod(booking)}
                                                    </p>
                                                    {booking.space?.isService ? (
                                                        <span className="font-black text-xs text-[#008080] px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200">
                                                            {booking.totalPrice} RON
                                                        </span>
                                                    ) : (
                                                        <BookingPriceBreakdown booking={booking} highlightOwnerNet />
                                                    )}
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

                                                    <Link href={`/messages?bookingId=${booking.id}`}>
                                                        <Button
                                                            variant="outline"
                                                            className="text-xs h-8 border-teal-300 text-teal-800 hover:bg-teal-50 font-bold"
                                                        >
                                                            <MessageSquare className="w-3.5 h-3.5 mr-1 text-teal-600" />
                                                            {t("chat.openChatBtn") || "Chat"}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-full">
                                                        {booking.space?.isService
                                                            ? (t("service.onlyServiceOwnerCanApprove") || "Aprobare disponibilă exclusiv în profilul proprietarului serviciului")
                                                            : t("owner.bookings.onlyOwnerCanApprove")}
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
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                    {sessionRole === "SERVICE_OWNER"
                        ? (t("service.confirmedServiceHistory") || t("owner.bookings.historyTitle"))
                        : t("owner.bookings.historyTitle")}
                </h2>
                <div className="grid gap-4">
                    {recentBookings.map((booking) => (
                        <OwnerBookingHistoryItem key={booking.id} booking={booking} />
                    ))}
                </div>
            </div>

            {/* My Customer Bookings for Other Spaces / Services */}
            {myCustomerBookings.length > 0 && (
                <div className="mt-12 pt-8 border-t-2 border-dashed border-teal-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="p-1.5 rounded-lg bg-teal-100 text-[#008080]">
                                    <User className="w-5 h-5" />
                                </span>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                    {t("owner.bookings.myCustomerBookingsTitle") || "Rezervările mele pentru alte spații (Ca Client)"}
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300 text-[10px] font-black uppercase tracking-wider">
                                    {t("owner.bookings.asCustomerBadge") || "CA CLIENT"}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                {t("owner.bookings.myCustomerBookingsDesc") || "Rezervări create de tine pentru alte spații sau servicii de pe platformă. Gestionează plata și comunică direct cu gazda pe chat."}
                            </p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-teal-50 text-[#008080] border border-teal-200 text-xs font-bold w-fit">
                            {myCustomerBookings.length} {t("renter.bookingsCount") || "rezervări"}
                        </span>
                    </div>

                    <div className="grid gap-4">
                        {myCustomerBookings.map((booking) => (
                            <OwnerCustomerBookingCard key={booking.id} booking={booking} onUpdate={fetchData} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function OwnerBookingHistoryItem({ booking }: { booking: any }) {
    const { t } = useLanguage();
    const isService = Boolean(booking.space?.isService);
    const isOwnerBlock = booking.accessCode === "OWNER_BLOCK";
    const isRejected = booking.status === "REJECTED" || booking.status === "CANCELLED";
    const hasProof = !isOwnerBlock && !isRejected && hasBookingProofOfPayment(booking);
    const proofRef = booking.paymentId || booking.transaction?.stripePaymentId;
    const isConfirmed = !isOwnerBlock && !isRejected && (booking.status === "CONFIRMED" || booking.status === "COMPLETED" || hasProof);

    const [isExpanded, setIsExpanded] = useState(false);

    const statusBadgeText = isOwnerBlock
        ? `${t("card.occupied100")} • ${t("card.otherSources")}`
        : isRejected
        ? t("renter.status.rejected")
        : isService && (booking.status === "CONFIRMED" || booking.status === "COMPLETED")
        ? (t("service.statusConfirmed") || "SERVICIU CONFIRMAT")
        : hasProof
        ? t("renter.status.reserved")
        : booking.status === "CONFIRMED"
        ? t("renter.status.approved")
        : booking.status;

    const badgeClassName = `px-3 py-1 text-xs font-bold rounded-full ${
        isOwnerBlock || isRejected
            ? "bg-red-100 text-red-800 border border-red-200"
            : isService && (booking.status === "CONFIRMED" || booking.status === "COMPLETED")
            ? "bg-teal-600 text-white"
            : hasProof
            ? "bg-emerald-600 text-white"
            : "bg-blue-100 text-blue-800 border border-blue-200"
    }`;

    // Small collapsed view at beginning for confirmed rented spaces
    if (isConfirmed && !isExpanded) {
        return (
            <Card
                onClick={() => setIsExpanded(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsExpanded(true);
                    }
                }}
                className={`cursor-pointer transition-all hover:shadow-md hover:border-violet-300 group ${
                    isService && (booking.status === "CONFIRMED" || booking.status === "COMPLETED")
                        ? "bg-teal-50/30 border-teal-200"
                        : hasProof
                        ? "bg-emerald-50/30 border-emerald-200"
                        : "bg-white border-blue-200"
                }`}
            >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
                        <div className="font-bold text-base text-gray-900 group-hover:text-[#008080] transition-colors truncate">
                            {booking.space?.name}
                        </div>
                        <div className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>{formatReservationPeriod(booking)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
                        {!isService && booking.cancellationPolicy && (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                                booking.cancellationPolicy === "NON_REFUNDABLE"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : booking.cancellationPolicy === "MODERATE"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}>
                                <span>{booking.cancellationPolicy === "NON_REFUNDABLE" ? "🔴" : booking.cancellationPolicy === "MODERATE" ? "🟡" : "🟢"}</span>
                                <span>
                                    {booking.cancellationPolicy === "NON_REFUNDABLE"
                                        ? (t("policy.nonRefundable.title") || "Nerambursabil")
                                        : booking.cancellationPolicy === "MODERATE"
                                        ? (t("policy.moderate.title") || "Moderat")
                                        : (t("policy.flexible.title") || "Flexibil")}
                                </span>
                            </span>
                        )}
                        <span className={badgeClassName}>{statusBadgeText}</span>
                        <div className="p-1.5 rounded-full bg-gray-100 group-hover:bg-[#008080] group-hover:text-white text-gray-500 transition-colors">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className={
                isOwnerBlock || isRejected
                    ? "bg-red-50/40 border-red-200"
                    : isService && (booking.status === "CONFIRMED" || booking.status === "COMPLETED")
                    ? "bg-teal-50/30 border-teal-200"
                    : hasProof
                    ? "bg-emerald-50/30 border-emerald-200"
                    : "bg-white border-gray-200"
            }
        >
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                    <p className="font-semibold text-gray-900">{booking.space?.name}</p>

                    {/* Period + Reservation Pricing (Owner Price + Platform Fee) */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <p className="text-sm font-medium text-gray-700">
                            {formatReservationPeriod(booking)}
                        </p>
                        {!isOwnerBlock && (
                            booking.space?.isService ? (
                                <span className="font-black text-xs text-[#008080] px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200">
                                    {booking.totalPrice} RON
                                </span>
                            ) : (
                                <BookingPriceBreakdown booking={booking} highlightOwnerNet />
                            )
                        )}
                    </div>

                    {isOwnerBlock ? (
                        <p className="text-xs text-red-700 font-semibold">
                            {`${t("card.occupied100")} • ${t("card.otherSources")} (${t("card.notAvailable")})`}
                        </p>
                    ) : (
                        /* Customer Contact Details for Confirmed / Reserved Space */
                        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                            <span className="font-black uppercase tracking-wider text-gray-500 text-[10px]">
                                {t("owner.bookings.renterContactTitle")}:
                            </span>
                            <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                                <User className="w-3.5 h-3.5 text-violet-600" />
                                {booking.renter?.name || booking.renter?.email || "Customer"}
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
                    <span className={badgeClassName}>{statusBadgeText}</span>
                    {isConfirmed && (
                        <Link href={`/messages?bookingId=${booking.id}`}>
                            <Button size="sm" variant="outline" className="h-8 text-xs font-bold text-teal-800 border-teal-200 hover:bg-teal-50 shadow-sm">
                                <MessageSquare className="w-3.5 h-3.5 mr-1 text-teal-600" />
                                {t("chat.openChatBtn") || "Chat Client"}
                            </Button>
                        </Link>
                    )}
                    {isConfirmed && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsExpanded(false)}
                            className="h-8 text-xs font-bold gap-1 text-gray-600 hover:text-gray-900 border-gray-300"
                        >
                            <ChevronUp className="w-4 h-4" />
                            <span className="hidden sm:inline">{t("common.hideDetails")}</span>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function OwnerCustomerBookingCard({ booking, onUpdate }: { booking: any; onUpdate: () => void }) {
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"CARD_STRIPE" | "BANK_TRANSFER" | "INVOICE">("CARD_STRIPE");
    const [proofReference, setProofReference] = useState("");
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [submittingProof, setSubmittingProof] = useState(false);

    const isService = Boolean(booking.space?.isService);
    const hasProof = hasBookingProofOfPayment(booking);
    const isReserved = !isService && (booking.status === "CONFIRMED" || booking.status === "COMPLETED") && hasProof;
    const isConfirmedAwaitingPayment = !isService && booking.status === "CONFIRMED" && !hasProof;
    const isServiceConfirmed = isService && (booking.status === "CONFIRMED" || booking.status === "COMPLETED");
    const isPending = booking.status === "PENDING";
    const isOwnerProposed = booking.status === "OWNER_PROPOSED";
    const isRejected = booking.status === "REJECTED" || booking.status === "CANCELLED";

    const handleAction = async (action: "approve" | "reject") => {
        try {
            const res = await fetch(`/api/renter/bookings/${booking.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (res.ok) {
                toast.success(action === "approve" ? (t("renter.acceptedToast") || "Ați acceptat noul interval propus") : (t("renter.rejectedToast") || "Ați respins propunerea"));
                onUpdate();
            } else {
                const err = await res.json();
                toast.error(err.error || "Acțiunea a eșuat");
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
                toast.success(t("renter.proofSubmittedToast") || "Dovada de plată a fost trimisă cu succes!");
                onUpdate();
            } else {
                const err = await res.json();
                toast.error(err.error || "Eroare la trimiterea dovezii de plată");
            }
        } catch (e) {
            toast.error("Eroare la trimiterea dovezii de plată");
        } finally {
            setSubmittingProof(false);
        }
    };

    const statusBadgeText = isPending
        ? t("renter.status.pending")
        : isOwnerProposed
        ? t("renter.newProposedInterval")
        : isServiceConfirmed
        ? (t("service.statusConfirmed") || "SERVICIU CONFIRMAT")
        : isConfirmedAwaitingPayment
        ? t("renter.status.approved")
        : isReserved
        ? t("renter.status.reserved")
        : isRejected
        ? t("renter.status.rejected")
        : booking.status;

    const badgeClassName = `px-3 py-1 text-xs font-bold rounded-full ${
        isRejected
            ? "bg-red-100 text-red-800 border border-red-200"
            : isOwnerProposed
            ? "bg-purple-100 text-purple-800 border border-purple-200"
            : isPending
            ? "bg-amber-100 text-amber-800 border border-amber-200"
            : isServiceConfirmed
            ? "bg-teal-600 text-white"
            : isReserved
            ? "bg-emerald-600 text-white"
            : "bg-blue-100 text-blue-800 border border-blue-200"
    }`;

    // Collapsed quick summary card
    if (!isExpanded) {
        return (
            <Card
                onClick={() => setIsExpanded(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsExpanded(true);
                    }
                }}
                className="cursor-pointer transition-all hover:shadow-md hover:border-teal-400 group bg-white border border-teal-200"
            >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
                        <div className="font-bold text-base text-gray-900 group-hover:text-[#008080] transition-colors truncate">
                            {booking.space?.name}
                        </div>
                        <div className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>{formatReservationPeriod(booking)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
                        {!isService && booking.cancellationPolicy && (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                                booking.cancellationPolicy === "NON_REFUNDABLE"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : booking.cancellationPolicy === "MODERATE"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}>
                                <span>{booking.cancellationPolicy === "NON_REFUNDABLE" ? "🔴" : booking.cancellationPolicy === "MODERATE" ? "🟡" : "🟢"}</span>
                                <span>
                                    {booking.cancellationPolicy === "NON_REFUNDABLE"
                                        ? (t("policy.nonRefundable.title") || "Nerambursabil")
                                        : booking.cancellationPolicy === "MODERATE"
                                        ? (t("policy.moderate.title") || "Moderat")
                                        : (t("policy.flexible.title") || "Flexibil")}
                                </span>
                            </span>
                        )}
                        <span className={badgeClassName}>{statusBadgeText}</span>
                        <Link
                            href={`/messages?bookingId=${booking.id}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs font-bold text-teal-800 border-teal-300 hover:bg-teal-50 shadow-sm"
                            >
                                <MessageSquare className="w-3.5 h-3.5 mr-1 text-teal-600" />
                                {t("chat.openChatBtn") || "Booking Chat"}
                            </Button>
                        </Link>
                        <div className="p-1.5 rounded-full bg-teal-50 group-hover:bg-[#008080] group-hover:text-white text-teal-700 transition-colors">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white border-2 border-teal-200 shadow-sm">
            <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href={booking.space?.isService ? `/services/${booking.spaceId}` : `/spaces/${booking.spaceId}`}
                                className="font-bold text-lg text-gray-900 hover:text-[#008080] hover:underline"
                            >
                                {booking.space?.name}
                            </Link>
                            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300 text-[10px] font-black uppercase tracking-wider">
                                {t("owner.bookings.asCustomerBadge") || "CA CLIENT"}
                            </span>
                        </div>

                        {/* Period + Pricing */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <p className="text-sm font-medium text-gray-700">
                                {formatReservationPeriod(booking)}
                            </p>
                            {booking.space?.isService ? (
                                <span className="font-black text-xs text-[#008080] px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200">
                                    {booking.totalPrice} RON
                                </span>
                            ) : (
                                <BookingPriceBreakdown booking={booking} />
                            )}
                        </div>

                        {/* HOST CONTACT DETAILS */}
                        <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                            <span className="font-black uppercase tracking-wider text-teal-900 text-[10px]">
                                {t("owner.bookings.hostContactTitle") || "HOST CONTACT DETAILS"}:
                            </span>
                            <span className="inline-flex items-center gap-1 font-bold text-gray-900">
                                <User className="w-3.5 h-3.5 text-teal-700" />
                                {booking.space?.owner?.name || booking.space?.owner?.email || "Host"}
                            </span>
                            {booking.space?.owner?.email && (
                                <a
                                    href={`mailto:${booking.space.owner.email}`}
                                    className="inline-flex items-center gap-1 font-mono font-semibold text-blue-700 hover:underline"
                                >
                                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                                    {booking.space.owner.email}
                                </a>
                            )}
                            <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                {booking.space?.owner?.phone ? (
                                    <a
                                        href={`tel:${booking.space.owner.phone}`}
                                        className="hover:underline text-emerald-800 font-bold"
                                    >
                                        {booking.space.owner.phone}
                                    </a>
                                ) : (
                                    <span className="text-gray-400">
                                        {t("owner.bookings.noPhoneProvided") || "No phone provided"}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {!isService && booking.cancellationPolicy && (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                                booking.cancellationPolicy === "NON_REFUNDABLE"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : booking.cancellationPolicy === "MODERATE"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}>
                                <span>{booking.cancellationPolicy === "NON_REFUNDABLE" ? "🔴" : booking.cancellationPolicy === "MODERATE" ? "🟡" : "🟢"}</span>
                                <span>
                                    {booking.cancellationPolicy === "NON_REFUNDABLE"
                                        ? (t("policy.nonRefundable.title") || "Nerambursabil")
                                        : booking.cancellationPolicy === "MODERATE"
                                        ? (t("policy.moderate.title") || "Moderat")
                                        : (t("policy.flexible.title") || "Flexibil")}
                                </span>
                            </span>
                        )}
                        <span className={badgeClassName}>{statusBadgeText}</span>
                        <Link href={`/messages?bookingId=${booking.id}`}>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs font-bold text-teal-800 border-teal-300 hover:bg-teal-50 shadow-sm"
                            >
                                <MessageSquare className="w-3.5 h-3.5 mr-1 text-teal-600" />
                                {t("chat.openChatBtn") || "Booking Chat"}
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsExpanded(false)}
                            className="h-8 text-xs font-bold gap-1 text-gray-600 hover:text-gray-900 border-gray-300"
                        >
                            <ChevronUp className="w-4 h-4" />
                            <span className="hidden sm:inline">{t("common.hideDetails")}</span>
                        </Button>
                    </div>
                </div>

                {/* Host Proposed Alternative Interval */}
                {isOwnerProposed && booking.proposedStartTime && booking.proposedEndTime && (
                    <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs font-semibold text-purple-900 space-y-1">
                            <span className="font-extrabold uppercase tracking-wide block">
                                {t("renter.newProposedInterval")}:
                            </span>
                            <span className="font-mono font-bold text-sm text-purple-950">
                                {new Date(booking.proposedStartTime).toLocaleString()} - {new Date(booking.proposedEndTime).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                onClick={() => handleAction("approve")}
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                                <Check className="w-3.5 h-3.5 mr-1" />
                                {t("renter.acceptProposal") || "Acceptă Noul Interval"}
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleAction("reject")}
                                className="h-8 text-xs"
                            >
                                <X className="w-3.5 h-3.5 mr-1" />
                                {t("common.reject")}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Confirmed Awaiting Payment: Payment proof upload & submission */}
                {isConfirmedAwaitingPayment && (
                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-black uppercase tracking-wide text-blue-900">
                                {t("renter.payDirectTitle") || "Finalizare Plată Rezervare"}
                            </span>
                        </div>
                        <p className="text-xs text-blue-800">
                            {t("renter.confirmedNotificationBody") || "Gazda a aprobat cererea ta. Te rugăm să introduci numărul tranzacției sau să transmiți dovada de plată."}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                                    {t("renter.selectPaymentMethod") || "Metodă de plată"}
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                                    className="w-full h-8 text-xs font-semibold px-2 rounded-lg border border-gray-300 bg-white"
                                >
                                    <option value="CARD_STRIPE">{t("renter.payMethodCard") || "Card Bancar (Stripe)"}</option>
                                    <option value="BANK_TRANSFER">{t("renter.payMethodTransfer") || "Transfer Bancar (OP)"}</option>
                                    <option value="INVOICE">{t("renter.payMethodInvoice") || "Factură Fiscală"}</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                                    {t("renter.proofRefLabel") || "Referință plată / ID tranzacție"}
                                </label>
                                <input
                                    type="text"
                                    value={proofReference}
                                    onChange={(e) => setProofReference(e.target.value)}
                                    placeholder={t("renter.proofPlaceholder") || "Ex: OP-2026-98124 sau Stripe ID"}
                                    className="w-full h-8 text-xs font-semibold px-3 rounded-lg border border-gray-300 bg-white"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <label className="cursor-pointer inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-semibold">
                                <UploadCloud className="w-3.5 h-3.5" />
                                <span>{uploadedFileName || t("renter.uploadReceipt") || "Atașează chitanță/OP"}</span>
                                <input type="file" onChange={handleProofFileUpload} className="hidden" />
                            </label>
                            <Button
                                size="sm"
                                disabled={submittingProof}
                                onClick={handleSubmitProofOfPayment}
                                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
                            >
                                {submittingProof ? t("common.loading") : (t("renter.submitProofBtn") || "Trimite Dovada de Plată")}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Reserved / Proof of payment info */}
                {hasProof && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-emerald-900 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>{t("renter.proofLabel") || "Dovadă înregistrată:"} {booking.paymentId || booking.transaction?.stripePaymentId}</span>
                        </div>
                        {booking.accessCode && booking.accessCode !== "OWNER_BLOCK" && (
                            <div className="font-mono font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                                PIN: {booking.accessCode}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
