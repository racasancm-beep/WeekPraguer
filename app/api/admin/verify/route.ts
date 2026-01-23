import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { userId } = await req.json();

        await prisma.user.update({
            where: { id: userId },
            data: { verified: true },
        });

        // TODO: Send email notification "You are verified!"

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
