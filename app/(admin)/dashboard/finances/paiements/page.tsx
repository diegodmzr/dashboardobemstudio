import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import PaymentsClient from "@/components/admin/payments/PaymentsClient";
import ClientPaymentsClient from "@/components/client/ClientPaymentsClient";

export const revalidate = 0;

export default async function PaymentsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    // CLIENT VIEW: Show only their payments
    if (user.role === "CLIENT") {
        const payments = await prisma.payment.findMany({
            where: {
                clientId: user.id,
            },
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

        return (
            <ClientPaymentsClient
                initialPayments={formattedPayments}
                userName={user.name}
                userEmail={user.email}
            />
        );
    }

    // ADMIN VIEW: Show all payments with stats
    const payments = await prisma.payment.findMany({
        include: {
            client: {
                select: { id: true, name: true, companyName: true, email: true }
            }
        },
        orderBy: { createdAt: "desc" },
    });

    // Calculate aggregated stats
    const stats = {
        totalRevenue: payments
            .filter((p) => p.status === "PAID")
            .reduce((sum, p) => sum + p.amount, 0),
        pendingAmount: payments
            .filter((p) => p.status === "PENDING")
            .reduce((sum, p) => sum + p.amount, 0),
        lateCount: payments.filter((p) => p.status === "LATE" || p.status === "OVERDUE").length,
    };

    const clients = await prisma.user.findMany({
        where: { role: "CLIENT" },
        select: { id: true, name: true, companyName: true },
        orderBy: { name: "asc" },
    });

    const projects = await prisma.project.findMany({
        select: { id: true, name: true, clientId: true },
    });

    const serializedPayments = payments.map(p => ({
        ...p,
        dueDate: p.dueDate ? p.dueDate.toISOString() : null,
        paidAt: p.paidAt ? p.paidAt.toISOString() : null,
        scheduledDate: p.scheduledDate ? p.scheduledDate.toISOString() : null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }));

    return (
        <PaymentsClient
            initialPayments={serializedPayments}
            initialStats={stats}
            clients={clients}
            projects={projects}
        />
    );
}
