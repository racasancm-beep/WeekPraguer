import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
    rating: number;
    maxStars?: number;
    size?: "sm" | "md" | "lg";
    showNumber?: boolean;
    className?: string;
}

export function RatingStars({
    rating,
    maxStars = 5,
    size = "md",
    showNumber = false,
    className,
}: RatingStarsProps) {
    const sizeClasses = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <div className="flex">
                {Array.from({ length: maxStars }).map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            sizeClasses[size],
                            "transition-colors",
                            i < Math.floor(rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : i < rating
                                    ? "fill-yellow-400/50 text-yellow-400"
                                    : "fill-none text-muted-foreground"
                        )}
                    />
                ))}
            </div>
            {showNumber && (
                <span className="text-sm text-muted-foreground ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
