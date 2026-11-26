import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const inquirySchema = z.object({
    category: z.enum(["HOW_IT_WORKS", "PAYMENT_ISSUES", "FRAUD_REPORT"]),
    message: z.string().min(3).max(400),
    email: z.string().email(),
    userName: z.string().optional(),
    pageUrl: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = inquirySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Date invalide. Asigură-te că emailul este valid și mesajul are maximum 400 caractere.", errors: parsed.error.errors },
                { status: 400 }
            );
        }

        const data = parsed.data;

        const inquiry = await prisma.publicInquiry.create({
            data: {
                category: data.category,
                message: data.message.trim().slice(0, 400),
                email: data.email.trim().toLowerCase(),
                userName: data.userName?.trim() || null,
                pageUrl: data.pageUrl || null,
                isSeen: false,
            },
        });

        return NextResponse.json({ success: true, inquiryId: inquiry.id }, { status: 201 });
    } catch (err: any) {
        console.error("Public inquiry error:", err);
        return NextResponse.json({ message: "Eroare la transmiterea mesajului" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = (session?.user as any)?.role;

        // Visible ONLY to the ADMIN profile
        if (!session || role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden: Acces permis doar profilului de administrator." }, { status: 403 });
        }

        const inquiries = await prisma.publicInquiry.findMany({
            orderBy: { createdAt: "desc" },
        });

        const unseenCount = await prisma.publicInquiry.count({
            where: { isSeen: false },
        });

        return NextResponse.json({
            inquiries,
            unseenCount,
        });
    } catch (err: any) {
        console.error("Admin fetch inquiries error:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
