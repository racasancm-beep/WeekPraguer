import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // Actually in Next 15 `params` is a Promise in page components, but usually object in route handlers. 
    // Wait, Next 15 changed params to Promise in Layouts/Pages. In route handlers it receives `context`.
    // `export async function GET(request, context) { const params = await context.params; ... }`

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
