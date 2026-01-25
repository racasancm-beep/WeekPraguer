import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const cleaners = await prisma.user.findMany({
            where: { role: "CLEANER" },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                verified: true
            }
        });

        return NextResponse.json(cleaners);
    } catch (error) {
        console.error("Fetch cleaners error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
