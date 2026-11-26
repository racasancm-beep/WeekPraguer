import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OwnerDashboardIndex() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }

    const userId = (session.user as any).id;
    const email = session.user.email?.trim().toLowerCase();
    const role = (session.user as any).role;

    // Check how many spaces / services this owner has created
    const count = await prisma.space.count({
        where: {
            OR: [
                ...(userId ? [{ ownerId: userId }] : []),
                ...(email ? [{ owner: { email: { equals: email, mode: "insensitive" as const } } }] : []),
            ],
        },
    });

    // If no service or space created yet, take directly to the create page!
    if (count === 0) {
        if (role === "SERVICE_OWNER") {
            redirect("/owner/dashboard/listings/create?type=SERVICE");
        } else {
            redirect("/owner/dashboard/listings/create");
        }
    }

    // If there is already at least one space or service created, open dashboard!
    redirect("/owner/dashboard/earnings");
}
