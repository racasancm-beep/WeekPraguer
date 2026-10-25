"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
    Clock,
    MapPin,
    Users,
    Ruler,
    Sparkles,
    Shield,
    ChevronLeft,
    ChevronRight,
    Wifi,
    Wind,
    Utensils,
    Car,
    Monitor,
    Calendar as CalendarIcon,
    ArrowLeft,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import MapComponent from "@/components/ui/map-component";
import { useLanguage } from "@/lib/i18n/language-context";

interface SpaceDetailed {
    id: string;
    name: string;
    description: string;
    city: string;
    district?: string;
    address: string;
    category?: string;
    latitude?: number;
    longitude?: number;
    size: number;
    capacity: number;
    hourlyRate: number;
    dailyRate: number;
    weekendRate: number;
    hasWifi: boolean;
    hasAC: boolean;
    hasKitchen: boolean;
    hasParking: boolean;
    hasProjector: boolean;
    amenitiesList: string;
    photos: { id?: string; url: string }[];
}

interface BookingSlot {
    date: Date;
    isFullDay: boolean;
    startTime: string; // "HH:mm"
    endTime: string;   // "HH:mm"
}

export default function SpaceDetailsPage() {
    const { t, translateAmenity, translateCategory } = useLanguage();
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [space, setSpace] = useState<SpaceDetailed | null>(null);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [existingBookings, setExistingBookings] = useState<any[]>([]);
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
                setExistingBookings(bData);
                const dates = bData.map((b: any) => new Date(b.startTime));
                setBookedDates(dates);
            }
        } catch (error) {
            toast.error("Error loading space details");
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (dates: Date[] | undefined) => {
        const newDates = dates || [];
        setSelectedDates(newDates);

        // Update slots dictionary
        const newSlots: Record<string, BookingSlot> = {};
        newDates.forEach((d) => {
            const key = d.toISOString().split("T")[0];
            if (slots[key]) {
                newSlots[key] = slots[key];
            } else {
                newSlots[key] = {
                    date: d,
                    isFullDay: false,
                    startTime: "09:00",
                    endTime: "13:00",
                };
            }
        });
        setSlots(newSlots);
    };

    const updateSlot = (key: string, updates: Partial<BookingSlot>) => {
        setSlots((prev) => ({
            ...prev,
            [key]: { ...prev[key], ...updates },
        }));
    };

    const calculateTotalPrice = () => {
        if (!space) return 0;
        let total = 0;
        Object.values(slots).forEach((slot) => {
            if (slot.isFullDay) {
                total += space.dailyRate;
            } else {
                const startHour = parseInt(slot.startTime.split(":")[0], 10);
                const endHour = parseInt(slot.endTime.split(":")[0], 10);
                const hours = Math.max(1, endHour - startHour);
                total += hours * space.hourlyRate;
            }
        });
        return total;
    };

    const handleBook = async () => {
        if (!session) {
            toast.error(t("space.errSignIn"));
            router.push(`/login?callbackUrl=/spaces/${id}`);
            return;
        }

        if (selectedDates.length === 0) {
            toast.error(t("space.errSelectDate"));
            return;
        }

        if (!agreed) {
            toast.error(t("space.errAgreeTerms"));
            return;
        }

        setBookingLoading(true);
        try {
            // Sort dates
            const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
            const firstDate = sortedDates[0];
            const lastDate = sortedDates[sortedDates.length - 1];

            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    spaceId: space?.id,
                    startTime: firstDate,
                    endTime: lastDate,
                    totalPrice: calculateTotalPrice(),
                    slots: Object.values(slots).map(s => {
                        const d = new Date(s.date);
                        return {
                            ...s,
                            date: [
                                d.getFullYear(),
                                String(d.getMonth() + 1).padStart(2, '0'),
                                String(d.getDate()).padStart(2, '0')
                            ].join('-')
                        };
                    }),
                }),
            });

            if (res.ok) {
                toast.success(t("space.bookingSuccess"));
                router.push("/dashboard");
            } else {
                const err = await res.json();
                toast.error(err.message || "Failed to create booking");
            }
        } catch (error) {
            toast.error("An error occurred during booking");
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-semibold text-gray-500">{t("space.loading")}</p>
                </div>
            </div>
        );
    }

    if (!space) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("space.notFound")}</h2>
                <p className="text-gray-500 mb-6">{t("space.notFoundDesc")}</p>
                <Link href="/explore">
                    <Button className="bg-violet-600 text-white rounded-xl">{t("space.backToExplore")}</Button>
                </Link>
            </div>
        );
    }

    let amenities: string[] = [];
    try {
        amenities = JSON.parse(space.amenitiesList || "[]");
    } catch {
        amenities = ["High-Speed WiFi", "Natural Light", "Climate Control"];
    }

    const totalPrice = calculateTotalPrice();
    const photos = space.photos || [];
    const activePhoto = photos[selectedPhotoIndex]?.url || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80";

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <Link href="/explore" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-violet-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        {t("space.backToSpaces")}
                    </Link>
                    {space.category && (
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                            {translateCategory(space.category)}
                        </span>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Space Title & Location */}
                <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        {space.category && (
                            <span className="text-xs font-bold uppercase tracking-wider bg-violet-100 text-violet-800 px-3 py-1 rounded-full">
                                {translateCategory(space.category)}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                            <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            {t("space.verifiedHost")}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">
                        {space.name}
                    </h1>

                    <div className="flex items-center text-sm text-gray-500 gap-1.5">
                        <MapPin className="w-4 h-4 text-violet-600 flex-shrink-0" />
                        <span>{space.address}</span>
                        <span>•</span>
                        <span className="font-semibold text-gray-700">{space.city}</span>
                    </div>
                </div>

                {/* Photo Gallery */}
                <div className="space-y-3 mb-10">
                    <div className="relative aspect-[16/9] md:aspect-[21/9] max-h-[500px] w-full bg-gray-900 rounded-3xl overflow-hidden shadow-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={activePhoto}
                            alt={space.name}
                            className="w-full h-full object-cover"
                        />

                        {photos.length > 1 && (
                            <>
                                <button
                                    onClick={() => setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-gray-900 flex items-center justify-center shadow-lg transition-transform active:scale-95"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setSelectedPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-gray-900 flex items-center justify-center shadow-lg transition-transform active:scale-95"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                                    {selectedPhotoIndex + 1} / {photos.length} {t("space.photos")}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Thumbnails row */}
                    {photos.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {photos.map((p, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedPhotoIndex(idx)}
                                    className={`relative w-20 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                                        selectedPhotoIndex === idx
                                            ? "border-violet-600 ring-2 ring-violet-200 scale-105"
                                            : "border-transparent opacity-70 hover:opacity-100"
                                    }`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={p.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-12 gap-10">
                    {/* Left Column (8 cols): Info, Details, Amenities, Location */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Quick Stats Banner */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-medium">{t("space.capacity")}</div>
                                    <div className="text-sm font-bold text-gray-900">{space.capacity} {t("space.people")}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
                                    <Ruler className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-medium">{t("space.size")}</div>
                                    <div className="text-sm font-bold text-gray-900">{space.size} m²</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
                                    <Wifi className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-medium">{t("space.connectivity")}</div>
                                    <div className="text-sm font-bold text-gray-900">{space.hasWifi ? t("space.highSpeedWifi") : t("space.onRequest")}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-medium">{t("space.rental")}</div>
                                    <div className="text-sm font-bold text-gray-900">{t("space.hourlyDaily")}</div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-violet-600" />
                                {t("space.descriptionTitle")}
                            </h3>
                            <div className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line font-normal">
                                {space.description}
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-violet-600" />
                                {t("space.amenitiesTitle")}
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                {amenities.map((a: string, i: number) => (
                                    <span
                                        key={i}
                                        className="px-4 py-2 bg-violet-50 text-violet-800 rounded-2xl text-xs font-semibold border border-violet-100"
                                    >
                                        ✓ {translateAmenity(a)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Google Map & Location Section */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-violet-600" />
                                    {t("space.locationTitle")}
                                </h3>
                                <span className="text-xs text-gray-500 font-medium">
                                    {space.address}{space.district ? `, ${space.district}` : ""}, {space.city}
                                </span>
                            </div>

                            <div className="h-80 w-full rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                                <MapComponent
                                    lat={space.latitude}
                                    lng={space.longitude}
                                    address={`${space.address}, ${space.city}`}
                                    zoom={15}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column (4 cols): Dynamic Booking Card */}
                    <div className="lg:col-span-4">
                        <div className="p-6 md:p-8 border rounded-3xl shadow-xl sticky top-24 bg-white border-gray-100 space-y-6">
                            <div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-3xl font-black text-gray-900">{formatPrice(space.hourlyRate)}</span>
                                    <span className="text-sm text-gray-500 font-medium">{t("space.perHour")}</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {t("space.or")} <span className="font-bold text-gray-700">{formatPrice(space.dailyRate)}</span> {t("space.perFullDay")}
                                </p>
                            </div>

                            <hr className="border-gray-100" />

                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                                    {t("space.selectDates")}
                                </label>
                                <div className="border rounded-2xl p-2 bg-gray-50/50 flex justify-center">
                                    <Calendar
                                        mode="multiple"
                                        selected={selectedDates}
                                        onSelect={handleDateSelect}
                                        disabled={(d) => {
                                            return (
                                                d < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                                bookedDates.some(
                                                    (booked) =>
                                                        booked.getDate() === d.getDate() &&
                                                        booked.getMonth() === d.getMonth() &&
                                                        booked.getFullYear() === d.getFullYear()
                                                )
                                            );
                                        }}
                                        className="scale-95"
                                    />
                                </div>
                            </div>

                            {/* Slot Configurations */}
                            {Object.keys(slots).length > 0 && (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                                        {t("space.configureHours")}
                                    </label>
                                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                                        {Object.entries(slots).map(([key, slot]) => (
                                            <div key={key} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                                                <div className="flex justify-between items-center text-xs font-bold text-gray-800">
                                                    <span>{format(slot.date, "EEEE, MMMM d")}</span>
                                                    <label className="flex items-center gap-1.5 cursor-pointer font-normal text-gray-600">
                                                        <input
                                                            type="checkbox"
                                                            checked={slot.isFullDay}
                                                            onChange={(e) => updateSlot(key, { isFullDay: e.target.checked })}
                                                            className="rounded text-violet-600"
                                                        />
                                                        {t("space.fullDay")}
                                                    </label>
                                                </div>

                                                {!slot.isFullDay && (
                                                    <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                                                        <div className="flex-1">
                                                            <span className="text-[10px] text-gray-400 block font-semibold">{t("space.start")}</span>
                                                            <select
                                                                value={slot.startTime}
                                                                onChange={(e) => updateSlot(key, { startTime: e.target.value })}
                                                                className="w-full text-xs font-semibold bg-white p-1 rounded border border-gray-200"
                                                            >
                                                                {Array.from({ length: 14 }).map((_, i) => {
    const hourNum = 8 + i;
    const h = hourNum.toString().padStart(2, "0") + ":00";
    const isBooked = existingBookings.some(b => {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        if (bStart.toISOString().split('T')[0] === key) {
            const bStartHour = bStart.getUTCHours();
            const bEndHour = bEnd.getUTCHours();
            return hourNum >= bStartHour && hourNum < bEndHour;
        }
        return false;
    });
    return <option key={h} value={h} disabled={isBooked}>{h} {isBooked ? t("space.booked") : ''}</option>;
})}
                                                            </select>
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className="text-[10px] text-gray-400 block font-semibold">{t("space.end")}</span>
                                                            <select
                                                                value={slot.endTime}
                                                                onChange={(e) => updateSlot(key, { endTime: e.target.value })}
                                                                className="w-full text-xs font-semibold bg-white p-1 rounded border border-gray-200"
                                                            >
                                                                {Array.from({ length: 14 }).map((_, i) => {
    const hourNum = 9 + i;
    const h = hourNum.toString().padStart(2, "0") + ":00";
    const isBooked = existingBookings.some(b => {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        if (bStart.toISOString().split('T')[0] === key) {
            const bStartHour = bStart.getUTCHours();
            const bEndHour = bEnd.getUTCHours();
            return (hourNum - 1) >= bStartHour && (hourNum - 1) < bEndHour;
        }
        return false;
    });
    return <option key={h} value={h} disabled={isBooked}>{h} {isBooked ? t("space.booked") : ''}</option>;
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
                                <div className="pt-2 border-t border-gray-100 space-y-2">
                                    <div className="flex justify-between items-center text-lg font-black text-gray-900">
                                        <span>{t("space.estimatedTotal")}</span>
                                        <span className="text-violet-600">{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Terms checkbox */}
                            <div className="flex items-start gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="agree-terms"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="mt-1 rounded text-violet-600 focus:ring-violet-500"
                                />
                                <label htmlFor="agree-terms" className="text-xs text-gray-500 leading-tight">
                                    {t("space.agreePrefix")}{" "}
                                    <Link href="/terms" className="text-violet-600 hover:underline">{t("space.termsLink")}</Link>.
                                </label>
                            </div>

                            <Button
                                onClick={handleBook}
                                disabled={bookingLoading}
                                className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold shadow-lg shadow-violet-200"
                            >
                                {bookingLoading ? t("space.processing") : t("space.requestBooking")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
