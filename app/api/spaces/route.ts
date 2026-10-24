import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { spaceSchema } from "@/lib/schemas/space";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || (role !== "OWNER" && role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const json = await req.json();
        const body = spaceSchema.parse(json);

        const space = await prisma.space.create({
            data: {
                ownerId: session.user.id,
                name: body.name,
                description: body.description,
                address: body.address,
                city: body.city,
                size: body.size,
                capacity: body.capacity,
                hourlyRate: body.hourlyRate,
                dailyRate: body.dailyRate,
                weekendRate: body.weekendRate,
                amenitiesList: JSON.stringify(body.amenities || body.amenitiesList || []),
                latitude: typeof (json as any).latitude === "number" ? (json as any).latitude : 44.4268,
                longitude: typeof (json as any).longitude === "number" ? (json as any).longitude : 26.1025,
            },
        });

        return NextResponse.json({ success: true, spaceId: space.id });
    } catch (error) {
        console.error("Create space error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const capacity = searchParams.get("capacity");

    const where: any = { active: true };

    if (city) {
        where.city = { contains: city, mode: "insensitive" };
    }

    if (category) {
        where.category = { contains: category, mode: "insensitive" };
    }

    if (minPrice || maxPrice) {
        where.hourlyRate = {};
        if (minPrice) where.hourlyRate.gte = parseFloat(minPrice);
        if (maxPrice) where.hourlyRate.lte = parseFloat(maxPrice);
    }

    if (capacity) {
        where.capacity = { gte: parseInt(capacity) };
    }

    try {
        const spaces = await prisma.space.findMany({
            where: where as any,
            orderBy: { createdAt: "desc" },
            include: {
                photos: true,
            }
        });
        return NextResponse.json(spaces);
    } catch (error) {
        console.error("Fetch spaces error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
