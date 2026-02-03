import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { clientId, priceId, projectId } = body;

        if (!clientId || !priceId) {
            return NextResponse.json(
                { error: "clientId et priceId requis" },
                { status: 400 }
            );
        }

        // Get client info
        const client = await prisma.user.findUnique({
            where: { id: clientId },
        });

        if (!client) {
            return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        }

        const origin = req.headers.get("origin") || req.nextUrl.origin;

        // Create Stripe Checkout Session in subscription mode
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [
                {
                    price: priceId, // This is a Stripe Price ID (e.g., price_xxxxx)
                    quantity: 1,
                },
            ],
            success_url: `${origin}/dashboard/finances/abonnements?success=true`,
            cancel_url: `${origin}/dashboard/finances/abonnements?canceled=true`,
            customer_email: client.email,
            metadata: {
                clientId: client.id,
                projectId: projectId || "",
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Stripe Subscription Error:", error);
        return NextResponse.json(
            { error: error.message || "Erreur lors de la création de l'abonnement" },
            { status: 500 }
        );
    }
}
