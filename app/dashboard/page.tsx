"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function RenterDashboard() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch("/api/renter/bookings");
            if (res.ok) {
                const data = await res.json();
                setBookings(data.bookings || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading bookings...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">My Trips</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Manage and view your upcoming weekend stays.</p>
                </div>
                <Link href="/explore">
                    <Button size="lg" className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 dark:shadow-none rounded-2xl px-8">
                        <Search className="w-4 h-4 mr-2" />
                        Find a Space
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                {bookings.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <h3 className="text-xl font-medium mb-2">No bookings yet</h3>
                        <p className="text-muted-foreground mb-4">Find your perfect weekend workspace.</p>
                        <Link href="/explore">
                            <Button variant="outline">Browse Spaces</Button>
                        </Link>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <Card key={booking.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle>{booking.space.name}</CardTitle>
                                <Badge variant={booking.status === "CONFIRMED" ? "default" : "destructive"}>
                                    {booking.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date</p>
                                        <p className="font-medium">
                                            {new Date(booking.startTime).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Address</p>
                                        <p>{booking.space.address}, {booking.space.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Paid</p>
                                        <p>{booking.totalPrice} CZK</p>
                                    </div>
                                    <div className="flex items-end justify-end">
                                        {booking.status === "COMPLETED" && (
                                            <Button variant="secondary" size="sm">Leave Review</Button>
                                        )}
                                        {booking.status === "CONFIRMED" && (
                                            <Button variant="outline" size="sm">View Contract</Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
