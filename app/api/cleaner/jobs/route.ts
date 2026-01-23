import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CLEANER") {
        // For MVP internal focus, we might want to allow seeing all unassigned jobs?
        // Or strictly check role.
        if (session?.user.role !== "CLEANER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    try {
        // Fetch all logs that are either unassigned OR assigned to this cleaner
        const jobs = await prisma.cleaningLog.findMany({
            where: {
                OR: [
                    { cleanerId: null },
                    { cleanerId: session.user.id }
                ]
            },
            include: {
                booking: {
                    include: { space: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ jobs });
    } catch (error) {
        console.error("Cleaner jobs error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
