"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, isWeekend, differenceInHours } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AMENITIES } from "@/lib/constants";
import { useSession } from "next-auth/react";
import { Clock, Calendar as CalendarIcon, Trash2, Sparkles } from "lucide-react";

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

interface BookingSlot {
    date: Date;
    isFullDay: boolean;
    startTime: string; // "HH:mm"
    endTime: string;   // "HH:mm"
}

export default function SpaceDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [space, setSpace] = useState<SpaceDetailed | null>(null);
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [slots, setSlots] = useState<Record<string, BookingSlot>>({});

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

            // Fetch existing bookings
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

    const handleDateSelect = (dates: Date[] | undefined) => {
        const newDates = dates || [];
        setSelectedDates([...newDates]); // Ensure new array reference for re-render

        // Update slots
        setSlots(prev => {
            const next = { ...prev };

            // Add new slots
            newDates.forEach(d => {
                const key = d.toDateString();
                if (!next[key]) {
                    const isFriday = d.getDay() === 5;
                    const isSunday = d.getDay() === 0;
                    next[key] = {
                        date: d,
                        isFullDay: !isFriday,
                        startTime: isFriday ? "18:00" : "09:00",
                        endTime: isFriday ? "22:00" : (isSunday ? "20:00" : "18:00")
                    };
                }
            });

            // Remove unselected slots
            Object.keys(next).forEach(key => {
                if (!newDates.find(d => d.toDateString() === key)) {
                    delete next[key];
                }
            });

            return next;
        });
    };

    const selectWholeWeekend = () => {
        // Find upcoming Friday, Saturday, Sunday
        const today = new Date();
        const nextFri = new Date();
        nextFri.setDate(today.getDate() + ((5 + 7 - today.getDay()) % 7));

        const nextSat = new Date(nextFri);
        nextSat.setDate(nextFri.getDate() + 1);

        const nextSun = new Date(nextFri);
        nextSun.setDate(nextFri.getDate() + 2);

        handleDateSelect([nextFri, nextSat, nextSun]);
    };

    const updateSlot = (key: string, updates: Partial<BookingSlot>) => {
        setSlots(prev => ({
            ...prev,
            [key]: { ...prev[key], ...updates }
        }));
    };

    const calculatePriceBreakdown = () => {
        if (!space) return { base: 0, cleaning: 0, insurance: 0, commission: 0, total: 0 };
        let base = 0;
        Object.values(slots).forEach(slot => {
            if (slot.isFullDay) {
                base += space.dailyRate;
            } else {
                const startHour = parseInt(slot.startTime.split(":")[0]);
                const endHour = parseInt(slot.endTime.split(":")[0]);
                const hours = endHour - startHour;
                base += hours * space.hourlyRate;
            }
        });

        if (base === 0) return { base: 0, cleaning: 0, insurance: 0, commission: 0, total: 0 };

        const cleaning = 500;
        const insurance = base * 0.5;
        const commission = (base + cleaning) * 0.25;
        const total = base + cleaning + insurance + commission;

        return { base, cleaning, insurance, commission, total };
    };

    const handleBook = async () => {
        if (!session) {
            router.push("/login");
            return;
        }
        if (Object.keys(slots).length === 0) {
            toast.error("Please select at least one day.");
            return;
        }
        if (!agreed) {
            toast.error("You must agree to the contract terms.");
            return;
        }

        setBookingLoading(true);
        try {
            // Send all slots as a single request
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    spaceId: id,
                    slots: Object.values(slots).map(s => ({
                        date: format(s.date, "yyyy-MM-dd"),
                        isFullDay: s.isFullDay,
                        startTime: s.startTime,
                        endTime: s.endTime
                    }))
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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!space) return <div className="min-h-screen flex items-center justify-center">Space not found</div>;

    const amenities = JSON.parse(space.amenitiesList || "[]");
    const priceBreakdown = calculatePriceBreakdown();
    const totalPrice = priceBreakdown.total;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-12 gap-12">
            {/* Left Column: Details (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">{space.name}</h1>
                    <p className="text-xl text-muted-foreground">{space.city}, {space.address}</p>
                </div>

                <div className="aspect-video bg-muted rounded-2xl overflow-hidden shadow-inner">
                    {space.photos?.[0] ? (
                        <img src={space.photos[0].url} alt="Space" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Photos Available</div>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-semibold flex items-center gap-2">
                            <Clock className="w-6 h-6 text-violet-600" />
                            About this space
                        </h3>
                        <p className="text-lg text-gray-600 leading-relaxed">{space.description}</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-2xl font-semibold flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-violet-600" />
                            Amenities
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {amenities.map((a: string) => {
                                const am = AMENITIES.find(item => item.id === a);
                                return (
                                    <span key={a} className="px-4 py-2 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-xl text-sm font-medium border border-violet-100 dark:border-violet-800">
                                        {am?.label || a}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Dynamic Booking Card (4 cols) */}
            <div className="lg:col-span-4">
                <div className="p-8 border rounded-3xl shadow-2xl sticky top-24 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 space-y-6">
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{space.hourlyRate} CZK</span>
                            <span className="text-gray-500 mb-1">/ hour</span>
                        </div>
                        <p className="text-sm text-muted-foreground">or {space.dailyRate} CZK / full day</p>
                    </div>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    <div className="space-y-4">
                        <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Pick Dates</label>
                        <div className="border rounded-2xl p-2 bg-gray-50 dark:bg-gray-800/50">
                            <Calendar
                                mode="multiple"
                                selected={selectedDates}
                                onSelect={handleDateSelect}
                                disabled={(d) => {
                                    const day = d.getDay();
                                    const isEnabledDay = day === 0 || day === 5 || day === 6;
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
                                className="scale-95"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-[10px] h-7 border-dashed border-violet-300 text-violet-600 hover:bg-violet-50"
                                onClick={selectWholeWeekend}
                            >
                                <CalendarIcon className="w-3 h-3 mr-1" />
                                Select Entire Next Weekend
                            </Button>
                            <p className="text-[10px] text-center text-violet-600 font-medium">
                                * Fri (18:00 - 22:00), Sat (9:00 - 18:00) & Sun (9:00 - 20:00).
                            </p>
                        </div>
                    </div>

                    {/* Selected Slots Configuration */}
                    {Object.keys(slots).length > 0 && (
                        <div className="space-y-4">
                            <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Customize Booking</label>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                {Object.entries(slots).map(([key, slot]) => (
                                    <div key={key} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold">{format(slot.date, "EEE, MMM do")}</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={slot.isFullDay}
                                                    onChange={(e) => updateSlot(key, { isFullDay: e.target.checked })}
                                                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                                />
                                                <span className="text-xs text-gray-600">Full Day</span>
                                            </div>
                                        </div>

                                        {!slot.isFullDay && (
                                            <div className="flex items-center gap-2 pt-1 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex-1 space-y-1">
                                                    <span className="text-[10px] uppercase text-gray-400">Start</span>
                                                    <select
                                                        value={slot.startTime}
                                                        onChange={(e) => updateSlot(key, { startTime: e.target.value })}
                                                        className="w-full bg-transparent text-xs font-medium focus:ring-0 border-none p-0 cursor-pointer"
                                                    >
                                                        {Array.from({
                                                            length: slot.date.getDay() === 5 ? 4 : (slot.date.getDay() === 0 ? 12 : 14)
                                                        }).map((_, i) => {
                                                            const hour = slot.date.getDay() === 5 ? 18 + i : 8 + i;
                                                            const hStr = `${hour.toString().padStart(2, '0')}:00`;
                                                            return <option key={hStr} value={hStr}>{hStr}</option>
                                                        })}
                                                    </select>
                                                </div>
                                                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
                                                <div className="flex-1 space-y-1">
                                                    <span className="text-[10px] uppercase text-gray-400">End</span>
                                                    <select
                                                        value={slot.endTime}
                                                        onChange={(e) => updateSlot(key, { endTime: e.target.value })}
                                                        className="w-full bg-transparent text-xs font-medium focus:ring-0 border-none p-0 cursor-pointer"
                                                    >
                                                        {Array.from({
                                                            length: slot.date.getDay() === 5 ? 4 : (slot.date.getDay() === 0 ? 12 : 14)
                                                        }).map((_, i) => {
                                                            const hour = slot.date.getDay() === 5 ? 19 + i : 9 + i;
                                                            const hStr = `${hour.toString().padStart(2, '0')}:00`;
                                                            return <option key={hStr} value={hStr}>{hStr}</option>
                                                        })}
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {Object.keys(slots).length > 0 && (
                        <div className="pt-4 space-y-3 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Base Amount</span>
                                <span>{priceBreakdown.base.toLocaleString()} CZK</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span className="flex items-center gap-1">Cleaning Fee <Sparkles className="w-3 h-3" /></span>
                                <span>{priceBreakdown.cleaning.toLocaleString()} CZK</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Insurance (50%)</span>
                                <span>{priceBreakdown.insurance.toLocaleString()} CZK</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Service Fee</span>
                                <span>{priceBreakdown.commission.toLocaleString()} CZK</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-black pt-2 border-t border-gray-100 dark:border-gray-800">
                                <span>Total Price</span>
                                <span className="text-violet-600">{priceBreakdown.total.toLocaleString()} CZK</span>
                            </div>
                        </div>
                    )}

                    <div className="pt-2 space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-violet-50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-800">
                            <input
                                type="checkbox"
                                id="contract"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                            />
                            <label htmlFor="contract" className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                                I agree to the <a
                                    href={`/api/bookings/contract-preview?spaceName=${encodeURIComponent(space.name)}&price=${priceBreakdown.total}`}
                                    target="_blank"
                                    className="font-bold text-violet-600 underline"
                                >
                                    Digital Contract
                                </a>
                            </label>
                        </div>

                        <Button
                            className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:scale-[1.02] transition-transform"
                            onClick={handleBook}
                            disabled={bookingLoading || Object.keys(slots).length === 0}
                        >
                            {bookingLoading ? "Processing..." : "Reserve Your Slots"}
                        </Button>
                        <p className="text-[10px] text-center text-gray-400">Payments are processed securely via Stripe. You won't be charged yet.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
