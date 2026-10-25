"use client";

import { useState } from "react";
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
import { AMENITIES_OPTIONS } from "@/lib/constants/amenities";
import { useLanguage } from "@/lib/i18n/language-context";

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    "bucurești": { lat: 44.4268, lng: 26.1025 },
    "bucuresti": { lat: 44.4268, lng: 26.1025 },
    "bucharest": { lat: 44.4268, lng: 26.1025 },
    "cluj-napoca": { lat: 46.7712, lng: 23.6236 },
    "cluj": { lat: 46.7712, lng: 23.6236 },
    "timișoara": { lat: 45.7489, lng: 21.2087 },
    "timisoara": { lat: 45.7489, lng: 21.2087 },
    "iași": { lat: 47.1585, lng: 27.6014 },
    "iasi": { lat: 47.1585, lng: 27.6014 },
    "constanța": { lat: 44.1792, lng: 28.6499 },
    "constanta": { lat: 44.1792, lng: 28.6499 },
    "brașov": { lat: 45.6427, lng: 25.5887 },
    "brasov": { lat: 45.6427, lng: 25.5887 },
    "craiova": { lat: 44.3302, lng: 23.7949 },
    "galați": { lat: 45.4353, lng: 28.008 },
    "galati": { lat: 45.4353, lng: 28.008 },
    "oradea": { lat: 47.0465, lng: 21.9189 },
    "sibiu": { lat: 45.7983, lng: 24.1256 },
};

const formSchema = z.object({
    name: z.string().min(2, "Required"),
    description: z.string().min(5, "Required"),
    address: z.string().min(3, "Required"),
    city: z.string().default("București"),
    district: z.string().optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    size: z.coerce.number().positive(),
    capacity: z.coerce.number().int().positive(),
    officeCount: z.coerce.number().int().optional(),
    hourlyRate: z.coerce.number().positive(),
    dailyRate: z.coerce.number().optional(),
    weekendRate: z.coerce.number().optional(),
    hasWifi: z.boolean().default(true),
    hasProjector: z.boolean().default(false),
    hasKitchen: z.boolean().default(false),
    hasParking: z.boolean().default(false),
    hasAC: z.boolean().default(false),
    selfCleaning: z.boolean().default(false),
    amenitiesList: z.array(z.string()).default([]),
});

interface SpaceFormProps {
    initialData?: any;
}

