import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_OFFICE_PHOTO =
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const space = await prisma.space.findUnique({
            where: { id },
            include: {
                photos: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
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
        });

        if (!space) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json(space);
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

async function handleUpdateSpace(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized: Please log in as Owner" }, { status: 401 });
        }

        const existingSpace = await prisma.space.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, email: true } },
            },
        });

        if (!existingSpace) {
            return NextResponse.json({ message: "Space not found" }, { status: 404 });
        }

        const sessionUserId = (session.user as any)?.id;
        const sessionEmail = session.user?.email?.trim().toLowerCase();
        const sessionRole = (session.user as any)?.role;

        // Strictly only the OWNER of this specific space can modify it (ADMIN and other owners are not allowed)
        const isOwnerOfSpace =
            sessionRole === "OWNER" &&
            Boolean(
                (sessionUserId && existingSpace.ownerId === sessionUserId) ||
                (sessionEmail && existingSpace.owner?.email?.trim().toLowerCase() === sessionEmail)
            );

        if (!isOwnerOfSpace) {
            return NextResponse.json(
                { message: "Forbidden: Only the owner can modify this space" },
                { status: 403 }
            );
        }

        const body = await req.json();

        const hourlyRate =
            body.hourlyRate !== undefined ? Number(body.hourlyRate) : existingSpace.hourlyRate;
        const dailyRate =
            body.dailyRate !== undefined && Number(body.dailyRate) > 0
                ? Number(body.dailyRate)
                : hourlyRate * 8;
        const weekendRate =
            body.weekendRate !== undefined && Number(body.weekendRate) > 0
                ? Number(body.weekendRate)
                : hourlyRate * 16;

        let amenitiesListValue = existingSpace.amenitiesList;
        if (Array.isArray(body.amenitiesList)) {
            amenitiesListValue = JSON.stringify(body.amenitiesList);
        } else if (typeof body.amenitiesList === "string") {
            amenitiesListValue = body.amenitiesList;
        }

        const photoUrls: string[] | undefined = Array.isArray(body.photos)
            ? body.photos
                  .map((p: any) => (typeof p === "string" ? p.trim() : p?.url?.trim()))
                  .filter(Boolean)
            : undefined;

        const updatedSpace = await prisma.space.update({
            where: { id },
            data: {
                name: body.name !== undefined ? String(body.name) : existingSpace.name,
                description:
                    body.description !== undefined ? String(body.description) : existingSpace.description,
                address: body.address !== undefined ? String(body.address) : existingSpace.address,
                city: body.city !== undefined ? String(body.city) : existingSpace.city,
                district: body.district !== undefined ? String(body.district) : existingSpace.district,
                category: body.category !== undefined ? String(body.category) : existingSpace.category,
                latitude:
                    body.latitude !== undefined && Number.isFinite(Number(body.latitude))
                        ? Number(body.latitude)
                        : existingSpace.latitude,
                longitude:
                    body.longitude !== undefined && Number.isFinite(Number(body.longitude))
                        ? Number(body.longitude)
                        : existingSpace.longitude,
                size:
                    body.size !== undefined ? Math.max(1, Math.round(Number(body.size))) : existingSpace.size,
                capacity:
                    body.capacity !== undefined
                        ? Math.max(1, Math.round(Number(body.capacity)))
                        : existingSpace.capacity,
                officeCount:
                    body.officeCount !== undefined
                        ? Math.max(1, Math.round(Number(body.officeCount)))
                        : existingSpace.officeCount,
                hourlyRate,
                dailyRate,
                weekendRate,
                hasWifi: body.hasWifi !== undefined ? Boolean(body.hasWifi) : existingSpace.hasWifi,
                hasProjector:
                    body.hasProjector !== undefined ? Boolean(body.hasProjector) : existingSpace.hasProjector,
                hasKitchen:
                    body.hasKitchen !== undefined ? Boolean(body.hasKitchen) : existingSpace.hasKitchen,
                hasParking:
                    body.hasParking !== undefined ? Boolean(body.hasParking) : existingSpace.hasParking,
                hasAC: body.hasAC !== undefined ? Boolean(body.hasAC) : existingSpace.hasAC,
                selfCleaning:
                    body.selfCleaning !== undefined ? Boolean(body.selfCleaning) : existingSpace.selfCleaning,
                active: body.active !== undefined ? Boolean(body.active) : existingSpace.active,
                isClean: body.isClean !== undefined ? Boolean(body.isClean) : existingSpace.isClean,
                amenitiesList: amenitiesListValue,
                ...(photoUrls
                    ? {
                          photos: {
                              deleteMany: {},
                              create: (photoUrls.length > 0 ? photoUrls : [DEFAULT_OFFICE_PHOTO]).map(
                                  (url) => ({ url })
                              ),
                          },
                      }
                    : {}),
            },
            include: {
                photos: true,
                owner: { select: { id: true, name: true, email: true } },
            },
        });

        return NextResponse.json({ message: "Space updated", space: updatedSpace });
    } catch (error) {
        console.error("Update space error:", error);
        return NextResponse.json({ message: "Failed to update space" }, { status: 500 });
    }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    return handleUpdateSpace(req, context);
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
    return handleUpdateSpace(req, context);
}
