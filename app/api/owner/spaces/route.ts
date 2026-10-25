import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const DEFAULT_OFFICE_PHOTO = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80";

const spaceSchema = z.object({
    name: z.string().min(2),
    description: z.string().min(3),
    address: z.string().min(3),
    city: z.string().default("București"),
    district: z.string().optional(),
    category: z.string().optional().default("coworking"),
    latitude: z.coerce.number().optional().default(44.4268),
    longitude: z.coerce.number().optional().default(26.1025),
    size: z.coerce.number().positive(),
    capacity: z.coerce.number().int().positive(),
    officeCount: z.coerce.number().int().optional().default(1),
    // Pricing
    hourlyRate: z.coerce.number().positive(),
    dailyRate: z.coerce.number().optional(),
    weekendRate: z.coerce.number().optional(),
    // Amenities
    hasWifi: z.boolean().optional().default(true),
    hasProjector: z.boolean().optional().default(false),
    hasKitchen: z.boolean().optional().default(false),
    hasParking: z.boolean().optional().default(false),
    hasAC: z.boolean().optional().default(false),
    selfCleaning: z.boolean().optional().default(false),
    active: z.boolean().optional().default(true),
    amenitiesList: z.array(z.string()).optional().default([]),
    // Photos
    photos: z.array(z.string()).optional().default([]),
});

async function resolveOwnerId(session: any): Promise<string | null> {
    const sessionUserId = (session?.user as any)?.id;
    const sessionEmail = session?.user?.email;

    if (sessionUserId) {
        const byId = await prisma.user.findUnique({ where: { id: sessionUserId }, select: { id: true } });
        if (byId) return byId.id;
    }

    if (sessionEmail) {
        const byEmail = await prisma.user.findFirst({
            where: { email: { equals: sessionEmail.trim(), mode: "insensitive" } },
            select: { id: true },
        });
        if (byEmail) return byEmail.id;
    }

    const fallbackOwner = await prisma.user.findFirst({
        where: { role: { in: ["OWNER", "ADMIN"] } },
        select: { id: true },
    });
    return fallbackOwner?.id || null;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = spaceSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { message: result.error.errors[0]?.message || "Invalid input", errors: result.error.errors },
                { status: 400 }
            );
        }

        const data = result.data;
        const ownerId = await resolveOwnerId(session);
        if (!ownerId) {
            return NextResponse.json({ message: "Owner account not found" }, { status: 400 });
        }

        const photoUrls = data.photos && data.photos.length > 0 ? data.photos : [DEFAULT_OFFICE_PHOTO];
        const dailyRate = data.dailyRate && data.dailyRate > 0 ? data.dailyRate : data.hourlyRate * 8;
        const weekendRate = data.weekendRate && data.weekendRate > 0 ? data.weekendRate : data.hourlyRate * 16;

        const space = await prisma.space.create({
            data: {
                ownerId,
                name: data.name,
                description: data.description,
                address: data.address,
                city: data.city || "București",
                district: data.district || "",
                category: data.category || "coworking",
                latitude: data.latitude ?? 44.4268,
                longitude: data.longitude ?? 26.1025,
                size: Math.round(data.size),
                capacity: Math.round(data.capacity),
                officeCount: data.officeCount || 1,
                hourlyRate: data.hourlyRate,
                dailyRate,
                weekendRate,
                hasWifi: Boolean(data.hasWifi),
                hasProjector: Boolean(data.hasProjector),
                hasKitchen: Boolean(data.hasKitchen),
                hasParking: Boolean(data.hasParking),
                hasAC: Boolean(data.hasAC),
                selfCleaning: Boolean(data.selfCleaning),
                active: data.active ?? true,
                amenitiesList: data.amenitiesList ? JSON.stringify(data.amenitiesList) : null,
                photos: {
                    create: photoUrls.map(url => ({ url }))
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
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const role = (session.user as any)?.role;
        const { searchParams } = new URL(req.url);
        const targetUserId = searchParams.get("userId") || undefined;

        let ownerIdFilter: string | undefined;
        if (role === "ADMIN") {
            ownerIdFilter = targetUserId;
        } else {
            ownerIdFilter = (await resolveOwnerId(session)) || (session.user as any).id;
        }

        const spaces = await prisma.space.findMany({
            where: ownerIdFilter ? { ownerId: ownerIdFilter } : {},
            include: {
                photos: true,
                owner: { select: { name: true, email: true } },
                bookings: {
                    where: {
                        status: { in: ["CONFIRMED", "PENDING", "COMPLETED"] },
                    },
                    orderBy: {
                        startTime: "asc",
                    },
                    select: {
                        id: true,
                        startTime: true,
                        endTime: true,
                        isHourly: true,
                        accessCode: true,
                        status: true,
                        totalPrice: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({
            spaces,
            isAdminAllView: role === "ADMIN" && !targetUserId,
        });
    } catch (error) {
        console.error("Fetch spaces error:", error);
        return NextResponse.json(
            { message: "Failed to fetch spaces", spaces: [] },
            { status: 500 }
        );
    }
}
