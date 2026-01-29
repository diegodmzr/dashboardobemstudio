"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Props = {
    startDate: string;
    endDate: string;
};

export default function ProfitChart({ startDate, endDate }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

                let granularity = "day";
                if (diffDays > 90) granularity = "month";
                else if (diffDays > 30) granularity = "week";

                const params = new URLSearchParams({ startDate, endDate, metric: "profit", granularity });
                const res = await fetch(`/api/stats/timeseries?${params}`);
                if (!res.ok) throw new Error("Failed");
                const json = await res.json();
                setData(json.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [startDate, endDate]);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 dark:bg-[#1a1a1a] dark:border-[#333]">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 dark:text-gray-400">
                    💹 Bénéfice
                </h3>
                <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 dark:bg-[#1a1a1a] dark:border-[#333]">
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Bénéfice
                </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                        tickFormatter={(val) => `${(val / 1000).toFixed(0)}k€`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            fontSize: "12px",
                        }}
                        formatter={(val: any) => [`${val.toFixed(2)} €`, "Bénéfice"]}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.value >= 0 ? "#10b981" : "#ef4444"} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
