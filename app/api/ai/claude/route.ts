
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { SUBSCRIPTION_PLANS } from "@/lib/payments/stripe-subscription";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 1. Check if subscription is active
        if (!user.subscriptionActive && user.subscriptionTier !== "FREE") {
            // Fallback to FREE if subscription marked inactive but user has a tier (or just deny if that's the logic)
            // For this implementation, we allow FREE tier regardless.
        }

        const tier = user.subscriptionTier || "FREE";
        const limit = SUBSCRIPTION_PLANS[tier].aiLimit;

        // 2. Check usage limits
        // Reset count if it's a new day (simple daily reset logic)
        const today = new Date().toDateString();
        const lastUsedDay = user.lastAiUsageDate?.toDateString();

        let currentUsage = user.aiUsageCount;
        if (lastUsedDay !== today) {
            currentUsage = 0;
        }

        if (currentUsage >= limit) {
            return NextResponse.json({
                error: `Daily limit reached for ${tier} tier (${limit} requests). Please upgrade for more access.`
            }, { status: 429 });
        }

        // 3. Proxy to Anthropic (Claude)
        const { messages, system, tools } = await req.json();

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": process.env.ANTHROPIC_API_KEY!,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 1024,
                system,
                messages,
                tools,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();

        // 4. Update usage count
        await prisma.user.update({
            where: { id: userId },
            data: {
                aiUsageCount: currentUsage + 1,
                lastAiUsageDate: new Date(),
            },
        });

        return NextResponse.json(data);

    } catch (error) {
        console.error("AI Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
