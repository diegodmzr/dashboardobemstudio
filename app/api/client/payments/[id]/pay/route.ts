import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-12-18.acacia" as any, // Using type assertion to bypass specific version requirement
    typescript: true,
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        if (user.role !== "CLIENT") {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        const { id } = await params;

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                project: true,
            },
        });

        if (!payment) {
            return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });
        }

        if (payment.clientId !== user.id) {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        if (payment.status === "PAID") {
            return NextResponse.json({ error: "Paiement déjà effectué" }, { status: 400 });
        }

        // Cast payment to any to access new fields until Prisma Client is fully regenerated
        const p = payment as any;

        // Check if it's a subscription
        const isSubscription = payment.type === "SUBSCRIPTION";

        const priceData: any = {
            currency: payment.currency.toLowerCase(),
            product_data: {
                name: `Paiement - ${payment.project?.name || "Projet"}`,
                description: p.description || "Règlement de facture",
            },
            unit_amount: Math.round(payment.amount * 100), // Amount in cents
        };

        if (isSubscription) {
            priceData.recurring = {
                interval: "month", // Default to monthly for now
            };
        }

        const origin = req.headers.get("origin") || req.nextUrl.origin;

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: priceData,
                    quantity: 1,
                },
            ],
            mode: isSubscription ? "subscription" : "payment",
            success_url: `${origin}/dashboard/finances/paiements?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/dashboard/finances/paiements?canceled=true`,
            customer_email: user.email,
            metadata: {
                paymentId: payment.id,
                userId: user.id,
                projectId: payment.projectId || "",
            },
        });

        // Save session ID if needed? 
        // We could update payment with stripePaymentIntentId via webhook later.

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        return NextResponse.json({ error: "Erreur lors de l'initialisation du paiement" }, { status: 500 });
    }
}
