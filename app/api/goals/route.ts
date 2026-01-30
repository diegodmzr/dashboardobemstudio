import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateGoalValue } from "@/lib/goals";

// GET /api/goals
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status") || "ACTIVE";
        const scope = searchParams.get("scope"); // GLOBAL or PERSONAL
        const year = searchParams.get("year");

        const where: any = {};

        if (status !== "ALL") {
            where.status = status;
        }

        if (scope) {
            where.scope = scope;
        }

        // Filter by year if provided (active during that year)
        if (year) {
            const startOfYear = new Date(`${year}-01-01`);
            const endOfYear = new Date(`${year}-12-31`);
            where.startDate = { lte: endOfYear };
            where.endDate = { gte: startOfYear };
        }

        const goals = await prisma.goal.findMany({
            where,
            orderBy: { endDate: "asc" },
            include: {
                progress: {
                    orderBy: { date: "desc" },
                    take: 1, // Get latest progress
                },
            },
        });

        // Compute additional fields & refresh progress if needed
        const enrichedGoals = await Promise.all(goals.map(async (goal) => {
            let currentValue = goal.currentValue;

            // If autoTracking is enabled, we could re-check the value to ensure it's up to date.
            // This ensures user sees real-time data without manual refresh.
            if (goal.autoTracking && goal.status === 'ACTIVE') {
                try {
                    const newValue = await calculateGoalValue(goal);
                    if (newValue !== currentValue) {
                        currentValue = newValue;
                        // Async update DB to keep it in sync, but don't await to block response too much?
                        // Actually better to await to ensure consistency or just fire and forget.
                        // Let's await to be safe.
                        await prisma.goal.update({ where: { id: goal.id }, data: { currentValue: newValue } });

                        // We might not create a "GoalProgress" entry on every view to avoid spamming the history table with identical or frequent updates.
                        // But if the value changed significantly, maybe we should?
                        // For now, just updating the definition is enough for the "Card" view.
                    }
                } catch (e) {
                    console.error("Error auto-calculating goal in GET:", e);
                }
            }

            const daysRemaining = Math.max(0, Math.ceil((new Date(goal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            const progressPercent = goal.targetValue > 0 ? (currentValue / goal.targetValue) * 100 : 0;

            return {
                ...goal,
                currentValue, // Use the potentially updated value
                daysRemaining,
                progressPercent,
            };
        }));

        return NextResponse.json({ goals: enrichedGoals });
    } catch (error: any) {
        console.error("Error fetching goals:", error);
        return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
    }
}

// POST /api/goals
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Basic validation
        if (!body.title || !body.type || !body.targetValue || !body.startDate || !body.endDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Initialize notification config
        const notificationConfig = JSON.stringify({
            email: body.notifications?.email || false,
            app: body.notifications?.app || true,
            widget: body.notifications?.widget || true,
        });

        const goal = await prisma.goal.create({
            data: {
                title: body.title,
                description: body.description,
                type: body.type,
                targetValue: parseFloat(body.targetValue),
                currentValue: body.currentValue || 0,
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
                recurrence: body.recurrence || "NONE",
                rollover: body.rollover || false,
                scope: body.scope || "GLOBAL",
                userId: body.userId || null,
                notificationConfig,
                autoTracking: body.autoTracking !== undefined ? body.autoTracking : true,
                status: "ACTIVE",
            },
        });

        // Create initial progress point
        await prisma.goalProgress.create({
            data: {
                goalId: goal.id,
                value: goal.currentValue,
                date: new Date(),
                isManual: false,
                note: "Initialisation",
            },
        });

        return NextResponse.json(goal, { status: 201 });
    } catch (error: any) {
        console.error("Error creating goal:", error);
        return NextResponse.json({ error: error.message || "Failed to create goal" }, { status: 500 });
    }
}