export function SpaceForm({ initialData }: SpaceFormProps) {
    const router = useRouter();
    const { t, translateAmenity } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [photos, setPhotos] = useState<string[]>(initialData?.photos?.map((p: any) => p.url || p) || []);
    const [photoUrl, setPhotoUrl] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            description: "",
            address: "",
            city: "București",
            district: "",
            latitude: 44.4268,
            longitude: 26.1025,
            size: 50,
            capacity: 10,
            officeCount: 1,
            hourlyRate: 100,
            dailyRate: 600,
            weekendRate: 1100,
            hasWifi: true,
            hasProjector: false,
            hasKitchen: false,
            hasParking: false,
            hasAC: false,
            selfCleaning: false,
            amenitiesList: [],
        },
    });

    const addPhoto = () => {
        if (!photoUrl.trim()) return;
        setPhotos([...photos, photoUrl.trim()]);
        setPhotoUrl("");
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        form.setValue("city", val);
        const coords = CITY_COORDS[val.trim().toLowerCase()];
        if (coords) {
            form.setValue("latitude", coords.lat);
            form.setValue("longitude", coords.lng);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            const finalPhotos =
                photos.length > 0
                    ? photos
                    : photoUrl.trim()
                    ? [photoUrl.trim()]
                    : ["https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"];

            const response = await fetch("/api/owner/spaces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    dailyRate: values.dailyRate || values.hourlyRate * 8,
                    weekendRate: values.weekendRate || values.hourlyRate * 16,
                    photos: finalPhotos,
                }),
            });

            if (response.ok) {
                toast.success(t("owner.form.createBtn"));
                router.push("/owner/dashboard/listings");
                router.refresh();
            } else {
                const data = await response.json();
                toast.error(data.message || "Error");
            }
        } catch (error) {
            toast.error("Error");
        } finally {
            setLoading(false);
        }
    };

    const watchedAmenities = form.watch("amenitiesList") || [];

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl bg-white dark:bg-gray-800 p-6 rounded-xl border">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("owner.form.basicInfo")}</h3>
                <div className="grid gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.spaceName")}</label>
                        <Input {...form.register("name")} placeholder="e.g. Modern Office Victoriei" />
                        {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.description")}</label>
                        <Textarea {...form.register("description")} />
                        {form.formState.errors.description && <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("owner.form.location")}</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.address")}</label>
                        <Input {...form.register("address")} placeholder="Calea Victoriei 120, București" />
                        {form.formState.errors.address && <p className="text-red-500 text-xs mt-1">{form.formState.errors.address.message}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.city")}</label>
                        <Input {...form.register("city")} onChange={handleCityChange} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.district")}</label>
                        <Input {...form.register("district")} placeholder="Sector 1" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.latitude")}</label>
                        <Input type="number" step="any" {...form.register("latitude")} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.longitude")}</label>
                        <Input type="number" step="any" {...form.register("longitude")} />
                    </div>
                    <div className="col-span-2 h-56 rounded-md overflow-hidden border mt-2">
                        <MapComponent
                            lat={Number(form.watch("latitude")) || 44.4268}
                            lng={Number(form.watch("longitude")) || 26.1025}
                            zoom={14}
                            address={form.watch("address")}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("owner.form.specsAmenities")}</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.size")}</label>
                        <Input type="number" {...form.register("size")} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.capacity")}</label>
                        <Input type="number" {...form.register("capacity")} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.offices")}</label>
                        <Input type="number" {...form.register("officeCount")} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="wifi" onCheckedChange={c => form.setValue("hasWifi", c as boolean)} defaultChecked={true} />
                        <label htmlFor="wifi" className="text-sm font-medium">{translateAmenity("High-Speed Wi-Fi")}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="proj" onCheckedChange={c => form.setValue("hasProjector", c as boolean)} />
                        <label htmlFor="proj" className="text-sm font-medium">{translateAmenity("Projector / Screen")}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="kit" onCheckedChange={c => form.setValue("hasKitchen", c as boolean)} />
                        <label htmlFor="kit" className="text-sm font-medium">{translateAmenity("Kitchen Access")}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="ac" onCheckedChange={c => form.setValue("hasAC", c as boolean)} />
                        <label htmlFor="ac" className="text-sm font-medium">{translateAmenity("Air Conditioning")}</label>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <label className="text-sm font-medium mb-3 block text-muted-foreground uppercase tracking-wider">{t("owner.form.additionalAmenities")}</label>
                    <div className="grid grid-cols-2 gap-y-3">
                        {AMENITIES_OPTIONS.map((amenity) => (
                            <div key={amenity} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`amenity-${amenity}`}
                                    checked={watchedAmenities.includes(amenity)}
                                    onCheckedChange={(checked) => {
                                        const current = form.getValues("amenitiesList") || [];
                                        if (checked) {
                                            form.setValue("amenitiesList", [...current, amenity]);
                                        } else {
                                            form.setValue("amenitiesList", current.filter(a => a !== amenity));
                                        }
                                    }}
                                />
                                <label htmlFor={`amenity-${amenity}`} className="text-sm leading-none cursor-pointer">
                                    {translateAmenity(amenity)}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("owner.form.ratesPricing")}</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.hourlyRate")}</label>
                        <Input type="number" {...form.register("hourlyRate")} placeholder="100" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.dailyRate")}</label>
                        <Input type="number" {...form.register("dailyRate")} placeholder="600" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">{t("owner.form.weekendRate")}</label>
                        <Input type="number" {...form.register("weekendRate")} placeholder="1100" />
                    </div>
                </div>

                <div className="pt-6 mt-4 border-t-2 border-dashed border-violet-100 dark:border-violet-900/30">
                    <div className="flex items-start space-x-3 p-4 bg-violet-50 dark:bg-violet-900/10 rounded-2xl border border-violet-100 dark:border-violet-800">
                        <Checkbox
                            id="selfCleaning"
                            checked={form.watch("selfCleaning")}
                            onCheckedChange={c => form.setValue("selfCleaning", c as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="selfCleaning"
                                className="text-sm font-black leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-violet-900 dark:text-violet-200"
                            >
                                {t("owner.form.selfCleaningTitle")}
                            </label>
                            <p className="text-[11px] text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider">
                                {t("owner.form.selfCleaningLaw")}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t("owner.form.selfCleaningDesc")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">{t("owner.form.photos")}</h3>
                    <span className="text-xs text-muted-foreground">{photos.length} {t("owner.form.photosAdded")}</span>
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder={t("owner.form.photoUrlPlaceholder")}
                        value={photoUrl}
                        onChange={e => setPhotoUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPhoto())}
                        className="flex-1"
                    />
                    <input
                        type="file"
                        id="photo-upload"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.forEach(file => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setPhotos(prev => [...prev, reader.result as string]);
                                };
                                reader.readAsDataURL(file);
                            });
                        }}
                    />
                    <Button
                        type="button"
                        onClick={() => {
                            if (photoUrl) {
                                addPhoto();
                            } else {
                                document.getElementById('photo-upload')?.click();
                            }
                        }}
                        variant="secondary"
                        className="bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-300"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        {photoUrl ? t("owner.form.add") : t("owner.form.browse")}
                    </Button>
                </div>

                {photos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                        {photos.map((url, i) => (
                            <div key={i} className="relative group aspect-video border-2 border-violet-100 dark:border-violet-900/30 rounded-xl overflow-hidden shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(i)}
                                        className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transform hover:scale-110 transition-all shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full">
                                    {i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        className="text-center py-12 text-gray-400 border-2 border-dashed border-violet-100 dark:border-violet-900/30 rounded-xl bg-violet-50/30 dark:bg-violet-900/10 cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors group"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Plus className="w-8 h-8 text-violet-300 group-hover:text-violet-500 transition-colors" />
                            <p className="text-sm">{t("owner.form.uploadClick")}</p>
                            <p className="text-xs text-muted-foreground">{t("owner.form.supportedFormats")}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-4 border-t">
                <Button type="submit" className="w-full h-12 text-lg bg-[#008080] hover:bg-[#006F6F] text-white font-bold" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? t("owner.form.creatingBtn") : t("owner.form.createBtn")}
                </Button>
            </div>
        </form>
    );
}
