"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { spaceSchema, SpaceFormValues } from "@/lib/schemas/space";
import { AMENITIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming this exists or I use Input
import { Checkbox } from "@/components/ui/checkbox"; // Assuming exists
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewSpacePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const form = useForm<SpaceFormValues>({
        resolver: zodResolver(spaceSchema),
        defaultValues: {
            city: "Prague",
            imageUrls: [],
            amenities: [],
        },
        mode: "onChange",
    });

    const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
    const watchedAmenities = watch("amenities") || [];

    const handleAmenityToggle = (id: string) => {
        if (watchedAmenities.includes(id)) {
            setValue("amenities", watchedAmenities.filter((a) => a !== id));
        } else {
            setValue("amenities", [...watchedAmenities, id]);
        }
    };

    const onSubmit = async (data: SpaceFormValues) => {
        setLoading(true);
        try {
            const res = await fetch("/api/spaces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed");

            toast.success("Space created successfully!");
            router.push("/owner/dashboard");
        } catch (error) {
            toast.error("Failed to create space");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = async () => {
        // Validate current step fields before moving
        let fieldsToValidate: any[] = [];
        if (step === 1) fieldsToValidate = ["name", "description", "address", "city"];
        if (step === 2) fieldsToValidate = ["size", "capacity", "hourlyRate", "dailyRate", "weekendRate"];

        const valid = await form.trigger(fieldsToValidate);
        if (valid) setStep(step + 1);
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">List Your Space</h1>

            {/* Step Indicator */}
            <div className="flex gap-2 mb-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-2 flex-1 rounded ${step >= i ? "bg-primary" : "bg-muted"}`} />
                ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {step === 1 && "Basic Details"}
                            {step === 2 && "Size & Pricing"}
                            {step === 3 && "Amenities"}
                            {step === 4 && "Photos & Review"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {/* Step 1 */}
                        {step === 1 && (
                            <>
                                <div className="grid gap-2">
                                    <Label>Space Name</Label>
                                    <Input {...register("name")} placeholder="e.g. Modern Loft in Vinohrady" />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Description</Label>
                                    {/* Using standard textarea if component missing, but using Input as fallback/placeholder */}
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        {...register("description")}
                                        placeholder="Describe the space..."
                                    />
                                    {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Address</Label>
                                        <Input {...register("address")} placeholder="Street 123" />
                                        {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>City</Label>
                                        <Input {...register("city")} defaultValue="Prague" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 2 */}
                        {step === 2 && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Size (m²)</Label>
                                        <Input type="number" {...register("size", { valueAsNumber: true })} />
                                        {errors.size && <p className="text-red-500 text-sm">{errors.size.message}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Capacity (ppl)</Label>
                                        <Input type="number" {...register("capacity", { valueAsNumber: true })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 border-t pt-4 mt-4">
                                    <div className="grid gap-2">
                                        <Label>Hourly (CZK)</Label>
                                        <Input type="number" {...register("hourlyRate", { valueAsNumber: true })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Daily (CZK)</Label>
                                        <Input type="number" {...register("dailyRate", { valueAsNumber: true })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Weekend Deal (CZK)</Label>
                                        <Input type="number" {...register("weekendRate", { valueAsNumber: true })} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 3 */}
                        {step === 3 && (
                            <div className="grid grid-cols-2 gap-4">
                                {AMENITIES.map((amenity) => {
                                    const Icon = amenity.icon;
                                    const isSelected = watchedAmenities.includes(amenity.id);
                                    return (
                                        <div
                                            key={amenity.id}
                                            onClick={() => handleAmenityToggle(amenity.id)}
                                            className={`p-4 border rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span>{amenity.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Step 4 */}
                        {step === 4 && (
                            <div className="space-y-4">
                                <p className="text-muted-foreground">Photos will be handled in a later update (Mock). Proceed to publish.</p>
                                <div className="p-4 bg-muted rounded">
                                    <h3 className="font-bold">Summary</h3>
                                    <p>{form.getValues("name")}</p>
                                    <p>{form.getValues("address")}</p>
                                    <p>{form.getValues("size")}m² • {form.getValues("capacity")} people</p>
                                    <p className="mt-2 text-primary font-mono">{form.getValues("weekendRate")} CZK / Weekend</p>
                                </div>
                            </div>
                        )}

                    </CardContent>
                    <CardFooter className="flex justify-between">
                        {step > 1 ? (
                            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
                        ) : <div />}

                        {step < 4 ? (
                            <Button type="button" onClick={nextStep}>Next</Button>
                        ) : (
                            <Button type="submit" disabled={loading}>
                                {loading ? "Publishing..." : "Publish Space"}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
