import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
    rating: number; // 0-5
    count?: number; // Number of reviews
    showCount?: boolean;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function RatingDisplay({ rating, count = 0, showCount = true, className, size = "md" }: RatingDisplayProps) {
    // Rule: if count is 0 (new profile), display 5 stars
    const displayRating = count === 0 ? 5 : rating;

    // Size mapping
    const sizeClasses = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };

    const iconSize = sizeClasses[size];

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <div className="flex items-center text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFull = displayRating >= star;
                    const isHalf = displayRating >= star - 0.5 && displayRating < star;

                    return (
                        <div key={star} className="relative">
                            <Star
                                className={cn(
                                    iconSize,
                                    isFull ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
                                )}
                            />
                            {isHalf && (
                                <div className="absolute inset-0 overflow-hidden w-1/2">
                                    <Star className={cn(iconSize, "fill-yellow-400 text-yellow-400")} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {showCount && (
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    {count === 0 ? "(New)" : `(${count})`}
                </span>
            )}
        </div>
    );
}
