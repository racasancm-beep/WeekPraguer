import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { POST as ownerSpacesPOST } from "@/app/api/owner/spaces/route";

export async function POST(req: Request) {
    // Delegated to unified owner spaces creation logic
    return ownerSpacesPOST(req);
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const capacity = searchParams.get("capacity");
    const isServiceParam = searchParams.get("isService");
    const listingTypeParam = searchParams.get("listingType");
    const serviceCategoryParam = searchParams.get("serviceCategory");

    const where: any = { active: true };

    if (isServiceParam !== null) {
        where.isService = isServiceParam === "true";
    }
    if (listingTypeParam) {
        where.listingType = listingTypeParam;
    }
    if (serviceCategoryParam) {
        where.serviceCategory = { contains: serviceCategoryParam, mode: "insensitive" };
    }

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
            }
        });
        const sanitizedSpaces = spaces.map((s) => ({
            ...s,
            accessCode: null,
            bookings: s.bookings.map((b) => ({
                ...b,
                accessCode: b.accessCode === "OWNER_BLOCK" ? "OWNER_BLOCK" : null,
            })),
        }));
        return NextResponse.json(sanitizedSpaces);
    } catch (error) {
        console.error("Fetch spaces error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
