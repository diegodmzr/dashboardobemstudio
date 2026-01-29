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

        // Format response
        const formattedPayments = payments.map((p) => ({
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
        }));

        return NextResponse.json({ payments: formattedPayments });
    } catch (error) {
        console.error("Error fetching client payments:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
