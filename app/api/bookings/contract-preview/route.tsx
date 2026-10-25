import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { renderToStream } from "@react-pdf/renderer";
import { ContractDocument } from "@/lib/booking/contract-pdf";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const spaceName = searchParams.get("spaceName") || "Space Name";
    const price = searchParams.get("price") || "0";
    const date = searchParams.get("date") || new Date().toDateString();

    const stream = await renderToStream(
        <ContractDocument 
            bookingId="PREVIEW"
            date={new Date().toDateString()}
            ownerName="Space Owner"
            renterName={session.user.name || session.user.email || "Renter"}
            spaceName={spaceName}
            spaceAddress="Space Address"
            startTime={date}
            endTime={date}
            totalPrice={parseFloat(price)}
            termsAcceptedAt="Not yet accepted"
        />
    );

    return new NextResponse(stream as any, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'inline; filename="contract_preview.pdf"',
        },
    });
}
