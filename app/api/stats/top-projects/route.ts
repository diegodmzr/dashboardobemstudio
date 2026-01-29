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

        const projects = await prisma.project.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
            },
            include: {
                client: {
                    select: { id: true, name: true },
                },
            },
            orderBy: {
                amount: "desc",
            },
            take: 5,
        });

        return NextResponse.json({
            projects: projects.map((p) => ({
                id: p.id,
                name: p.name,
                clientName: p.client.name,
                amount: p.amount,
                status: p.status,
                progress: p.progress,
                createdAt: p.createdAt.toISOString(),
            })),
        });
    } catch (error: any) {
        console.error("Top projects error:", error);
        return NextResponse.json({ error: error.message || "Error fetching top projects" }, { status: 500 });
    }
}
