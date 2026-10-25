import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const { phone, companyName, vatId, billingAddress, serviceRadius } = data;

        await prisma.user.update({
            where: { id: (session.user as any).id },
            data: {
                phone,
                companyName,
                vatId,
                billingAddress,
                serviceRadius,
                verified: false
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Onboarding error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
