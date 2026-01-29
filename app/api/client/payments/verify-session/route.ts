import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID manquante" }, { status: 400 });
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return NextResponse.json({ error: "Session invalide" }, { status: 404 });
        }

        // Check payment status
        if (session.payment_status === "paid") {
            const paymentId = session.metadata?.paymentId;

            if (paymentId) {
                // Update the payment in DB
                await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: "PAID",
                        paidAt: new Date(),
                        stripePaymentIntentId: session.payment_intent as string,
                        stripeReceiptUrl: session.url,
                        method: "CARD",
                    }
                });

                return NextResponse.json({ success: true, paymentId });
            }
        }

        return NextResponse.json({ success: false, status: session.payment_status });

    } catch (error) {
        console.error("Error verifying session:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
