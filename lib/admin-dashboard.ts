import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type KpiStats = {
    revenue: number;
    revenueTrend: number;
    netIncome: number;
    treasury: number;
    newClients: number;
    conversionRate: number;
};

export type DashboardData = {
    kpis: KpiStats;
    recentActivity: any[]; // Typed as AuditLog with relations
    urgentAlerts: {
        latePayments: any[];
        urgentTickets: any[];
    };
    recentProjects: any[];
};

/**
 * Fetches all necessary data for the Admin Dashboard.
 * Uses parallel queries for performance.
 */
export async function getDashboardData(): Promise<DashboardData> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
        paymentsThisMonth,
        paymentsLastMonth,
        pendingPayments,
        newClientsCount,
        totalQuotesSent,
        recentActivity,
        latePayments,
        urgentTickets,
        recentProjects,
    ] = await Promise.all([
        // 1. Revenue This Month (PAID)
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: {
                status: "PAID",
                paidAt: { gte: firstDayOfMonth },
            },
        }),
        // 2. Revenue Last Month (PAID)
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: {
                status: "PAID",
                paidAt: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth },
            },
        }),
        // 3. Treasury (PENDING/LATE)
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: { in: ["PENDING", "LATE"] } },
        }),
        // 4. New Clients This Month
        prisma.user.count({
            where: {
                role: "CLIENT",
                createdAt: { gte: firstDayOfMonth },
            },
        }),
        // 5. Total Quotes Sent This Month (for conversion)
        prisma.quote.count({
            where: {
                createdAt: { gte: firstDayOfMonth },
            },
        }),
        // 6. Recent Activity (AuditLog)
        prisma.auditLog.findMany({
            take: 20,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, companyLogo: true } } },
        }),
        // 7. Late Payments
        prisma.payment.findMany({
            where: { status: "LATE" },
            include: { client: { select: { name: true, companyLogo: true } } },
            orderBy: { dueDate: "asc" },
            take: 5,
        }),
        // 8. Urgent Tickets
        prisma.ticket.findMany({
            where: { status: "OPEN", priority: "URGENT" },
            include: { author: { select: { name: true, companyLogo: true } } },
            orderBy: { createdAt: "asc" },
            take: 5,
        }),
        // 9. Recent Projects
        prisma.project.findMany({
            take: 5,
            orderBy: { updatedAt: "desc" },
            include: { client: { select: { name: true, companyLogo: true } } },
        }),
    ]);

    // Calculations
    const currentRevenue = paymentsThisMonth._sum.amount || 0;
    const lastRevenue = paymentsLastMonth._sum.amount || 0;
    const revenueTrend = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 100;

    // Simple Net Income approx (Revenue - assumption of 30% costs if no CPP field)
    // In real app, sum CPP fields etc.
    const netIncome = currentRevenue * 0.7;

    const conversionRate = totalQuotesSent > 0 ? (newClientsCount / totalQuotesSent) * 100 : 0;

    return {
        kpis: {
            revenue: currentRevenue,
            revenueTrend,
            netIncome,
            treasury: pendingPayments._sum.amount || 0,
            newClients: newClientsCount,
            conversionRate,
        },
        recentActivity,
        urgentAlerts: {
            latePayments,
            urgentTickets,
        },
        recentProjects,
    };
}
