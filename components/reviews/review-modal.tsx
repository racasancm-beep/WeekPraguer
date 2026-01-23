"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectId: string;
    bookingId?: string;
    spaceId?: string;
    type: "renter_to_space" | "owner_to_renter" | "owner_to_cleaner" | "cleaner_to_renter";
    subjectName: string;
}

export function ReviewModal({ isOpen, onClose, subjectId, bookingId, spaceId, type, subjectName }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subjectId,
                    bookingId,
                    spaceId,
                    type,
                    rating,
                    comment
                })
            });

            if (response.ok) {
                toast.success("Review submitted successfully!");
                onClose();
                setComment("");
                setRating(5);
            } else {
                toast.error("Failed to submit review");
            }
        } catch (error) {
            toast.error("Error submitting review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rate {subjectName}</DialogTitle>
                    <DialogDescription>
                        Share your experience with this {type.includes("renter") ? "renter" : type.includes("cleaner") ? "cleaner" : "space"}.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={cn(
                                        "w-8 h-8",
                                        (hoverRating || rating) >= star
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300 dark:text-gray-600"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {(hoverRating || rating)} out of 5 stars
                    </p>

                    <Textarea
                        placeholder="Write a comment (optional)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full"
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Submitting..." : "Submit Review"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
