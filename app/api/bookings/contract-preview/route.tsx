import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { renderToStream } from "@react-pdf/renderer";
import { ContractDocument } from "@/lib/booking/contract-pdf";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real app, we would fetch the booking ID from URL or query params
    // and validate the user is relevant to the booking. 
    // For PREVIEW purpose before booking, we can accept query params with mock data or draft data.

    const { searchParams } = new URL(req.url);
    const spaceName = searchParams.get("spaceName") || "Space Name";
    const price = searchParams.get("price") || "0";
    const date = searchParams.get("date") || new Date().toDateString();

    const stream = await renderToStream(
        <ContractDocument 
        bookingId="PREVIEW"
        date = { new Date().toDateString() }
        ownerName = "Space Owner"
        renterName = { session.user.name || session.user.email || "Renter" }
        spaceName = { spaceName }
        spaceAddress = "Space Address"
        startTime = { date }
        endTime = { date }
        totalPrice = { parseFloat(price) }
        termsAcceptedAt = "Not yet accepted"
        />
  );

    return new NextResponse(stream as any, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'inline; filename="contract_preview.pdf"',
        },
    });
}
