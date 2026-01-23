import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";


const spaceSchema = z.object({
    name: z.string().min(3),
    description: z.string().min(10),
    address: z.string().min(5),
    city: z.string().default("Prague"),
    district: z.string().optional(),
    latitude: z.number(),
    longitude: z.number(),
    size: z.number().positive(),
    capacity: z.number().int().positive(),
    officeCount: z.number().int().optional(),
    // Pricing
    hourlyRate: z.number().positive(),
    dailyRate: z.number().positive(),
    weekendRate: z.number().positive(),
    // Amenities
    hasWifi: z.boolean(),
    hasProjector: z.boolean(),
    hasKitchen: z.boolean(),
    hasParking: z.boolean(),
    hasAC: z.boolean(),
    amenitiesList: z.array(z.string()).optional(),
    // Photos (just URLs for now)
    photos: z.array(z.string()).min(1),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "OWNER") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = spaceSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { message: "Invalid input", errors: result.error.errors },
                { status: 400 }
            );
        }

        const data = result.data;
        const ownerId = (session.user as any).id;

        // Create space with photos
        const space = await prisma.space.create({
            data: {
                ownerId,
                name: data.name,
                description: data.description,
                address: data.address,
                city: data.city,
                district: data.district,
                latitude: data.latitude,
                longitude: data.longitude,
                size: data.size,
                capacity: data.capacity,
                officeCount: data.officeCount || 0,
                hourlyRate: data.hourlyRate,
                dailyRate: data.dailyRate,
                weekendRate: data.weekendRate,
                hasWifi: data.hasWifi,
                hasProjector: data.hasProjector,
                hasKitchen: data.hasKitchen,
                hasParking: data.hasParking,
                hasAC: data.hasAC,
                amenitiesList: data.amenitiesList ? JSON.stringify(data.amenitiesList) : null,
                // Create related photos
                photos: {
                    create: data.photos.map(url => ({ url }))
                }
            },
        });

        return NextResponse.json({ message: "Space created", space }, { status: 201 });
    } catch (error) {
        console.error("Create space error:", error);
        return NextResponse.json(
            { message: "Failed to create space" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "OWNER") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const spaces = await prisma.space.findMany({
            where: {
                ownerId: (session.user as any).id,
            },
            include: {
                photos: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(spaces);
    } catch (error) {
        console.error("Fetch spaces error:", error);
        return NextResponse.json(
            { message: "Failed to fetch spaces" },
            { status: 500 }
        );
    }
}
