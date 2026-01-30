import { prisma } from "@/lib/prisma";
import SubscriptionsClient from "@/components/admin/subscriptions/SubscriptionsClient";
import ClientSubscriptionsClient from "@/components/client/ClientSubscriptionsClient";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function SubscriptionsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    // --- CLIENT VIEW ---
    if (user.role === "CLIENT") {
        return <ClientSubscriptionsClient />;
    }

    // --- ADMIN VIEW ---
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

    const clients = await prisma.user.findMany({
        where: { role: "CLIENT" },
        select: { id: true, name: true, companyName: true },
        orderBy: { name: "asc" },
    });

    const projects = await prisma.project.findMany({
        select: { id: true, name: true, clientId: true },
    });

    // Determine startDate/endDate from metadata if needed standardizing
    const serializedSubscriptions = subscriptions.map((s: any) => {
        let startDate = s.startDate;
        let endDate = s.endDate;

        // Try fallback from metadata if needed (same logic as API)
        if (s.metadata) {
            try {
                const meta = JSON.parse(s.metadata);
                if (meta.startDate && !startDate) startDate = new Date(meta.startDate);
                if (meta.endDate && !endDate) endDate = new Date(meta.endDate);
            } catch (e) { }
        }

        return {
            ...s,
            startDate: startDate ? startDate.toISOString() : new Date().toISOString(),
            endDate: endDate ? endDate.toISOString() : null,
            currentPeriodStart: s.currentPeriodStart ? s.currentPeriodStart.toISOString() : "",
            currentPeriodEnd: s.currentPeriodEnd ? s.currentPeriodEnd.toISOString() : "",
            canceledAt: s.canceledAt ? s.canceledAt.toISOString() : null,
            endedAt: s.endedAt ? s.endedAt.toISOString() : null,
            createdAt: s.createdAt.toISOString(),
            updatedAt: s.updatedAt.toISOString(),
        };
    });

    return (
        <SubscriptionsClient
            initialSubscriptions={serializedSubscriptions}
            initialStats={stats}
            clients={clients}
            projects={projects}
        />
    );
}
