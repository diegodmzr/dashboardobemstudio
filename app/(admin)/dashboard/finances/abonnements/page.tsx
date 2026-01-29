import { prisma } from "@/lib/prisma";
import SubscriptionsClient from "@/components/admin/subscriptions/SubscriptionsClient";

export const revalidate = 0;

export default async function AdminSubscriptionsPage() {
    const subscriptions = await prisma.subscription.findMany({
        include: {
            client: {
                select: { id: true, name: true, companyName: true, email: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const mrr = subscriptions
        .filter((s) => s.status === "active")
        .reduce((sum, s) => {
            const monthlyAmount = s.interval === "year" ? s.amount / 12 : s.amount;
            return sum + monthlyAmount;
        }, 0);

    const stats = {
        mrr,
        activeCount: subscriptions.filter((s) => s.status === "active").length,
        canceledCount: subscriptions.filter((s) => s.status === "canceled").length,
    };

    const clients = await prisma.user.findMany({
        where: { role: "CLIENT" },
        select: { id: true, name: true, companyName: true },
        orderBy: { name: "asc" },
    });

    const projects = await prisma.project.findMany({
        select: { id: true, name: true, clientId: true },
    });

    const serializedSubscriptions = subscriptions.map((s) => ({
        ...s,
        currentPeriodStart: s.currentPeriodStart.toISOString(),
        currentPeriodEnd: s.currentPeriodEnd.toISOString(),
        canceledAt: s.canceledAt ? s.canceledAt.toISOString() : null,
        endedAt: s.endedAt ? s.endedAt.toISOString() : null,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
    }));

    return (
        <SubscriptionsClient
            initialSubscriptions={serializedSubscriptions}
            initialStats={stats}
            clients={clients}
            projects={projects}
        />
    );
}
