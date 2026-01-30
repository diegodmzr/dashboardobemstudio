
import { prisma } from "@/lib/prisma";

export async function calculateGoalValue(goal: any): Promise<number> {
    const { type, startDate, endDate } = goal;
    const now = new Date();
    // Effective end date is min(endDate, now) for progress over time
    const effectiveEnd = now < endDate ? now : endDate;

    // Common date filter
    const dateFilter = {
        gte: startDate,
        lte: effectiveEnd,
    };

    switch (type) {
        case "REVENUE":
            const rev = await prisma.payment.aggregate({
                where: {
                    status: "PAID",
                    paidAt: dateFilter,
                },
                _sum: { amount: true },
            });
            return rev._sum.amount || 0;

        case "PROFIT":
            // Revenue
            const revenueAgg = await prisma.payment.aggregate({
                where: { status: "PAID", paidAt: dateFilter },
                _sum: { amount: true },
            });
            const revenue = revenueAgg._sum.amount || 0;

            // Costs (CPP + Commission)
            const paymentsWithProjects = await prisma.payment.findMany({
                where: { status: "PAID", paidAt: dateFilter, projectId: { not: null } },
                include: { project: { select: { cpp: true, commission: true } } },
            });
            const projectCosts = paymentsWithProjects.reduce((sum, p) => sum + (p.project?.cpp || 0) + (p.project?.commission || 0), 0);

            // Fixed Costs
            const fixedCosts = await prisma.fixedCost.findMany({
                where: {
                    recurring: true,
                    startDate: { lte: effectiveEnd },
                    OR: [{ endDate: null }, { endDate: { gte: startDate } }],
                },
            });

            const months = (effectiveEnd.getFullYear() - startDate.getFullYear()) * 12 + (effectiveEnd.getMonth() - startDate.getMonth()) + 1;
            const totalFixed = fixedCosts.reduce((sum, fc) => sum + fc.amount, 0) * Math.max(1, months);

            return revenue - projectCosts - totalFixed;

        case "MRR":
            const subs = await prisma.subscription.findMany({
                where: { status: "active" },
            });
            return subs.reduce((sum, s) => {
                const amount = s.interval === "year" ? s.amount / 12 : s.amount;
                return sum + amount;
            }, 0);

        case "NEW_CLIENTS":
            return await prisma.user.count({
                where: {
                    role: "CLIENT",
                    createdAt: dateFilter,
                },
            });

        case "PROJECTS_CREATED":
            return await prisma.project.count({
                where: { createdAt: dateFilter },
            });

        case "PROJECTS_COMPLETED":
            return await prisma.project.count({
                where: { status: "Terminé", updatedAt: dateFilter },
            });

        case "QUOTES_SENT":
            return await prisma.quote.count({
                where: { status: "SENT", createdAt: dateFilter },
            });

        case "QUOTES_ACCEPTED":
            return await prisma.quote.count({
                where: { status: "ACCEPTED", createdAt: dateFilter },
            });

        case "CONVERSION_RATE":
            const sent = await prisma.quote.count({
                where: { createdAt: dateFilter },
            });
            const accepted = await prisma.quote.count({
                where: { status: "ACCEPTED", createdAt: dateFilter },
            });
            return sent > 0 ? (accepted / sent) * 100 : 0;

        case "AVERAGE_DEAL_SIZE":
            const projectsAgg = await prisma.project.aggregate({
                where: { createdAt: dateFilter },
                _avg: { amount: true },
            });
            return projectsAgg._avg.amount || 0;

        default:
            return 0;
    }
}
