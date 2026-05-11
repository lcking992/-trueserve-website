
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import * as Sentry from '@sentry/nextjs';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event;

    try {
        event = getStripe().webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ""
        );
    } catch (err: any) {
        logger.error({ err }, `Webhook signature verification failed`);
        Sentry.captureException(err, { tags: { service: 'Stripe Webhook' } });
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":
            logger.info({ amount: session.amount, id: session.id }, `PaymentIntent was successful!`);
            // Here you could update order status if you weren't doing it in the action
            break;

        case "account.updated": {
            const account = event.data.object as any;
            if (account.details_submitted && account.metadata?.role === 'driver') {
                const { error } = await supabaseAdmin
                    .from('Driver')
                    .update({ stripeOnboardingComplete: true })
                    .eq('stripeAccountId', account.id);
                if (error) {
                    logger.error({ err: error, accountId: account.id }, "Failed to update driver onboarding status");
                } else {
                    logger.info({ accountId: account.id }, `Driver account verified.`);
                }
            } else if (account.details_submitted) {
                const { error } = await supabaseAdmin
                    .from('Restaurant')
                    .update({ stripeOnboardingComplete: true })
                    .eq('stripeAccountId', account.id);
                if (error) {
                    logger.error({ err: error, accountId: account.id }, "Failed to update merchant onboarding status");
                    Sentry.captureException(error, { extra: { accountId: account.id } });
                } else {
                    logger.info({ accountId: account.id }, `Merchant account verified.`);
                }
            }
            break;
        }

        case "charge.refunded":
            // Handle order cancellation/refund in DB
            const charge = event.data.object as any;
            const paymentIntentId = charge.payment_intent;

            // Note: In a real app, you'd find the order by payment intent ID
            logger.info({ chargeId: charge.id, paymentIntentId }, `Charge was refunded.`);
            break;

        default:
            logger.info({ type: event.type }, `Unhandled event type`);
    }

    return new NextResponse(null, { status: 200 });
}
