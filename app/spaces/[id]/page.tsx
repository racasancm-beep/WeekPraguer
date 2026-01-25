"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, isWeekend } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AMENITIES } from "@/lib/constants";
import { useSession } from "next-auth/react";

interface SpaceDetailed {
    id: string;
    name: string;
    description: string;
    city: string;
    address: string;
    hourlyRate: number;
    dailyRate: number;
    weekendRate: number;
    amenitiesList: string; // JSON string
    photos: { url: string }[];
}

export default function SpaceDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [space, setSpace] = useState<SpaceDetailed | null>(null);
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        if (id) fetchSpace();
    }, [id]);

    const fetchSpace = async () => {
        try {
            const res = await fetch(`/api/spaces/${id}`);
            if (!res.ok) throw new Error("Space not found");
            const data = await res.json();
            setSpace(data);

            // Fetch existing bookings for this space
            const bookingsRes = await fetch(`/api/spaces/${id}/bookings`);
            if (bookingsRes.ok) {
                const bData = await bookingsRes.json();
                const dates = bData.map((b: any) => new Date(b.startTime));
                setBookedDates(dates);
            }
        } catch (error) {
            toast.error("Failed to load space");
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        if (!session) {
            router.push("/login");
            return;
        }
        if (!date) return;
        if (!agreed) {
            toast.error("You must agree to the contract terms.");
            return;
        }

        setBookingLoading(true);
        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    spaceId: id,
                    startTime: date.toISOString(),
                    isHourly: false,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Booking failed");

            toast.success("Booking Request Sent!");
            router.push("/dashboard");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!space) return <div>Space not found</div>;

    const amenities = JSON.parse(space.amenitiesList || "[]");

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
            {/* Left: Details */}
            <div>
                <h1 className="text-4xl font-bold mb-2">{space.name}</h1>
                <p className="text-muted-foreground mb-4">{space.city}, {space.address}</p>

                <div className="bg-muted h-64 rounded-lg mb-6 flex items-center justify-center">
                    {space.photos?.[0] ? <img src={space.photos[0].url} alt="Space" className="w-full h-full object-cover rounded-lg" /> : "No Image"}
                </div>

                <div className="prose mb-6">
                    <h3 className="text-xl font-semibold">About this space</h3>
                    <p>{space.description}</p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                        {amenities.map((a: string) => {
                            const am = AMENITIES.find(item => item.id === a);
                            return <span key={a} className="px-3 py-1 bg-secondary rounded-full text-sm">{am?.label || a}</span>
                        })}
                    </div>
                </div>
            </div>

            {/* Right: Booking Card */}
            <div>
                <div className="p-6 border rounded-xl shadow-lg sticky top-8 bg-card">
                    <h3 className="text-2xl font-bold mb-4">{space.weekendRate} CZK <span className="text-base font-normal text-muted-foreground">/ weekend</span></h3>

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Select Date</label>
                        <div className="border rounded-md p-2 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(d) => {
                                    const day = d.getDay();
                                    const isEnabledDay = day === 0 || day === 5 || day === 6; // Sun, Fri, Sat
                                    return (
                                        !isEnabledDay ||
                                        d < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                        bookedDates.some(booked =>
                                            booked.getDate() === d.getDate() &&
                                            booked.getMonth() === d.getMonth() &&
                                            booked.getFullYear() === d.getFullYear()
                                        )
                                    );
                                }}
                                className="rounded-md border"
                            />
                        </div>
                        <div className="mt-2 space-y-1 text-center">
                            <p className="text-sm text-muted-foreground">
                                Only Fridays, Saturdays, and Sundays available.
                            </p>
                            <p className="text-xs font-semibold text-violet-600">
                                * Friday bookings start from 18:00 (6 PM)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                        <input
                            type="checkbox"
                            id="contract"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor="contract" className="text-sm text-gray-600">
                            I agree to the <a
                                href={`/api/bookings/contract-preview?spaceName=${encodeURIComponent(space.name)}&price=${space.weekendRate}&date=${date?.toDateString()}`}
                                target="_blank"
                                className="underline cursor-pointer text-blue-600"
                            >
                                Digital Contract
                            </a>
                        </label>
                    </div>

                    <Button className="w-full" size="lg" onClick={handleBook} disabled={bookingLoading || !date}>
                        {bookingLoading ? "Processing..." : "Reserve"}
                    </Button>
                    <p className="text-xs text-center mt-4 text-muted-foreground">You won't be charged yet.</p>
                </div>
            </div>
        </div>
    );
}
