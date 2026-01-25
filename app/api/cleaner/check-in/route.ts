import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CLEANER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { jobId } = await req.json();

        // Verify the job exists and is assigned to this cleaner or unassigned
        const job = await prisma.cleaningLog.findUnique({
            where: { id: jobId },
            include: { booking: true }
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        if (job.cleanerId && job.cleanerId !== session.user.id) {
            return NextResponse.json({ error: "Job already assigned to another cleaner" }, { status: 403 });
        }

        // Update status to ACCEPTED and set checkInTime
        const updatedJob = await prisma.cleaningLog.update({
            where: { id: jobId },
            data: {
                status: "ACCEPTED",
                checkInTime: new Date(),
                cleanerId: session.user.id // Ensure it's assigned to the one who checked in
            }
        });

        return NextResponse.json({ success: true, job: updatedJob });
    } catch (error) {
        console.error("Check-in error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
