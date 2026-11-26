import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-service";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const session = await getServerSession(authOptions);
        const role = (session?.user as any)?.role;

        // Visible & manageable ONLY by the ADMIN profile
        if (!session || role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden: Doar profilul de administrator are acces." }, { status: 403 });
        }

        const inquiry = await prisma.publicInquiry.findUnique({
            where: { id },
        });

        if (!inquiry) {
            return NextResponse.json({ message: "Sesizarea nu a fost găsită" }, { status: 404 });
        }

        const body = await req.json();
        const { isSeen, replyText } = body;

        const updateData: any = {};
        if (typeof isSeen === "boolean") {
            updateData.isSeen = isSeen;
            if (isSeen && !inquiry.seenAt) {
                updateData.seenAt = new Date();
            }
        }

        if (replyText && typeof replyText === "string" && replyText.trim()) {
            updateData.replyText = replyText.trim();
            updateData.repliedAt = new Date();
            updateData.repliedBy = (session.user as any)?.id || "admin";
            updateData.isSeen = true;

            // Send response email to user's provided email address
            await sendEmail({
                to: inquiry.email,
                subject: `Răspuns MyGenie: ${inquiry.category === "FRAUD_REPORT" ? "Sesizare activitate" : "Răspuns solicitare"}`,
                html: `
                    <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: auto;">
                        <h2 style="color: #008080;">Echipa MyGenie a răspuns mesajului tău</h2>
                        <div style="background: #f8fafc; border-left: 4px solid #008080; padding: 12px 16px; margin: 16px 0;">
                            <p style="margin: 0; font-size: 13px; color: #64748b;">Mesajul tău inițial:</p>
                            <p style="margin: 4px 0 0; font-size: 14px; font-style: italic;">"${inquiry.message}"</p>
                        </div>
                        <h3 style="margin-top: 20px; font-size: 15px; color: #0f172a;">Răspunsul Administratorului:</h3>
                        <p style="font-size: 15px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${replyText.trim()}</p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                        <p style="font-size: 12px; color: #94a3b8;">Acesta este un mesaj oficial din partea platformei MyGenie (<a href="https://www.mygenieurope.com">www.mygenieurope.com</a>).</p>
                    </div>
                `,
                text: replyText.trim(),
            });
        }

        const updated = await prisma.publicInquiry.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, inquiry: updated });
    } catch (err: any) {
        console.error("Update inquiry error:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
