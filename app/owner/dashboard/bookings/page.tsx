"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function BookingsPage() {
    const [pendingBookings, setPendingBookings] = useState<any[]>([]);
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-8">Loading bookings...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Bookings</h1>
            </div>

            {/* Pending Requests */}
            {pendingBookings.length > 0 ? (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Requests (Action Required)</h2>
                    <div className="grid gap-4">
                        {pendingBookings.map((booking) => (
                            <Card key={booking.id} className="border-yellow-200 bg-yellow-50/30">
                                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-gray-900">{booking.space?.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Requested by: {booking.renter?.name || "Client"}</p>
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
                                                    toast.success('Booking approved!');
                                                    fetchData();
                                                }
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                                        >
                                            Approve
                                        </Button>
                                        
                                        <Button 
                                            variant="outline"
                                            onClick={async () => {
                                                const newStart = prompt('Enter new start time (YYYY-MM-DD HH:mm)');
                                                if (!newStart) return;
                                                const newEnd = prompt('Enter new end time (YYYY-MM-DD HH:mm)');
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
                                                    toast.success('Alternative suggested!');
                                                    fetchData();
                                                }
                                            }}
                                            className="text-xs h-8"
                                        >
                                            Suggest Alternative
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-2xl text-center border border-gray-200">
                    <p className="text-gray-500">No pending booking requests.</p>
                </div>
            )}

            <div className="mt-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Confirmed Bookings History</h2>
                <div className="grid gap-4">
                    {recentBookings.map((booking) => (
                        <Card key={booking.id} className="bg-white border-gray-200">
                            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <p className="font-semibold text-gray-900">{booking.space?.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Booked by: {booking.renter?.name || "Client"}</p>
                                </div>
                                <div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                                        {booking.status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
