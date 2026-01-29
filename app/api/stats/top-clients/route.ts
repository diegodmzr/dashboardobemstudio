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
        endDate.setHours(23, 59, 59, 999);

        // Get all payments in period with client info
        const payments = await prisma.payment.findMany({
            where: {
                status: "PAID",
                paidAt: { gte: startDate, lte: endDate },
            },
            include: {
                client: {
                    select: { id: true, name: true, companyName: true },
                },
                project: {
                    select: { id: true },
                },
            },
        });

        // Group by client
        const clientMap = new Map<string, {
            id: string;
            name: string;
            companyName: string | null;
            revenue: number;
            activeProjects: Set<string>;
            lastActivity: Date;
        }>();

        payments.forEach((p) => {
            const clientId = p.client.id;
            if (!clientMap.has(clientId)) {
                clientMap.set(clientId, {
                    id: p.client.id,
                    name: p.client.name,
                    companyName: p.client.companyName,
                    revenue: 0,
                    activeProjects: new Set(),
                    lastActivity: p.paidAt!,
                });
            }

            const client = clientMap.get(clientId)!;
            client.revenue += p.amount;
            if (p.projectId) client.activeProjects.add(p.projectId);
            if (p.paidAt! > client.lastActivity) client.lastActivity = p.paidAt!;
        });

        // Convert to array and sort
        const topClients = Array.from(clientMap.values())
            .map((c) => ({
                ...c,
                activeProjectsCount: c.activeProjects.size,
                activeProjects: undefined, // Remove Set before JSON serialization
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return NextResponse.json({
            clients: topClients.map((c) => ({
                id: c.id,
                name: c.name,
                companyName: c.companyName,
                revenue: c.revenue,
                activeProjects: c.activeProjectsCount,
                lastActivity: c.lastActivity.toISOString(),
            })),
        });
    } catch (error: any) {
        console.error("Top clients error:", error);
        return NextResponse.json({ error: error.message || "Error fetching top clients" }, { status: 500 });
    }
}
