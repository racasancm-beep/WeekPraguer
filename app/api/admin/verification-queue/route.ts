import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                verified: false,
                role: {
                    in: ["OWNER"],
                },
                phone: {
                    not: null,
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
