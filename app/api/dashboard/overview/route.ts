import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const isAdmin = user.role === "ADMIN";
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
                    paidAt: { gte: firstDayOfMonth }
                }
            });

            // Pending Payments (Total)
            const pendingPayments = await prisma.payment.aggregate({
                _sum: { amount: true },
                where: { status: "PENDING" }
            });

            // Open Demandes (Conversations not CLOSED)
            const openDiscussions = await prisma.conversation.count({
                where: { status: { not: "CLOSED" } }
            });

            // Pending Invoices (Quotes sent but not accepted could be interesting, but stick to payments)

            data.kpis = {
                monthlyRevenue: monthlyRevenue._sum.amount || 0,
                pendingPayments: pendingPayments._sum.amount || 0,
                openDiscussions,
                // Maybe calculate a % change compared to last month here if needed, keeping it simple for now
            };

            // 2. Activity (Audit Logs + Notifications simulated)
            const logs = await prisma.auditLog.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { user: { select: { name: true, avatar: true } } }
            });
            data.activity = logs.map(log => ({
                id: log.id,
                type: log.action,
                text: `${log.user.name} a effectué ${log.action} sur ${log.entity}`,
                date: log.createdAt,
                icon: "activity"
            }));

            // 3. Projects (Recently updated)
            data.projects = await prisma.project.findMany({
                take: 5,
                orderBy: { updatedAt: "desc" },
                include: { client: { select: { name: true, avatar: true } } }
            });

            // 4. Payments (Recent & Overdue)
            data.payments = await prisma.payment.findMany({
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
                    status: "PAID"
                }
            });

            // Pending Payments
            const myPendingPayments = await prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    clientId: user.id,
                    status: "PENDING"
                }
            });

            data.kpis = {
                activeProjects: activeProjectsCount,
                totalSpent: totalSpent._sum.amount || 0,
                pendingAmount: myPendingPayments._sum.amount || 0
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
                where: { clientId: user.id },
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
