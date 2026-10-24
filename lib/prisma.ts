import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatabaseUrl(): string | undefined {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) return undefined;
    if (rawUrl.includes("schema=")) return rawUrl;
    return rawUrl.includes("?") ? `${rawUrl}&schema=hours` : `${rawUrl}?schema=hours`;
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: {
                url: getDatabaseUrl(),
            },
        },
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
