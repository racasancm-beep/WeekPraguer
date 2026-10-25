"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/language-context";

export default function BookingsPage() {
    const [pendingBookings, setPendingBookings] = useState<any[]>([]);
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

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

    if (loading) return <div className="p-8">{t("owner.bookings.loading")}</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{t("owner.bookings.title")}</h1>
            </div>

            {/* Pending Requests */}
            {pendingBookings.length > 0 ? (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">{t("owner.bookings.pendingTitle")}</h2>
                    <div className="grid gap-4">
                        {pendingBookings.map((booking) => (
                            <Card key={booking.id} className="border-yellow-200 bg-yellow-50/30">
                                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-gray-900">{booking.space?.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{t("owner.bookings.requestedBy")}: {booking.renter?.name || "Client"}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            onClick={async () => {
                                                const res = await fetch(`/api/owner/bookings/${booking.id}`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ action: 'APPROVE' })
                                                });
                                                if (res.ok) {
                                                    toast.success(t("owner.bookings.approvedToast"));
                                                    fetchData();
                                                }
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                                        >
                                            {t("admin.verification.approve")}
                                        </Button>
                                        
                                        <Button 
                                            variant="outline"
                                            onClick={async () => {
                                                const newStart = prompt('YYYY-MM-DD HH:mm');
                                                if (!newStart) return;
                                                const newEnd = prompt('YYYY-MM-DD HH:mm');
                                                if (!newEnd) return;
                                                
                                                const res = await fetch(`/api/owner/bookings/${booking.id}`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ 
                                                        action: 'SUGGEST',
                                                        proposedStartTime: new Date(newStart),
                                                        proposedEndTime: new Date(newEnd)
                                                    })
                                                });
                                                if (res.ok) {
                                                    toast.success(t("owner.bookings.suggestedToast"));
                                                    fetchData();
                                                }
                                            }}
                                            className="text-xs h-8"
                                        >
                                            {t("owner.bookings.suggestAlternative")}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
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
                        return (
                            <Card key={booking.id} className={isOwnerBlock ? "bg-red-50/40 border-red-200" : "bg-white border-gray-200"}>
                                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-gray-900">{booking.space?.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(booking.startTime).toLocaleDateString()} - {new Date(booking.endTime).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {isOwnerBlock
                                                ? `${t("card.occupied100")} • ${t("card.otherSources")} (${t("card.notAvailable")})`
                                                : `${t("owner.bookings.bookedBy")}: ${booking.renter?.name || "Client"}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                            isOwnerBlock
                                                ? "bg-red-100 text-red-800 border border-red-200"
                                                : "bg-green-100 text-green-800"
                                        }`}>
                                            {isOwnerBlock
                                                ? `${t("card.occupied100")} • ${t("card.otherSources")}`
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
