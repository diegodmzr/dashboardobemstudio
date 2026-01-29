import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/goals/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const goal = await prisma.goal.findUnique({
            where: { id },
            include: {
                progress: {
                    orderBy: { date: "asc" }, // For chart
                },
            },
        });

        if (!goal) {
            return NextResponse.json({ error: "Goal not found" }, { status: 404 });
        }

        // Stats calculations
        const daysTotal = (new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24);
        const daysElapsed = Math.max(0, (Date.now() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, daysTotal - daysElapsed);

        const progressPercent = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;

        // Pace calculation (per day)
        const currentPace = daysElapsed > 0 ? goal.currentValue / daysElapsed : 0;
        const requiredPace = daysRemaining > 0 ? (goal.targetValue - goal.currentValue) / daysRemaining : 0;
        const isOnTrack = currentPace >= requiredPace;

        return NextResponse.json({
            goal,
            stats: {
                daysTotal: Math.ceil(daysTotal),
                daysElapsed: Math.ceil(daysElapsed),
                daysRemaining: Math.ceil(daysRemaining),
                progressPercent,
                currentPace,
                requiredPace,
                isOnTrack,
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch goal" }, { status: 500 });
    }
}

// PATCH /api/goals/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Handle notifications object update separately if needed
        let notificationConfig = undefined;
        if (body.notifications) {
            notificationConfig = JSON.stringify(body.notifications);
        }

        const goal = await prisma.goal.update({
            where: { id },
            data: {
                ...body,
                notificationConfig: notificationConfig || undefined,
                // cleanup
                notifications: undefined,
            },
        });

        return NextResponse.json(goal);
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
    }
}

// DELETE /api/goals/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const permanent = searchParams.get("permanent") === "true";

        if (permanent) {
            await prisma.goal.delete({
                where: { id },
            });
            return NextResponse.json({ message: "Goal deleted permanently" });
        } else {
            const goal = await prisma.goal.update({
                where: { id },
                data: { status: "ARCHIVED" },
            });
            return NextResponse.json(goal);
        }
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
    }
}
