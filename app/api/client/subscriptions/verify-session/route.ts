import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-06-20" as any,
});

export async function POST(req: NextRequest) {
    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID missing" }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== "paid") {
            return NextResponse.json({ success: false, error: "Payment not paid" });
        }

        const stripeSubscriptionId = session.subscription as string;
        const localSubscriptionId = session.metadata?.localSubscriptionId;

        if (!localSubscriptionId || !stripeSubscriptionId) {
            return NextResponse.json({ error: "Invalid session metadata" }, { status: 400 });
        }

        // Update the local subscription to link it with Stripe Subscription
        await prisma.subscription.update({
            where: { id: localSubscriptionId },
            data: {
                stripeSubscriptionId: stripeSubscriptionId,
                status: "active", // Ensure it's active
                stripeCustomerId: session.customer as string,
                // We could also update currentPeriodEnd from Stripe Subscription retrieved if we wanted to be precise
            },
        });

        // Also, since this WAS a payment, we should probably record the First Payment in our database if webhooks haven't caught it yet.
        // But for "Activation" purpose, linking the ID is the most critical part for UI update.

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error verifying subscription session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
