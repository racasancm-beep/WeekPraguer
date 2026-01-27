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
        const userId = session.user.id;

        const jobs = await prisma.cleaningLog.findMany({
            where: {
                OR: [
                    { cleanerId: null },
                    { cleanerId: userId }
                ],
                booking: {
                    space: {
                        selfCleaning: false
                    }
                }
            },
            include: {
                booking: {
                    include: {
                        space: {
                            include: { owner: { select: { name: true, email: true } } }
                        }
                    }
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
