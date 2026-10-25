import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const space = await prisma.space.findUnique({
            where: { id: id },
            include: { photos: true }
        });

        if (!space) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json(space);
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
