"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const formatValue = (value: number, isFinancial: boolean) => {
    if (isFinancial) return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
    return value.toString();
};

const CustomTooltip = ({ active, payload, label, isFinancial }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100 text-sm dark:bg-[#111] dark:border-[#333]">
                <p className="font-medium text-gray-900 mb-1 dark:text-gray-300">
                    {label ? format(new Date(label), "d MMMM yyyy", { locale: fr }) : ""}
                </p>
                <p className="font-bold text-lg dark:text-white" style={{ color: payload[0].stroke }}>
                    {formatValue(payload[0].value, isFinancial)}
                </p>
                <p className="text-xs text-gray-500 mt-1 dark:text-gray-500">
                    {payload[0].payload.isManual ? "✏️ Ajustement Manuel" : "🔄 Calcul Auto"}
                </p>
            </div>
        );
    }
    return null;
};

type Props = {
    data: any[];
    targetValue: number;
    startDate: string;
    endDate: string;
    goalType: string;
};

// Map goal types to hex colors (approximate Tailwind colors)
const getColor = (type: string) => {
    switch (type) {
        case "REVENUE": return "#16a34a"; // green-600
        case "PROFIT": return "#2563eb"; // blue-600
        case "MRR": return "#9333ea"; // purple-600
        case "NEW_CLIENTS": return "#ea580c"; // orange-600
        case "PROJECTS_CREATED": return "#4f46e5"; // indigo-600
        case "QUOTES_SENT": return "#9ca3af"; // gray-400 (visible on dark/light)
        default: return "#6366f1"; // indigo-500
    }
};

export default function GoalProgressChart({ data, targetValue, startDate, endDate, goalType }: Props) {
    const isFinancial = ["REVENUE", "PROFIT", "MRR", "AVERAGE_DEAL_SIZE"].includes(goalType);
    const color = getColor(goalType);

    // Format formatter
    // Format formatter
    // const formatValue = (value: number) => {
    //     if (isFinancial) return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
    //     return value.toString();
    // };

    // Prepare data
    const chartData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(d => ({
        ...d,
        dateStr: d.date,
    }));

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`colorValue-${goalType}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" strokeOpacity={0.2} />
                    <XAxis
                        dataKey="dateStr"
                        tickFormatter={(str) => format(new Date(str), "d MMM", { locale: fr })}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={30}
                    />
                    <YAxis
                        tickFormatter={(val) => isFinancial ? `${val / 1000}k` : val}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip isFinancial={isFinancial} />} />
                    <ReferenceLine
                        y={targetValue}
                        stroke={color}
                        strokeDasharray="3 3"
                        strokeOpacity={0.5}
                        label={{ position: 'right', value: 'Cible', fill: color, fontSize: 10, fillOpacity: 0.8 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#colorValue-${goalType})`}
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
