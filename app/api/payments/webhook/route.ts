import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2024-11-20.acacia",
    } as any);

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const tier = session.metadata?.tier;
                const bookingId = session.metadata?.bookingId;

                if (userId && tier) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            subscriptionTier: tier as any,
                            stripeSubscriptionId: session.subscription as string,
                            subscriptionActive: true,
                        },
                    });
                }

                // Ready for booking payment gateway connection: automatically sets Proof of Payment -> RESERVED
                if (bookingId) {
                    const paymentRef = `STRIPE:${session.payment_intent || session.id}`;
                    const existing = await prisma.booking.findUnique({ where: { id: bookingId } });
                    if (existing) {
                        const pin =
                            existing.accessCode && existing.accessCode !== "OWNER_BLOCK"
                                ? existing.accessCode
                                : String(Math.floor(100000 + Math.random() * 900000));

                        await prisma.$transaction([
                            prisma.transaction.upsert({
                                where: { bookingId },
                                create: {
                                    bookingId,
                                    amount: existing.totalPrice,
                                    currency: "RON",
                                    stripePaymentId: paymentRef,
                                    paymentStatus: "COMPLETED",
                                },
                                update: {
                                    stripePaymentId: paymentRef,
                                    paymentStatus: "COMPLETED",
                                },
                            }),
                            prisma.booking.update({
                                where: { id: bookingId },
                                data: {
                                    status: "CONFIRMED",
                                    paymentId: paymentRef,
                                    accessCode: pin,
                                },
                            }),
                        ]);
                    }
                }
                break;
            }
            case "payment_intent.succeeded": {
                const intent = event.data.object as Stripe.PaymentIntent;
                const bookingId = intent.metadata?.bookingId;
                if (bookingId) {
                    const paymentRef = `STRIPE:${intent.id}`;
                    const existing = await prisma.booking.findUnique({ where: { id: bookingId } });
                    if (existing) {
                        const pin =
                            existing.accessCode && existing.accessCode !== "OWNER_BLOCK"
                                ? existing.accessCode
                                : String(Math.floor(100000 + Math.random() * 900000));

                        await prisma.$transaction([
                            prisma.transaction.upsert({
                                where: { bookingId },
                                create: {
                                    bookingId,
                                    amount: existing.totalPrice,
                                    currency: "RON",
                                    stripePaymentId: paymentRef,
                                    paymentStatus: "COMPLETED",
                                },
                                update: {
                                    stripePaymentId: paymentRef,
                                    paymentStatus: "COMPLETED",
                                },
                            }),
                            prisma.booking.update({
                                where: { id: bookingId },
                                data: {
                                    status: "CONFIRMED",
                                    paymentId: paymentRef,
                                    accessCode: pin,
                                },
                            }),
                        ]);
                    }
                }
                break;
            }
            case "customer.subscription.updated":
            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const active = subscription.status === "active";

                await prisma.user.update({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        subscriptionActive: active,
                    },
                });
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook Handler Error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
