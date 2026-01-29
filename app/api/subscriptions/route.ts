import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const where: any = {};
        if (status && status !== "ALL") where.status = status;

        const subscriptions = await prisma.subscription.findMany({
            where,
            include: {
                client: {
                    select: { id: true, name: true, companyName: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Calculate MRR (Monthly Recurring Revenue)
        const mrr = subscriptions
            .filter((s) => s.status === "active")
            .reduce((sum, s) => {
                // Convert to monthly if yearly
                const monthlyAmount = s.interval === "year" ? s.amount / 12 : s.amount;
                return sum + monthlyAmount;
            }, 0);

        const stats = {
            mrr,
            activeCount: subscriptions.filter((s) => s.status === "active").length,
            canceledCount: subscriptions.filter((s) => s.status === "canceled").length,
        };

        return NextResponse.json({ subscriptions, stats });
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des abonnements" },
            { status: 500 }
        );
    }
}
