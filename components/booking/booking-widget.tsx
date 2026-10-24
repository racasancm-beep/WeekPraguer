"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays, differenceInCalendarDays, format, isAfter, isBefore, isWeekend } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // Will need to create/verify this shadcn component
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PaymentSelector } from "@/components/booking/payment-selector";

interface BookingWidgetProps {
    spaceId: string;
    dailyRate: number;
    weekendRate: number;
}

export function BookingWidget({ spaceId, dailyRate, weekendRate }: BookingWidgetProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [date, setDate] = useState<DateRange | undefined>();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("card");

    // Filter for weekends (Friday-Sunday logic can vary, keeping simple here)
    const isWeekendDay = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6 || day === 5; // Sun, Sat, Fri
    };

    const calculateTotal = () => {
        if (!date?.from || !date?.to) return 0;
        const days = differenceInCalendarDays(date.to, date.from) + 1;
        // Logic: if 2+ days, assume "weekend" package if applicable, otherwise daily.
        // Keeping it simple: Just daily * days for now to verify flow.
        return days * dailyRate;
    };

    const handleBook = async () => {
        if (!session) {
            router.push(`/login?callbackUrl=/spaces/${spaceId}`);
            return;
        }

        if (!date?.from || !date?.to) return;

        setLoading(true);
        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    spaceId,
                    startTime: date.from,
                    endTime: date.to, // In real app, would specify hours
                    totalPrice: calculateTotal(), // In real app, calculate on server
                }),
            });

            if (res.ok) {
                toast.success("Booking request sent!");
                router.push("/dashboard/bookings"); // Assuming we'll make this page
            } else {
                toast.error("Booking failed. Please try again.");
            }
        } catch (error) {
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm sticky top-24">
            <h3 className="text-xl font-bold mb-1">
                {formatPrice(dailyRate)} <span className="text-sm font-normal text-gray-500">/día</span>
            </h3>
            <p className="text-sm text-gray-500 mb-6">Fin de semana: {formatPrice(weekendRate)}</p>

            <div className="space-y-4">
                <div className="grid gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "dd/MM/yyyy")} -{" "}
                                            {format(date.to, "dd/MM/yyyy")}
                                        </>
                                    ) : (
                                        format(date.from, "dd/MM/yyyy")
                                    )
                                ) : (
                                    <span>Seleccionar fechas</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                                disabled={(date) => date < new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {date?.from && date?.to && (
                    <div className="flex justify-between py-4 border-t">
                        <span className="font-medium">Total</span>
                        <span className="font-bold text-lg text-violet-600">{formatPrice(calculateTotal())}</span>
                    </div>
                )}

                <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />

                <Button className="w-full h-12 text-lg" onClick={handleBook} disabled={!date?.from || !date?.to || loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reserve Space
                </Button>

                <p className="text-xs text-center text-gray-500 mt-2">
                    You won&apos;t be charged yet.
                </p>
            </div>
        </div>
    );
}
