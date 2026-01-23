
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUBSCRIPTION_PLANS } from "@/lib/payments/stripe-subscription";

export const dynamic = 'force-dynamic';

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

        const tier = user.subscriptionTier || "FREE";
        const limit = SUBSCRIPTION_PLANS[tier].aiLimit;

        // Check usage limits
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

        // Proxy to Anthropic (Claude)
        const { messages, system, tools } = await req.json();

        // Safely access key at runtime
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
        }

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
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

        // Update usage count
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
