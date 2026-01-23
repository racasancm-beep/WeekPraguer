import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
    amount: number;
    currency?: string;
    period?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function PriceDisplay({
    amount,
    currency = "CZK",
    period,
    size = "md",
    className,
}: PriceDisplayProps) {
    const sizeClasses = {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-3xl",
    };

    return (
        <div className={cn("flex items-baseline gap-1", className)}>
            <span className={cn("font-bold text-primary", sizeClasses[size])}>
                {formatPrice(amount, currency)}
            </span>
            {period && (
                <span className="text-sm text-muted-foreground">/ {period}</span>
            )}
        </div>
    );
}
