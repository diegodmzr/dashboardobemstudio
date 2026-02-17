import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        let data = {
            kpis: {},
            activity: [] as any[],
            projects: [] as any[],
            payments: [] as any[]
        };

        if (isAdmin) {
            // --- ADMIN DATA ---

            // 1. KPIs
            // CA du mois (Paid payments this month)
            const monthlyRevenue = await prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: "PAID",
                    paidAt: { gte: firstDayOfMonth },
                    isArchived: false
                } as any
            });

            // Pending Payments (Total)
            const pendingPayments = await prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: "PENDING",
                    isArchived: false
                } as any
            });

            // Open Demandes (Conversations not CLOSED)
            const openDiscussions = await prisma.conversation.count({
                where: { status: { not: "CLOSED" } }
            });

            // Pending Invoices (Quotes sent but not accepted could be interesting, but stick to payments)

            data.kpis = {
                monthlyRevenue: monthlyRevenue?._sum?.amount || 0,
                pendingPayments: pendingPayments?._sum?.amount || 0,
                openDiscussions,
            };

            // 2. Activity (Audit Logs + Notifications simulated)
            const logs = await prisma.auditLog.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { user: { select: { name: true, avatar: true } } }
            });
            // Fetch related project names for better context
            const projectIds = logs
                .filter(log => log.entity === "Project" && log.entityId)
                .map(log => log.entityId);

            const projects = await prisma.project.findMany({
                where: { id: { in: projectIds } },
                select: { id: true, name: true }
            });

            const projectMap = new Map(projects.map(p => [p.id, p.name]));

            data.activity = logs.map(log => {
                let actionText = log.action;
                let entityName = log.entity;

                if (log.entity === "Project") {
                    const projectName = projectMap.get(log.entityId);
                    entityName = projectName ? `le projet "${projectName}"` : "un projet";

                    if (log.action === "UPDATE_PROJECT") actionText = "a mis à jour";
                    else if (log.action === "CREATE_PROJECT") actionText = "a créé";
                    else if (log.action === "DELETE_PROJECT") actionText = "a supprimé";
                }

                // Fallback for other entities or unhandled actions
                if (actionText === log.action) {
                    // Try to make it a bit more readable if not mapped
                    actionText = actionText.replace(/_/g, " ").toLowerCase();
                }

                return {
                    id: log.id,
                    type: log.action,
                    text: `${log.user.name} ${actionText} ${entityName}`,
                    date: log.createdAt,
                    icon: "activity"
                };
            });

            // 3. Projects (Recently updated)
            data.projects = await prisma.project.findMany({
                take: 5,
                orderBy: { updatedAt: "desc" },
                include: { client: { select: { name: true, avatar: true } } }
            });

            // 4. Payments (Recent & Overdue)
            data.payments = await prisma.payment.findMany({
                where: { isArchived: false } as any,
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { client: { select: { name: true } } }
            });

        } else {
            // --- CLIENT DATA ---

            // 1. KPIs
            // Active Projects
            const activeProjectsCount = await prisma.project.count({
                where: {
                    clientId: user.id,
                    status: { not: "TERMINÉ" } // Assuming "TERMINÉ" or similar
                }
            });

            // Total Spent (Paid payments)
            const totalSpent = await prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    clientId: user.id,
                    status: "PAID",
                    isArchived: false
                } as any
            });

            // Pending Payments
            const myPendingPayments = await prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    clientId: user.id,
                    status: "PENDING",
                    isArchived: false
                } as any
            });

            data.kpis = {
                activeProjects: activeProjectsCount,
                totalSpent: totalSpent?._sum?.amount || 0,
                pendingAmount: myPendingPayments?._sum?.amount || 0
            };

            // 2. Activity (Project updates, Payment confirmations)
            // We can fetch audit logs related to this user or generic project updates
            const projectUpdates = await prisma.projectStatusHistory.findMany({
                where: { project: { clientId: user.id } },
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { project: true }
            });

            data.activity = projectUpdates.map(update => ({
                id: update.id,
                type: "PROJECT_UPDATE",
                text: `Le projet ${update.project.name} est passé à ${update.newStatus}`,
                date: update.createdAt,
                icon: "layers"
            }));

            // 3. My Projects
            data.projects = await prisma.project.findMany({
                where: { clientId: user.id },
                orderBy: { updatedAt: "desc" },
                include: {
                    payments: true // To calculate progress or show specific info
                }
            });

            // 4. My Payments
            data.payments = await prisma.payment.findMany({
                where: {
                    clientId: user.id,
                    isArchived: false
                } as any,
                take: 5,
                orderBy: { createdAt: "desc" }
            });
        }

        return NextResponse.json({ ...data, role: user.role, userName: user.name });

    } catch (error) {
        console.error("[DASHBOARD_OVERVIEW]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
