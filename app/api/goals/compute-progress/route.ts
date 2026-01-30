import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateGoalValue } from "@/lib/goals";

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const goalId = searchParams.get("goalId"); // Optional: compute for specific goal

        const where: any = {
            autoTracking: true,
            status: "ACTIVE",
        };

        if (goalId) {
            where.id = goalId;
        }

        const goals = await prisma.goal.findMany({ where });
        const results = [];

        for (const goal of goals) {
            try {
                const value = await calculateGoalValue(goal);

                // Update goal
                await prisma.goal.update({
                    where: { id: goal.id },
                    data: {
                        currentValue: value,
                    },
                });

                // Add progress point
                await prisma.goalProgress.create({
                    data: {
                        goalId: goal.id,
                        value: value,
                        date: new Date(),
                        isManual: false, // Auto calculated
                    },
                });

                results.push({ id: goal.id, title: goal.title, newValue: value, status: "Updated" });
            } catch (err: any) {
                console.error(`Error computing goal ${goal.id}:`, err);
                results.push({ id: goal.id, error: err.message, status: "Error" });
            }
        }

        return NextResponse.json({
            processed: goals.length,
            results
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to compute progress" }, { status: 500 });
    }
}
