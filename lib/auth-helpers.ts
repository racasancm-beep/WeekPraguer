import { prisma } from "@/lib/prisma";

export interface ResolvedUser {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: string | null;
}

/**
 * Resolves a database User record reliably from a NextAuth session.
 * Checks both session.user.id and session.user.email (case-insensitive).
 */
export async function resolveAuthenticatedUser(session: any): Promise<ResolvedUser | null> {
    if (!session || !session.user) return null;

    const rawId = (session.user as any)?.id;
    const rawEmail = session.user?.email;

    if (rawId) {
        const byId = await prisma.user.findUnique({
            where: { id: rawId },
            select: { id: true, email: true, name: true, role: true },
        });
        if (byId) return byId;
    }

    if (rawEmail && typeof rawEmail === "string") {
        const byEmail = await prisma.user.findFirst({
            where: { email: { equals: rawEmail.trim(), mode: "insensitive" } },
            select: { id: true, email: true, name: true, role: true },
        });
        if (byEmail) return byEmail;
    }

    return null;
}

/**
 * Resolves the owner ID for listing/space creation and management.
 * Falls back to first matching owner/admin if session user ID is not yet in DB.
 */
export async function resolveOwnerId(session: any): Promise<string | null> {
    const user = await resolveAuthenticatedUser(session);
    if (user?.id) return user.id;

    const fallbackOwner = await prisma.user.findFirst({
        where: { role: { in: ["OWNER", "ADMIN", "SERVICE_OWNER"] } },
        select: { id: true },
    });
    return fallbackOwner?.id || null;
}
