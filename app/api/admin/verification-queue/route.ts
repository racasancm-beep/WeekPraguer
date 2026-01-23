import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                verified: false,
                role: {
                    in: ["OWNER", "CLEANER"],
                },
                phone: {
                    not: null, // Only show users who started onboarding
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                companyName: true,
                billingAddress: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            }
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Queue fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
