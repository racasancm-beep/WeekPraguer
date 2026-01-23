"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Star } from "lucide-react";

export default function ReviewPage() {
    const { id } = useParams(); // Booking ID
    const router = useRouter();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingId: id,
                    rating,
                    comment,
                }),
            });

            if (!res.ok) throw new Error("Failed to submit review");

            toast.success("Review submitted!");
            router.push("/dashboard");
        } catch (error) {
            toast.error("Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-sm bg-white">
            <h1 className="text-2xl font-bold mb-6">Leave a Review</h1>

            <div className="mb-6">
                <Label className="mb-2 block">Rating</Label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-8 h-8 cursor-pointer ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <Label className="mb-2 block">Comment</Label>
                <Textarea
                    placeholder="How was your experience?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                />
            </div>

            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit Review"}
            </Button>
        </div>
    );
}
