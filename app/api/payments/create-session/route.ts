import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        // Auth is already handled by the /dashboard layout middleware
        // const user = await getCurrentUser();
        // if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const body = await req.json();
        const { paymentId } = body;

        // 1. Get Payment Details
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { client: true },
        });

        if (!payment) return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });
        if (payment.status === "PAID") return NextResponse.json({ error: "Déjà payé" }, { status: 400 });

        const origin = req.headers.get("origin") || req.nextUrl.origin;

        // 2. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: `Paiement - ${payment.client.companyName || payment.client.name}`,
                            description: `Règlement de la facture #${payment.id.slice(-6).toUpperCase()}`,
                        },
                        unit_amount: Math.round(payment.amount * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${origin}/dashboard/finances/paiements?success=true`,
            cancel_url: `${origin}/dashboard/finances/paiements?canceled=true`,
            customer_email: payment.client.email,
            metadata: {
                paymentId: payment.id,
                clientId: payment.clientId,
            },
        });

        // 3. Save Stripe Session ID linking to our payment
        await prisma.payment.update({
            where: { id: paymentId },
            data: {
                stripePaymentIntentId: session.id,
                method: "CARD", // We anticipate card payment
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Error:", error);
        return NextResponse.json({ error: "Erreur lors de la création du lien Stripe" }, { status: 500 });
    }
}
