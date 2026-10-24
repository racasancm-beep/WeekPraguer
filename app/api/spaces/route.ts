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

    // Only show clean spaces to users
    where.isClean = true;

    try {
        // Auto-complete self-cleaning jobs that are > 2 hours past booking end
        const overdueLogs = await (prisma as any).cleaningLog.findMany({
            where: {
                status: "SELF_CLEANING",
                booking: {
                    endTime: { lte: new Date(Date.now() - 2 * 60 * 60 * 1000) }
                }
            } as any,
            include: { booking: true }
        }) as any[];

        for (const log of overdueLogs) {
            await (prisma as any).$transaction([
                (prisma as any).cleaningLog.update({ where: { id: log.id }, data: { status: "COMPLETED" } }),
                (prisma as any).space.update({ where: { id: log.booking.spaceId }, data: { isClean: true } })
            ]);
        }

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
