"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function SpaceFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [city, setCity] = useState(searchParams.get("city") || "");
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [capacity, setCapacity] = useState(searchParams.get("capacity") || "");
    const [hasWifi, setHasWifi] = useState(searchParams.get("hasWifi") === "true");

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (city) params.set("city", city);
        if (priceRange[1] < 10000) params.set("maxPrice", priceRange[1].toString());
        if (capacity) params.set("capacity", capacity);
        if (hasWifi) params.set("hasWifi", "true");

        router.push(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        setCity("");
        setPriceRange([0, 10000]);
        setCapacity("");
        setHasWifi(false);
        router.push(pathname);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Filters</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                            placeholder="City (e.g. Prague)"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Min Capacity (people)</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 5"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Max Daily Price: {priceRange[1]} CZK</Label>
                        <Slider
                            value={[priceRange[1]]}
                            max={10000}
                            step={500}
                            onValueChange={(val) => setPriceRange([0, val[0]])}
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                            id="wifi-filter"
                            checked={hasWifi}
                            onCheckedChange={(c) => setHasWifi(c as boolean)}
                        />
                        <Label htmlFor="wifi-filter">Has Wi-Fi</Label>
                    </div>

                    <div className="pt-4 flex flex-col gap-2">
                        <Button onClick={applyFilters}>Apply Filters</Button>
                        <Button variant="outline" onClick={clearFilters}>Reset</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
