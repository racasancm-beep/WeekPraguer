import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { OwnerListingsView } from "@/components/owner/owner-listings-view";

const prisma = new PrismaClient();

async function getOwnerSpaces(ownerId?: string) {
    return await prisma.space.findMany({
        where: ownerId ? { ownerId } : {},
        include: { photos: true, owner: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
    });
}

export default async function MyListingsPage({
    searchParams,
}: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || (role !== "OWNER" && role !== "ADMIN")) {
        redirect("/login");
    }

    const params = searchParams ? await searchParams : {};
    const targetUserId = typeof params.userId === "string" ? params.userId : undefined;

    const spaces = (await getOwnerSpaces(
        role === "ADMIN" ? targetUserId : (session.user as any).id
    )) as any[];

    return (
        <OwnerListingsView
            spaces={spaces}
            isAdminAllView={role === "ADMIN" && !targetUserId}
        />
    );
}
