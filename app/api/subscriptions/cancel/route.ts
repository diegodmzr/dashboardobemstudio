import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { subscriptionId } = body;

        if (!subscriptionId) {
            return NextResponse.json(
                { error: "subscriptionId requis" },
                { status: 400 }
            );
        }

        // Find subscription in DB
        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });

        if (!subscription) {
            return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 });
        }

        if (!subscription.stripeSubscriptionId) {
            return NextResponse.json({ error: "Cet abonnement n'est pas lié à Stripe" }, { status: 400 });
        }

        // Cancel in Stripe
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true, // Cancel at the end of the billing period
        });

        // Update in DB
        await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: "canceled",
                canceledAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, message: "Abonnement annulé" });
    } catch (error: any) {
        console.error("Cancel Subscription Error:", error);
        return NextResponse.json(
            { error: error.message || "Erreur lors de l'annulation" },
            { status: 500 }
        );
    }
}
