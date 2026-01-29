import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format } from "date-fns";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const startDateStr = searchParams.get("startDate");
        const endDateStr = searchParams.get("endDate");
        const metric = searchParams.get("metric") || "revenue"; // revenue | profit
        const granularity = searchParams.get("granularity") || "day"; // day | week | month

        if (!startDateStr || !endDateStr) {
            return NextResponse.json({ error: "startDate and endDate required" }, { status: 400 });
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        endDate.setHours(23, 59, 59, 999);

        // Generate time intervals based on granularity
        let intervals: Date[] = [];
        if (granularity === "day") {
            intervals = eachDayOfInterval({ start: startDate, end: endDate });
        } else if (granularity === "week") {
            intervals = eachWeekOfInterval({ start: startDate, end: endDate });
        } else {
            intervals = eachMonthOfInterval({ start: startDate, end: endDate });
        }

        // Fetch all payments in the period
        const payments = await prisma.payment.findMany({
            where: {
                status: "PAID",
                paidAt: { gte: startDate, lte: endDate },
            },
            include: {
                project: {
                    select: { cpp: true, commission: true },
                },
            },
            orderBy: { paidAt: "asc" },
        });

        // Group payments by interval
        const data = intervals.map((intervalStart) => {
            const intervalEnd =
                granularity === "day"
                    ? endOfDay(intervalStart)
                    : granularity === "week"
                        ? endOfDay(new Date(intervalStart.getTime() + 6 * 24 * 60 * 60 * 1000))
                        : endOfDay(
                            new Date(intervalStart.getFullYear(), intervalStart.getMonth() + 1, 0)
                        );

            const intervalPayments = payments.filter(
                (p) => p.paidAt && p.paidAt >= intervalStart && p.paidAt <= intervalEnd
            );

            const revenue = intervalPayments.reduce((sum, p) => sum + p.amount, 0);

            let value = revenue;

            if (metric === "profit") {
                const costs = intervalPayments.reduce((sum, p) => {
                    const cpp = p.project?.cpp || 0;
                    const commission = p.project?.commission || 0;
                    return sum + cpp + commission;
                }, 0);
                value = revenue - costs;
            }

            return {
                date: format(intervalStart, granularity === "day" ? "yyyy-MM-dd" : granularity === "week" ? "yyyy-MM-dd" : "yyyy-MM"),
                value: Math.round(value * 100) / 100,
            };
        });

        return NextResponse.json({ data });
    } catch (error: any) {
        console.error("Timeseries error:", error);
        return NextResponse.json({ error: error.message || "Error fetching timeseries" }, { status: 500 });
    }
}
