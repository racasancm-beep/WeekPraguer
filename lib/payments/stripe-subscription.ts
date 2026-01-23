
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
} as any);

export const SUBSCRIPTION_PLANS = {
    FREE: {
        name: 'Free',
        priceId: null, // No Stripe price for free tier
        aiLimit: 5,
    },
    PREMIUM: {
        name: 'Premium',
        priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
        aiLimit: 50,
    },
    ULTIMATE: {
        name: 'Ultimate',
        priceId: process.env.STRIPE_ULTIMATE_PRICE_ID,
        aiLimit: 500,
    },
};

export async function createSubscriptionSession(userId: string, userEmail: string, tier: keyof typeof SUBSCRIPTION_PLANS) {
    const plan = SUBSCRIPTION_PLANS[tier];
    if (!plan.priceId) {
        throw new Error('This plan does not require a subscription payment');
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price: plan.priceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXTAUTH_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
        customer_email: userEmail,
        client_reference_id: userId,
        metadata: {
            userId,
            tier,
        },
    });

    return session;
}

export async function cancelSubscription(subscriptionId: string) {
    return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
    });
}
