"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import MapComponent from "@/components/ui/map-component";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

// Same schema as backend
const formSchema = z.object({
    name: z.string().min(3, "Name is too short"),
    description: z.string().min(10, "Description is too short"),
    address: z.string().min(5, "Address is required"),
    city: z.string().default("Prague"),
    district: z.string().optional(),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
    size: z.coerce.number().positive("Size must be positive"),
    capacity: z.coerce.number().int().positive("Capacity must be positive"),
    officeCount: z.coerce.number().int().optional(),
    hourlyRate: z.coerce.number().positive("Rate must be positive"),
    dailyRate: z.coerce.number().positive(),
    weekendRate: z.coerce.number().positive(),
    hasWifi: z.boolean().default(true),
    hasProjector: z.boolean().default(false),
    hasKitchen: z.boolean().default(false),
    hasParking: z.boolean().default(false),
    hasAC: z.boolean().default(false),
    amenitiesList: z.array(z.string()).default([]),
});

const AMENITIES_OPTIONS = [
    "High-Speed Wi-Fi", "Professional Meeting Rooms", "Ergonomic Furniture",
    "Natural Lighting", "Air Conditioning", "Kitchen Access",
    "Free Coffee/Tea", "Print/Scan Facilities", "Quiet Zones",
    "Breakout Areas", "Whiteboards/Projectors", "Secure Bike Storage",
    "On-site Showers", "24/7 Access", "Advanced Security",
    "On-site Parking", "ADA Accessibility", "Outdoor Terrace",
    "Soundproofing", "Reception Services"
];

interface SpaceFormProps {
    initialData?: any;
}

