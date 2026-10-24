"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Schema for different steps
const baseSchema = z.object({
    phone: z.string().min(9, "Phone number is required"),
});

const ownerSchema = baseSchema.extend({
    companyName: z.string().optional(),
    vatId: z.string().optional(),
    billingAddress: z.string().min(5, "Address is required"),
});

export default function OnboardingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const role = session?.user?.role;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(
            role === "OWNER" ? ownerSchema : baseSchema
        ),
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const response = await fetch("/api/user/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to update profile");

            toast.success("Profile updated!");
            router.push("/portal");
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!session) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-sm bg-white">
            <h1 className="text-2xl font-bold mb-4">Complete your Profile</h1>
            <p className="text-muted-foreground mb-6">
                We need a few more details before you can start {role === "RENTER" ? "booking" : "working"}.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...register("phone")} placeholder="+34 600 000 000" />
                    {errors.phone && <p className="text-red-500 text-sm">{(errors.phone as any).message}</p>}
                </div>

                {role === "OWNER" && (
                    <>
                        <div>
                            <Label htmlFor="companyName">Company Name (Optional)</Label>
                            <Input id="companyName" {...register("companyName")} />
                        </div>
                        <div>
                            <Label htmlFor="vatId">VAT ID (Optional)</Label>
                            <Input id="vatId" {...register("vatId")} />
                        </div>
                        <div>
                            <Label htmlFor="billingAddress">Billing Address</Label>
                            <Input id="billingAddress" {...register("billingAddress")} />
                            {errors.billingAddress && (
                                <p className="text-red-500 text-sm">{(errors.billingAddress as any).message}</p>
                            )}
                        </div>
                    </>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Saving..." : "Complete Profile"}
                </Button>
            </form>
        </div>
    );
}
