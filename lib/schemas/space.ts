import * as z from "zod";

export const spaceSchema = z.object({
    name: z.string().min(5, "Name must be at least 5 characters"),
    description: z.string().min(20, "Description must be detailed (min 20 chars)"),
    address: z.string().min(5, "Address is required"),
    city: z.string().default("București"),
    size: z.number().min(1, "Size is required"),
    capacity: z.number().min(1, "Capacity is required"),
    hourlyRate: z.number().min(0, "Price cannot be negative"),
    dailyRate: z.number().min(0, "Price cannot be negative"),
    weekendRate: z.number().min(0, "Price cannot be negative"), // Special full weekend deal
    amenities: z.array(z.string()).optional(), // List of amenity IDs
    imageUrls: z.array(z.string()).optional(), // URLs from upload
});

export type SpaceFormValues = z.infer<typeof spaceSchema>;
