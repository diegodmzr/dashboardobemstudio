import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-06-20",
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Updated to match Next.js 15+ convention where params is a Promise
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Await the params
        const { id } = await params;

        const subscription = await prisma.subscription.findUnique({
            where: { id },
        });

        if (!subscription) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }

        // If it already has a stripe subscription ID, we might ideally redirect to portal, 
        // but client wants to "Pay". If status is active, maybe update card?
        // If status is "past_due" or "unpaid" or if this is a "manual" sub we want to pay for.

        // 1. Create a Checkout Session for this amount/interval
        // We will use 'subscription' mode to create a NEW recurring charge on Stripe that matches this DB record.
        // NOTE: This will technically create a NEW Stripe subscription. 
        // Ideally we should link it back. But for "Manual" conversion to "Stripe", this is fine.

        const origin = req.headers.get("origin") || "http://localhost:3000";

        // Determine price data
        const recurring: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.Recurring = {
            interval: subscription.interval === "quarter" ? "month" : (subscription.interval as Stripe.Checkout.SessionCreateParams.LineItem.PriceData.Recurring.Interval), // Stripe doesn't support 'quarter' natively in some versions as string, usually it's month/year with usage. 
            // Wait, Stripe supports 'month', 'year', 'week', 'day'. 
            // For quarter, use interval_count: 3
            interval_count: subscription.interval === "quarter" ? 3 : 1
        };

        const session = await stripe.checkout.sessions.create({
            customer_email: user.email,
            mode: "subscription",
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: "EUR",
                        unit_amount: Math.round(subscription.amount * 100), // in cents
                        product_data: {
                            name: `Abonnement ${subscription.projectId ? "Projet" : "Service"} - ${subscription.interval}`,
                            description: `Paiement pour l'abonnement #${subscription.id}`,
                        },
                        recurring: recurring,
                    },
                },
            ],
            metadata: {
                localSubscriptionId: subscription.id,
                projectId: subscription.projectId || "",
                userId: user.id
            },
            success_url: `${origin}/dashboard/finances/abonnements?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/dashboard/finances/abonnements?canceled=true`,
        });

        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
