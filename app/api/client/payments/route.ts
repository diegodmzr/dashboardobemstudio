import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        // Only clients can access this endpoint
        if (user.role !== "CLIENT") {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        // Build where clause
        const where: any = {
            clientId: user.id,
        };

        if (status && status !== "all") {
            if (status === "paid") {
                where.status = "PAID";
            } else if (status === "overdue") {
                where.status = "OVERDUE";
            } else if (status === "cancelled") {
                where.status = { in: ["CANCELLED", "FAILED"] };
            }
        }

        // Fetch payments
        const payments = await prisma.payment.findMany({
            where,
            include: {
                project: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Fetch active subscriptions to project upcoming payments
        const subscriptions = await prisma.subscription.findMany({
            where: {
                clientId: user.id,
                status: "active"
            }
        });

        // Fetch project names manually (since relation is missing in schema type for now)
        const projectIds = subscriptions.map(s => s.projectId).filter(Boolean) as string[];
        const projects = await prisma.project.findMany({
            where: { id: { in: projectIds } },
            select: { id: true, name: true }
        });

        const projectMap = new Map(projects.map(p => [p.id, p.name]));

        // Create virtual payments for next billing dates
        const virtualSubscriptionPayments = subscriptions.map(sub => ({
            id: `virtual_sub_${sub.id}_${sub.currentPeriodEnd ? sub.currentPeriodEnd.getTime() : Date.now()}`,
            projectId: sub.projectId,
            projectName: (sub.projectId ? projectMap.get(sub.projectId) : null) || "Abonnement Service",
            description: `Renouvellement Abonnement (${sub.interval === 'month' ? 'Mensuel' : sub.interval === 'year' ? 'Annuel' : 'Trimestriel'})`,
            amount: sub.amount,
            currency: sub.currency,
            status: "SCHEDULED", // or PENDING
            type: "SUBSCRIPTION",
            dueDate: sub.currentPeriodEnd,
            paidAt: null,
            scheduledDate: sub.currentPeriodEnd,
            stripeInvoiceId: null,
            stripeReceiptUrl: null,
            invoiceUrl: null,
            method: "Autopay",
            last4: null,
            createdAt: sub.createdAt, // Use sub creation date for sorting fallback? or just now?
            isVirtual: true,
            subscriptionId: sub.id,
            stripeSubscriptionId: sub.stripeSubscriptionId
        }));

        // Format real payments
        const formattedRealPayments = payments.map((p) => ({
            id: p.id,
            projectId: p.projectId,
            projectName: p.project?.name || "Sans projet",
            description: p.description,
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            type: p.type,
            dueDate: p.dueDate ? p.dueDate.toISOString() : null,
            paidAt: p.paidAt ? p.paidAt.toISOString() : null,
            scheduledDate: p.scheduledDate ? p.scheduledDate.toISOString() : null,
            stripeInvoiceId: p.stripeInvoiceId,
            stripeReceiptUrl: p.stripeReceiptUrl,
            invoiceUrl: p.invoiceUrl,
            method: p.method,
            last4: p.last4,
            createdAt: p.createdAt.toISOString(),
            isVirtual: false
        }));

        // Merge and sort
        const allPayments = [...formattedRealPayments, ...virtualSubscriptionPayments.map(vp => ({
            ...vp,
            dueDate: vp.dueDate ? vp.dueDate.toISOString() : null,
            scheduledDate: vp.scheduledDate ? vp.scheduledDate.toISOString() : null,
            createdAt: vp.createdAt.toISOString()
        }))].sort((a, b) => {
            // Sort by Date (Due date takes precedence for scheduled)
            const dateA = a.paidAt || a.dueDate || a.createdAt;
            const dateB = b.paidAt || b.dueDate || b.createdAt;
            return new Date(dateB!).getTime() - new Date(dateA!).getTime();
        });

        return NextResponse.json({ payments: allPayments });
    } catch (error) {
        console.error("Error fetching client payments:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
