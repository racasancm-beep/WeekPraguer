import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

/**
 * Get the current user session in server components or API routes
 */
export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session?.user;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("Unauthorized");
    }
    return user;
}

/**
 * Require specific role - throws error if user doesn't have the required role
 */
export async function requireRole(role: UserRole) {
    const user = await requireAuth();
    if ((user as any).role !== role) {
        throw new Error("Forbidden - Insufficient permissions");
    }
    return user;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;
    return (user as any).role === role;
}
