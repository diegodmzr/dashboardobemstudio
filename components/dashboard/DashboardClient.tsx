"use client";

import { useEffect, useState } from "react";
import HeaderGreeting from "./HeaderGreeting";
import StatsBlock from "./StatsBlock";
import ActivityBlock from "./ActivityBlock";
import ProjectsBlock from "./ProjectsBlock";
import PaymentsBlock from "./PaymentsBlock";
import QuickActions from "./QuickActions";

export type DashboardData = {
    role: "ADMIN" | "CLIENT";
    userName: string;
    kpis: any;
    activity: any[];
    projects: any[];
    payments: any[];
};

export default function DashboardClient() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/dashboard/overview");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-4 w-48 bg-gray-200 rounded dark:bg-gray-800"></div>
                    <div className="flex gap-4">
                        <div className="h-32 w-64 bg-gray-200 rounded-2xl dark:bg-gray-800"></div>
                        <div className="h-32 w-64 bg-gray-200 rounded-2xl dark:bg-gray-800"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="h-full flex flex-col gap-6 overflow-y-auto pb-10 scrollbar-hide">
            {/* Header */}
            <HeaderGreeting userName={data.userName} role={data.role} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column (Main Content) */}
                <div className="xl:col-span-2 space-y-6">
                    {/* KPIs */}
                    <StatsBlock kpis={data.kpis} role={data.role} />

                    {/* Projects Section */}
                    <ProjectsBlock projects={data.projects} role={data.role} />

                    {/* Quick Actions (Mobile/Tablet usually, but good here too) */}
                    <QuickActions role={data.role} />
                </div>

                {/* Right Column (Side info) */}
                <div className="space-y-6">
                    {/* Activity Feed */}
                    <ActivityBlock activities={data.activity} role={data.role} />

                    {/* Recent Payments */}
                    <PaymentsBlock payments={data.payments} role={data.role} />
                </div>
            </div>
        </div>
    );
}
