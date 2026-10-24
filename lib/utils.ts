import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = "RON"): string {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
}

export function formatDateOnly(date: Date | string): string {
    return new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
    }).format(new Date(date));
}
