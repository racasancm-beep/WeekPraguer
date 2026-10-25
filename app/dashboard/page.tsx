"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";

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

    useEffect(() => {
        fetchBookings();
    }, [userId]);

    const fetchBookings = async () => {
        try {
            const url = userId ? `/api/renter/bookings?userId=${encodeURIComponent(userId)}` : "/api/renter/bookings";
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setBookings(data.bookings || []);
                setInspectedUser(data.inspectedUser || null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>{t("owner.bookings.loading")}</div>;

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

function BookingClientCard({ booking, onUpdate }: { booking: any, onUpdate: () => void }) {
    const { t } = useLanguage();

    const handleAction = async (action: 'approve' | 'reject') => {
        try {
            const res = await fetch(`/api/renter/bookings/${booking.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                onUpdate();
            }
        } catch (e) {
            console.error(e);
        }
    };

    let statusText = booking.status;
    if (booking.status === "PENDING") statusText = t("renter.status.pending");
    if (booking.status === "CONFIRMED") statusText = t("renter.status.approved");
    if (booking.status === "REJECTED") statusText = t("renter.status.rejected");

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle>{booking.space?.name}</CardTitle>
                    {booking.renter?.email && (
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                            {t("renter.roleBadge")}: {booking.renter.name || booking.renter.email} ({booking.renter.email})
                        </p>
                    )}
                </div>
                <Badge variant={
                    booking.status === "CONFIRMED" ? "default" :
                    booking.status === "PENDING" ? "secondary" : 
                    "destructive"
                }>
                    {statusText}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">{t("renter.dateTime")}</p>
                        <p className="font-medium">
                            {new Date(booking.startTime).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{t("owner.form.address")}</p>
                        <p>{booking.space?.address}, {booking.space?.city}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{t("renter.totalPaid")}</p>
                        <p className="font-semibold">{booking.totalPrice} RON</p>
                        {booking.status === "PENDING" && (
                            <p className="text-green-600 font-bold text-sm">{t("renter.status.pending")}</p>
                        )}
                    </div>
                    <div className="flex flex-col items-end justify-end gap-2">
                        {booking.status === "OWNER_PROPOSED" && (
                            <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200">
                                <p className="text-xs font-bold text-amber-700 mb-1">{t("renter.newProposedInterval")}</p>
                                <p className="text-sm">
                                    {new Date(booking.proposedStartTime).toLocaleDateString()} {new Date(booking.proposedStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.proposedEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Button size="sm" onClick={() => handleAction('approve')} className="bg-emerald-600 hover:bg-emerald-700">{t("renter.approve")}</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleAction('reject')}>{t("renter.reject")}</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
