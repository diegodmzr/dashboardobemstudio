import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const startDateStr = searchParams.get("startDate");
        const endDateStr = searchParams.get("endDate");

        if (!startDateStr || !endDateStr) {
            return NextResponse.json({ error: "startDate and endDate required" }, { status: 400 });
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        // Set endDate to end of day to include all events on that day
        endDate.setHours(23, 59, 59, 999);

        // Calculate previous period (same duration)
        const duration = endDate.getTime() - startDate.getTime();
        const prevStartDate = new Date(startDate.getTime() - duration);
        const prevEndDate = startDate;

        // 1. CHIFFRE D'AFFAIRES (CA)
        const revenueData = await prisma.payment.aggregate({
            where: { status: "PAID", paidAt: { gte: startDate, lte: endDate } },
            _sum: { amount: true },
        });
        const revenue = revenueData._sum.amount || 0;

        const prevRevenueData = await prisma.payment.aggregate({
            where: { status: "PAID", paidAt: { gte: prevStartDate, lte: prevEndDate } },
            _sum: { amount: true },
        });
        const prevRevenue = prevRevenueData._sum.amount || 0;
        const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

        // 2. BÉNÉFICE (CA - CPP - Commissions - Frais fixes)
        const paymentsWithProjects = await prisma.payment.findMany({
            where: {
                status: "PAID",
                paidAt: { gte: startDate, lte: endDate },
                projectId: { not: null },
            },
            include: { project: { select: { cpp: true, commission: true } } },
        });

        const projectCosts = paymentsWithProjects.reduce((sum, p) => {
            const cpp = p.project?.cpp || 0;
            const commission = p.project?.commission || 0;
            return sum + cpp + commission;
        }, 0);

        // Fixed costs (monthly recurring)
        const fixedCosts = await prisma.fixedCost.findMany({
            where: {
                recurring: true,
                startDate: { lte: endDate },
                OR: [{ endDate: null }, { endDate: { gte: startDate } }],
            },
        });

        // Calculate months in period
        const monthsInPeriod = Math.max(1, Math.round(duration / (1000 * 60 * 60 * 24 * 30)));
        const totalFixedCosts = fixedCosts.reduce((sum, fc) => sum + fc.amount, 0) * monthsInPeriod;

        const profit = revenue - projectCosts - totalFixedCosts;

        // Previous profit
        const prevPaymentsWithProjects = await prisma.payment.findMany({
            where: {
                status: "PAID",
                paidAt: { gte: prevStartDate, lte: prevEndDate },
                projectId: { not: null },
            },
            include: { project: { select: { cpp: true, commission: true } } },
        });
        const prevProjectCosts = prevPaymentsWithProjects.reduce(
            (sum, p) => sum + (p.project?.cpp || 0) + (p.project?.commission || 0),
            0
        );
        const prevProfit = prevRevenue - prevProjectCosts - totalFixedCosts;
        const profitChange = prevProfit > 0 ? ((profit - prevProfit) / prevProfit) * 100 : 0;

        // 3. MRR (Monthly Recurring Revenue)
        const activeSubscriptions = await prisma.subscription.findMany({
            where: { status: "active" },
            select: { amount: true, interval: true },
        });
        const mrr = activeSubscriptions.reduce((sum, s) => {
            const monthly = s.interval === "year" ? s.amount / 12 : s.amount;
            return sum + monthly;
        }, 0);

        // 4. RETARDS
        const latePayments = await prisma.payment.findMany({
            where: { status: "LATE" },
            select: { amount: true },
        });
        const lateCount = latePayments.length;
        const lateAmount = latePayments.reduce((sum, p) => sum + p.amount, 0);

        // 5. PROJETS CRÉÉS
        const projectsCreated = await prisma.project.count({
            where: { createdAt: { gte: startDate, lte: endDate } },
        });
        const prevProjectsCreated = await prisma.project.count({
            where: { createdAt: { gte: prevStartDate, lte: prevEndDate } },
        });
        const projectsCreatedChange = projectsCreated - prevProjectsCreated;

        const projectsCreatedAmountData = await prisma.project.aggregate({
            where: { createdAt: { gte: startDate, lte: endDate } },
            _sum: { amount: true },
        });
        const projectsCreatedAmount = projectsCreatedAmountData._sum.amount || 0;

        // 6. PROJETS TERMINÉS
        const projectsCompleted = await prisma.project.count({
            where: { status: "Terminé", updatedAt: { gte: startDate, lte: endDate } },
        });
        const prevProjectsCompleted = await prisma.project.count({
            where: { status: "Terminé", updatedAt: { gte: prevStartDate, lte: prevEndDate } },
        });
        const projectsCompletedChange = projectsCompleted - prevProjectsCompleted;

        // 7. DEVIS ENVOYÉS
        const quotesSent = await prisma.quote.count({
            where: { status: "SENT", createdAt: { gte: startDate, lte: endDate } },
        });
        const quotesAccepted = await prisma.quote.count({
            where: { status: "ACCEPTED", createdAt: { gte: startDate, lte: endDate } },
        });
        const quotesTotal = await prisma.quote.count({
            where: { createdAt: { gte: startDate, lte: endDate } },
        });
        const acceptanceRate = quotesTotal > 0 ? (quotesAccepted / quotesTotal) * 100 : 0;

        // 8. NOUVEAUX CLIENTS
        const newClients = await prisma.user.count({
            where: { role: "CLIENT", createdAt: { gte: startDate, lte: endDate } },
        });
        const prevNewClients = await prisma.user.count({
            where: { role: "CLIENT", createdAt: { gte: prevStartDate, lte: prevEndDate } },
        });
        const newClientsChange = newClients - prevNewClients;

        // 9. TICKETS
        const ticketsCount = await prisma.ticket.count({
            where: { createdAt: { gte: startDate, lte: endDate } },
        });
        const resolvedTickets = await prisma.ticket.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                resolvedAt: { not: null },
            },
            select: { createdAt: true, resolvedAt: true },
        });

        const avgResolutionHours =
            resolvedTickets.length > 0
                ? resolvedTickets.reduce((sum, t) => {
                    const diff = t.resolvedAt!.getTime() - t.createdAt.getTime();
                    return sum + diff / (1000 * 60 * 60); // hours
                }, 0) / resolvedTickets.length
                : 0;

        return NextResponse.json({
            period: { start: startDate.toISOString(), end: endDate.toISOString() },
            kpis: {
                revenue: { value: revenue, change: revenueChange, changeType: "percentage" },
                profit: { value: profit, change: profitChange, changeType: "percentage" },
                mrr: { value: mrr },
                latePayments: { count: lateCount, amount: lateAmount },
                projectsCreated: { value: projectsCreated, change: projectsCreatedChange, changeType: "count", amount: projectsCreatedAmount },
                projectsCompleted: { value: projectsCompleted, change: projectsCompletedChange, changeType: "count" },
                quotesSent: { value: quotesSent, acceptanceRate },
                newClients: { value: newClients, change: newClientsChange, changeType: "count" },
                tickets: { count: ticketsCount, avgResolutionHours: Math.round(avgResolutionHours * 10) / 10 },
            },
        });
    } catch (error: any) {
        console.error("Stats overview error:", error);
        return NextResponse.json({ error: error.message || "Error fetching stats" }, { status: 500 });
    }
}