export function SpaceForm({ initialData }: SpaceFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [photos, setPhotos] = useState<string[]>([]);
    const [photoUrl, setPhotoUrl] = useState("");
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            description: "",
            address: "",
            city: "Prague",
            district: "",
            latitude: 50.0755,
            longitude: 14.4378,
            size: undefined,
            capacity: undefined,
            officeCount: 0,
            hourlyRate: undefined,
            dailyRate: undefined,
            weekendRate: undefined,
            hasWifi: true,
            hasProjector: false,
            hasKitchen: false,
            hasParking: false,
            hasAC: false,
            amenitiesList: [],
        },
    });

    const addPhoto = () => {
        if (!photoUrl) return;
        setPhotos([...photos, photoUrl]);
        setPhotoUrl("");
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();

            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();

                form.setValue("latitude", lat);
                form.setValue("longitude", lng);

                if (place.formatted_address) {
                    form.setValue("address", place.formatted_address);
                }

                // Extract City and District from address_components
                let city = "Prague";
                let district = "";

                place.address_components?.forEach(component => {
                    if (component.types.includes("locality")) {
                        city = component.long_name;
                    }
                    if (component.types.includes("sublocality") || component.types.includes("neighborhood")) {
                        district = component.long_name;
                    }
                });

                form.setValue("city", city);
                form.setValue("district", district);
            }
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (photos.length === 0) {
            toast.error("Please add at least one photo URL");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/owner/spaces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...values, photos }),
            });

            if (response.ok) {
                toast.success("Space created successfully!");
                router.push("/owner/dashboard");
                router.refresh();
            } else {
                const data = await response.json();
                toast.error(data.message || "Something went wrong");
            }
        } catch (error) {
            toast.error("Failed to create space");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl bg-white dark:bg-gray-800 p-6 rounded-xl border">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Space Name</label>
                        <Input {...form.register("name")} placeholder="e.g. Modern Loft in Vinohrady" />
                        {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Description</label>
                        <Textarea {...form.register("description")} placeholder="Describe the space..." />
                        {form.formState.errors.description && <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Location</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-sm font-medium mb-1 block">Address</label>
                        {isLoaded ? (
                            <Autocomplete
                                onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
                                onPlaceChanged={onPlaceChanged}
                            >
                                <Input {...form.register("address")} placeholder="Search for a location..." />
                            </Autocomplete>
                        ) : (
                            <Input {...form.register("address")} placeholder="Loading..." disabled />
                        )}
                        {form.formState.errors.address && <p className="text-red-500 text-xs mt-1">{form.formState.errors.address.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">City</label>
                        <Input {...form.register("city")} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">District (Optional)</label>
                        <Input {...form.register("district")} placeholder="e.g. Praha 2" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Latitude</label>
                        <Input type="number" step="any" {...form.register("latitude")} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Longitude</label>
                        <Input type="number" step="any" {...form.register("longitude")} />
                    </div>
                    <div className="col-span-2 h-48 rounded-md overflow-hidden border mt-2">
                        <div className="w-full h-full bg-gray-100">
                            {isLoaded && (
                                <MapComponent
                                    lat={form.watch("latitude")}
                                    lng={form.watch("longitude")}
                                    zoom={15}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Specs & Amenities</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Size (m²)</label>
                        <Input type="number" {...form.register("size")} />
                        {form.formState.errors.size && <p className="text-red-500 text-xs mt-1">{form.formState.errors.size.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Capacity (ppl)</label>
                        <Input type="number" {...form.register("capacity")} />
                        {form.formState.errors.capacity && <p className="text-red-500 text-xs mt-1">{form.formState.errors.capacity.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Offices</label>
                        <Input type="number" {...form.register("officeCount")} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="wifi" onCheckedChange={c => form.setValue("hasWifi", c as boolean)} defaultChecked={true} />
                        <label htmlFor="wifi" className="text-sm font-medium">Fast Wi-Fi</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="proj" onCheckedChange={c => form.setValue("hasProjector", c as boolean)} />
                        <label htmlFor="proj" className="text-sm font-medium">Projector / Screen</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="kit" onCheckedChange={c => form.setValue("hasKitchen", c as boolean)} />
                        <label htmlFor="kit" className="text-sm font-medium">Kitchen Access</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="ac" onCheckedChange={c => form.setValue("hasAC", c as boolean)} />
                        <label htmlFor="ac" className="text-sm font-medium">Air Conditioning</label>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <label className="text-sm font-medium mb-3 block text-muted-foreground uppercase tracking-wider">Additional Amenities</label>
                    <div className="grid grid-cols-2 gap-y-3">
                        {AMENITIES_OPTIONS.map((amenity) => (
                            <div key={amenity} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`amenity-${amenity}`}
                                    checked={form.watch("amenitiesList").includes(amenity)}
                                    onCheckedChange={(checked) => {
                                        const current = form.getValues("amenitiesList");
                                        if (checked) {
                                            form.setValue("amenitiesList", [...current, amenity]);
                                        } else {
                                            form.setValue("amenitiesList", current.filter(a => a !== amenity));
                                        }
                                    }}
                                />
                                <label htmlFor={`amenity-${amenity}`} className="text-sm leading-none cursor-pointer">
                                    {amenity}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Pricing (CZK)</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Hourly Rate</label>
                        <Input type="number" {...form.register("hourlyRate")} placeholder="e.g. 500" />
                        {form.formState.errors.hourlyRate && <p className="text-red-500 text-xs mt-1">{form.formState.errors.hourlyRate.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Daily Rate</label>
                        <Input type="number" {...form.register("dailyRate")} placeholder="e.g. 4000" />
                        {form.formState.errors.dailyRate && <p className="text-red-500 text-xs mt-1">{form.formState.errors.dailyRate.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Full Weekend</label>
                        <Input type="number" {...form.register("weekendRate")} placeholder="e.g. 7500" />
                        {form.formState.errors.weekendRate && <p className="text-red-500 text-xs mt-1">{form.formState.errors.weekendRate.message}</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Photos</h3>
                <div className="flex gap-2">
                    <Input
                        placeholder="Enter image URL..."
                        value={photoUrl}
                        onChange={e => setPhotoUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPhoto())}
                    />
                    <Button type="button" onClick={addPhoto} variant="secondary">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                    {photos.map((url, i) => (
                        <div key={i} className="relative group border rounded-lg overflow-hidden h-32">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removePhoto(i)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {photos.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                            No photos added yet
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t">
                <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Creating Listing..." : "Create Listing"}
                </Button>
            </div>
        </form>
    );
}
