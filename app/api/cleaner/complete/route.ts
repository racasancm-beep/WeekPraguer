import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CLEANER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { jobId } = await req.json();

        const job = await (prisma as any).cleaningLog.findUnique({
            where: { id: jobId },
            include: { booking: { include: { space: true } } }
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        if (job.cleanerId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Update status to COMPLETED and set checkOutTime
        // Also set space.isClean to true
        await (prisma as any).$transaction([
            (prisma as any).cleaningLog.update({
                where: { id: jobId },
                data: {
                    status: "COMPLETED",
                    checkOutTime: new Date()
                }
            }),
            (prisma as any).space.update({
                where: { id: job.booking.spaceId },
                data: { isClean: true }
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Complete error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
