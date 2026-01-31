import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const where: any = {};
        if (status && status !== "ALL") where.status = status;

        const subscriptions = await prisma.subscription.findMany({
            where,
            include: {
                client: {
                    select: { id: true, name: true, companyName: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Enhance with metadata
        const enhancedSubscriptions = subscriptions.map((sub: any) => {
            let startDate = sub.startDate || sub.currentPeriodStart; // Fallback to currentPeriodStart
            let endDate = sub.endDate || null;
            let commitmentEndDate = sub.commitmentEndDate || null; // Will work when DB synced, else null

            if (sub.metadata) {
                try {
                    const meta = JSON.parse(sub.metadata);
                    if (meta.startDate) startDate = meta.startDate;
                    if (meta.endDate) endDate = meta.endDate;
                    if (meta.commitmentEndDate) commitmentEndDate = meta.commitmentEndDate;
                } catch (e) {
                    // Ignore JSON parse error
                }
            }
            return { ...sub, startDate, endDate, commitmentEndDate };
        });

        // Calculate MRR (Monthly Recurring Revenue)
        const mrr = subscriptions
            .filter((s) => s.status === "active")
            .reduce((sum, s) => {
                // Convert to monthly
                let monthlyAmount = s.amount;
                if (s.interval === "year") monthlyAmount = s.amount / 12;
                if (s.interval === "quarter") monthlyAmount = s.amount / 3;
                return sum + monthlyAmount;
            }, 0);

        const stats = {
            mrr,
            activeCount: subscriptions.filter((s) => s.status === "active").length,
            canceledCount: subscriptions.filter((s) => s.status === "canceled").length,
        };

        return NextResponse.json({ subscriptions: enhancedSubscriptions, stats });
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des abonnements" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { clientId, amount, interval, startDate, durationMonths, commitmentMonths, projectId } = body;

        if (!clientId || !amount || !interval || !startDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const start = new Date(startDate);
        let endDate = null;
        let commitmentEndDate = null;

        if (durationMonths && durationMonths > 0) {
            endDate = new Date(start);
            endDate.setMonth(endDate.getMonth() + durationMonths);
        }

        if (commitmentMonths && commitmentMonths > 0) {
            commitmentEndDate = new Date(start);
            commitmentEndDate.setMonth(commitmentEndDate.getMonth() + commitmentMonths);
        }

        // Calculate first period end
        const firstPeriodEnd = new Date(start);
        if (interval === "year") {
            firstPeriodEnd.setFullYear(firstPeriodEnd.getFullYear() + 1);
        } else if (interval === "quarter") {
            firstPeriodEnd.setMonth(firstPeriodEnd.getMonth() + 3);
        } else {
            // Default month
            firstPeriodEnd.setMonth(firstPeriodEnd.getMonth() + 1);
        }

        // Workaround for stale Prisma Client: Generate a unique ID if not provided
        // The schema allows null, but the running client might not have updated yet due to file locks on Windows
        const dummyStripeId = `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Note: 'commitmentEndDate' field was added to schema but might not be in the generated client yet due to lock errors.
        // We will pass it in 'data' but also put it in metadata as a backup until restart.

        const subscription = await prisma.subscription.create({
            data: {
                clientId,
                amount,
                interval,
                currentPeriodStart: start,
                currentPeriodEnd: firstPeriodEnd,
                status: "incomplete",
                projectId: projectId || undefined,
                intervalCount: 1, // Default to 1
                currency: "EUR",
                stripeSubscriptionId: dummyStripeId,
                stripeCustomerId: "manual_client",
                stripePriceId: "manual_price",
                // Store new fields in metadata until schema is synced
                metadata: JSON.stringify({
                    startDate: start.toISOString(),
                    endDate: endDate ? endDate.toISOString() : null,
                    commitmentEndDate: commitmentEndDate ? commitmentEndDate.toISOString() : null,
                    durationMonths,
                    commitmentMonths
                })
            },
        });

        // Manually attach these fields to the response so UI sees them immediately
        const responseSub = {
            ...subscription,
            startDate: start,
            endDate: endDate,
            commitmentEndDate: commitmentEndDate
        };

        // --- NOTIFICATION & EMAIL ---

        // 1. Fetch Client Details
        const client = await prisma.user.findUnique({ where: { id: clientId } });

        if (client) {
            try {
                // 2. Create In-App Notification
                await prisma.notification.create({
                    data: {
                        userId: clientId,
                        title: "Nouvel abonnement",
                        message: `Un nouvel abonnement de ${amount}€ / ${interval === "month" ? "mois" : "an"} a été créé pour vous.`,
                        type: "PAYMENT",
                        entityType: "Subscription", // Using string as per schema
                        entityId: subscription.id
                    }
                });

                // 3. Send Email
                // Using dynamic import or direct import if possible. lib/email is standard.
                const { sendEmail } = await import("@/lib/email");
                const host = req.headers.get("host") || "dashboard.obemstudio.com";
                const protocol = host.includes("localhost") ? "http" : "https";
                const baseUrl = `${protocol}://${host}`;

                const emailHtml = `
                    <h2 style="margin-top: 0; color: #000; font-size: 20px;">Nouvel Abonnement</h2>
                    <p>Bonjour ${client.name},</p>
                    <p>Un nouvel abonnement a été mis en place pour votre compte <strong>Obem Studio</strong>.</p>
                    
                    <div style="background-color: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 12px; padding: 25px; margin: 25px 0;">
                        <p style="margin-top: 0; font-weight: bold; color: #666; font-size: 13px; text-transform: uppercase;">Récapitulatif :</p>
                        <p style="margin: 8px 0 0 0;"><strong>Montant :</strong> ${amount}€ / ${interval === "month" ? "mois" : interval}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Date de début :</strong> ${start.toLocaleDateString("fr-FR")}</p>
                        ${durationMonths ? `<p style="margin: 5px 0 0 0;"><strong>Durée :</strong> ${durationMonths} mois</p>` : ""}
                        ${commitmentMonths ? `<p style="margin: 5px 0 0 0;"><strong>Engagement :</strong> ${commitmentMonths} mois</p>` : ""}
                    </div>

                    <p>Vous pouvez retrouver tous les détails de votre facturation directement dans votre espace client.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${baseUrl}/dashboard/finances/abonnements" 
                           style="display: inline-block; background-color: #000; color: #fff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            Consulter mon abonnement
                        </a>
                    </div>
                `;

                await sendEmail(client.email, "Nouvel abonnement disponible", emailHtml);

            } catch (notifyError) {
                console.error("Failed to notify user:", notifyError);
                // Don't fail the request if notification fails
            }
        }

        return NextResponse.json(responseSub);
    } catch (error) {
        console.error("Error creating subscription:", error);
        return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
    }
}
