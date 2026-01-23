import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { spaceSchema } from "@/lib/schemas/space";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
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
                amenitiesList: JSON.stringify(body.amenities), // Store as JSON string
                latitude: 50.0755, // Mock coords for Prague center
                longitude: 14.4378,
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
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const capacity = searchParams.get("capacity");

    const where: any = {};

    if (city) {
        where.city = { contains: city };
    }

    if (minPrice || maxPrice) {
        where.weekendRate = {};
        if (minPrice) where.weekendRate.gte = parseFloat(minPrice);
        if (maxPrice) where.weekendRate.lte = parseFloat(maxPrice);
    }

    if (capacity) {
        where.capacity = { gte: parseInt(capacity) };
    }

    try {
        const spaces = await prisma.space.findMany({
            where,
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
