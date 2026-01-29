import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/goals/[id]/progress
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        if (body.value === undefined) {
            return NextResponse.json({ error: "Value required" }, { status: 400 });
        }

        const goal = await prisma.goal.findUnique({
            where: { id },
        });

        if (!goal) {
            return NextResponse.json({ error: "Goal not found" }, { status: 404 });
        }

        // Create manual progress entry
        const progress = await prisma.goalProgress.create({
            data: {
                goalId: goal.id,
                value: parseFloat(body.value),
                date: body.date ? new Date(body.date) : new Date(),
                isManual: true,
                note: body.note || "Ajustement manuel",
            },
        });

        // Update goal current value
        const updatedGoal = await prisma.goal.update({
            where: { id: goal.id },
            data: {
                currentValue: parseFloat(body.value),
                // Check if completed (unless continuous/recurring logic handles it differently)
                status: (parseFloat(body.value) >= goal.targetValue && !goal.recurrence) ? "COMPLETED" : goal.status,
                completedAt: (parseFloat(body.value) >= goal.targetValue && !goal.completedAt) ? new Date() : goal.completedAt,
            },
        });

        return NextResponse.json({ goal: updatedGoal, progress });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
    }
}
