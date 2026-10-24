import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== "OWNER" && role !== "ADMIN")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    try {
        const body = await req.json();
        const { action, proposedStartTime, proposedEndTime } = body;
        const resolvedParams = await params;
        const bookingId = resolvedParams.id;
        
        const booking = await (prisma as any).booking.findUnique({ where: { id: bookingId }, include: { space: true } });
        if (!booking || (role !== "ADMIN" && booking.space.ownerId !== session.user.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
        
        if (action === "APPROVE") {
            await (prisma as any).booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } });
            return NextResponse.json({ success: true });
        }
        
        if (action === "SUGGEST") {
            await (prisma as any).booking.update({ 
                where: { id: bookingId }, 
                data: { 
                    status: "OWNER_PROPOSED",
                    proposedStartTime: new Date(proposedStartTime),
                    proposedEndTime: new Date(proposedEndTime)
                } 
            });
            
            return NextResponse.json({ success: true });
        }
        
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
