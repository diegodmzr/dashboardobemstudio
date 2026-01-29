import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// Disable body parsing, need raw body for Stripe signature verification
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get("stripe-signature");

        if (!signature) {
            return NextResponse.json({ error: "No signature" }, { status: 400 });
        }

        // Only verify webhook if secret is configured (production/staging)
        let event: Stripe.Event;

        if (process.env.STRIPE_WEBHOOK_SECRET) {
            try {
                event = stripe.webhooks.constructEvent(
                    body,
                    signature,
                    process.env.STRIPE_WEBHOOK_SECRET
                );
            } catch (err: any) {
                console.error("⚠️ Webhook signature verification failed:", err.message);
                return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
            }
        } else {
            // Development mode: parse without verification (not secure, only for local testing)
            console.warn("⚠️ STRIPE_WEBHOOK_SECRET not set. Running in UNSAFE mode.");
            event = JSON.parse(body);
        }

        // Handle the event
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;

                // Extract metadata
                const paymentId = session.metadata?.paymentId;

                if (!paymentId) {
                    console.error("No paymentId in session metadata");
                    return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
                }

                // Update payment status to PAID
                // Cast to any for temporary schema mismatch handling
                await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: "PAID",
                        paidAt: new Date(),
                        stripePaymentIntentId: (session.payment_intent as string) || session.id,
                        stripeInvoiceId: (session.invoice as string) || null,
                        stripeReceiptUrl: session.url || null,
                        method: "CARD",
                    } as any,
                });

                console.log(`✅ Payment ${paymentId} marked as PAID`);
                break;
            }

            case "checkout.session.expired": {
                const session = event.data.object as Stripe.Checkout.Session;
                const paymentId = session.metadata?.paymentId;

                if (paymentId) {
                    // Optionally update status back to PENDING or log the expiry
                    console.log(`⏱️ Checkout session expired for payment ${paymentId}`);
                }
                break;
            }

            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                // You could search for payment by stripePaymentId and mark as FAILED
                console.error(`❌ Payment failed: ${paymentIntent.id}`);
                break;
            }

            // Subscription Events
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const subscription = event.data.object as any;
                const clientId = subscription.metadata?.clientId;
                const projectId = subscription.metadata?.projectId;

                if (!clientId) {
                    console.error("No clientId in subscription metadata");
                    break;
                }

                // Upsert subscription in DB
                await prisma.subscription.upsert({
                    where: { stripeSubscriptionId: subscription.id },
                    create: {
                        stripeSubscriptionId: subscription.id,
                        stripeCustomerId: subscription.customer as string,
                        stripePriceId: subscription.items.data[0].price.id,
                        stripeProductId: subscription.items.data[0].price.product as string,
                        status: subscription.status,
                        amount: subscription.items.data[0].price.unit_amount! / 100,
                        currency: subscription.currency.toUpperCase(),
                        interval: subscription.items.data[0].price.recurring!.interval,
                        intervalCount: subscription.items.data[0].price.recurring!.interval_count,
                        currentPeriodStart: new Date(subscription.current_period_start * 1000),
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        clientId,
                        projectId: projectId || null,
                    },
                    update: {
                        status: subscription.status,
                        currentPeriodStart: new Date(subscription.current_period_start * 1000),
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
                        endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
                    },
                });

                console.log(`✅ Subscription ${subscription.id} synced (${subscription.status})`);
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;

                await prisma.subscription.update({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        status: "canceled",
                        canceledAt: new Date(),
                        endedAt: new Date(),
                    },
                });

                console.log(`🗑️ Subscription ${subscription.id} deleted`);
                break;
            }

            case "invoice.payment_succeeded": {
                const invoice = event.data.object as any;

                // This fires every time a subscription is billed
                // Create a Payment record for each successful invoice
                if (invoice.subscription) {
                    const subscription = await prisma.subscription.findUnique({
                        where: { stripeSubscriptionId: invoice.subscription as string },
                    });

                    if (subscription) {
                        await prisma.payment.create({
                            data: {
                                amount: invoice.amount_paid / 100,
                                currency: invoice.currency.toUpperCase(),
                                status: "PAID",
                                method: "CARD",
                                paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
                                stripePaymentId: invoice.payment_intent as string,
                                stripeInvoiceId: invoice.id,
                                invoiceUrl: invoice.hosted_invoice_url || undefined,
                                clientId: subscription.clientId,
                                projectId: subscription.projectId || undefined,
                                metadata: JSON.stringify({ subscriptionId: subscription.id }),
                            },
                        });

                        console.log(`💰 Payment recorded for invoice ${invoice.id}`);
                    }
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
