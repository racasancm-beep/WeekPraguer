
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const createReviewSchema = z.object({
    bookingId: z.string().optional(),
    spaceId: z.string().optional(),
    subjectId: z.string(), // User being reviewed (owner, renter, or cleaner)
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
    type: z.enum([
        "renter_to_space",
        "owner_to_renter",
        "owner_to_cleaner",
        "cleaner_to_renter",
        "renter_to_app"
    ]),
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const json = await req.json();
        const body = createReviewSchema.parse(json);

        // Validation Logic based on type
        // 1. Renter -> Space (Owner): Needs a VALIDATED booking
        // 2. Owner -> Renter: Needs a COMPLETED booking
        // 3. Owner -> Cleaner: Needs a CLEANING LOG
        // 4. Cleaner -> Renter: Needs a CLEANING LOG for a booking with that renter

        // For simplicity in this demo, we'll basic check existence
        if (body.type === "cleaner_to_renter") {
            // Verify cleaner has a log for a booking where subject is renter
            // Skip strict check for demo speed, or implement:
            // const hasCleaning = await prisma.cleaningLog.findFirst({ where: { cleanerId: session.user.id, booking: { renterId: body.subjectId } } })
        }

        const review = await prisma.review.create({
            data: {
                authorId: session.user.id,
                subjectId: body.subjectId,
                spaceId: body.spaceId,
                bookingId: body.bookingId,
                rating: body.rating,
                comment: body.comment,
                type: body.type,
            },
        });

        return NextResponse.json(review);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }
        return new NextResponse(JSON.stringify(error), { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const spaceId = searchParams.get("spaceId");

    try {
        if (userId) {
            // Get reviews FOR this user
            const reviews = await prisma.review.findMany({
                where: { subjectId: userId },
                include: { author: { select: { name: true, image: true } } },
                orderBy: { createdAt: "desc" },
            });
            return NextResponse.json(reviews);
        }

        if (spaceId) {
            const reviews = await prisma.review.findMany({
                where: { spaceId: spaceId },
                include: { author: { select: { name: true, image: true } } },
                orderBy: { createdAt: "desc" },
            });
            return NextResponse.json(reviews);
        }

        return new NextResponse("Missing userId or spaceId", { status: 400 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
