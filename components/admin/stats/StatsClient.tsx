"use client";

import { useState, useEffect } from "react";
import { subDays, subMonths, startOfMonth, endOfMonth, startOfYear, format } from "date-fns";
import { Download } from "lucide-react";
import Topbar from "@/components/Topbar";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import KPICard from "./KPICard";
import RevenueChart from "./RevenueChart";
import ProfitChart from "./ProfitChart";
import TopClientsTable from "./TopClientsTable";
import TopProjectsTable from "./TopProjectsTable";

type KPIs = {
    revenue: { value: number; change: number };
    profit: { value: number; change: number };
    mrr: { value: number };
    latePayments: { count: number; amount: number };
    projectsCreated: { value: number; change: number; amount?: number };
    projectsCompleted: { value: number; change: number };
    quotesSent: { value: number; acceptanceRate: number };
    newClients: { value: number; change: number };
    tickets: { count: number; avgResolutionHours: number };
};

export default function StatsClient() {
    const today = new Date();
    const [startDate, setStartDate] = useState(format(subDays(today, 30), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));
    const [loading, setLoading] = useState(false);
    const [kpis, setKpis] = useState<KPIs | null>(null);
    const [topClients, setTopClients] = useState<any[]>([]);
    const [topProjects, setTopProjects] = useState<any[]>([]);

    const { toasts, success, error, removeToast } = useToast();

    // Fetch stats
    const fetchStats = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ startDate, endDate });

            // Fetch overview KPIs
            const overviewRes = await fetch(`/api/stats/overview?${params}`);
            if (!overviewRes.ok) throw new Error("Failed to fetch overview");
            const overviewData = await overviewRes.json();
            setKpis(overviewData.kpis);

            // Fetch top clients
            const clientsRes = await fetch(`/api/stats/top-clients?${params}`);
            if (!clientsRes.ok) throw new Error("Failed to fetch top clients");
            const clientsData = await clientsRes.json();
            setTopClients(clientsData.clients);

            // Fetch top projects
            const projectsRes = await fetch(`/api/stats/top-projects?${params}`);
            if (!projectsRes.ok) throw new Error("Failed to fetch top projects");
            const projectsData = await projectsRes.json();
            setTopProjects(projectsData.projects);
        } catch (err: any) {
            error(err.message || "Erreur lors du chargement des stats");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [startDate, endDate]);

    const setQuickPeriod = (period: string) => {
        const now = new Date();
        switch (period) {
            case "today":
                setStartDate(format(now, "yyyy-MM-dd"));
                setEndDate(format(now, "yyyy-MM-dd"));
                break;
            case "7d":
                setStartDate(format(subDays(now, 7), "yyyy-MM-dd"));
                setEndDate(format(now, "yyyy-MM-dd"));
                break;
            case "30d":
                setStartDate(format(subDays(now, 30), "yyyy-MM-dd"));
                setEndDate(format(now, "yyyy-MM-dd"));
                break;
            case "month":
                setStartDate(format(startOfMonth(now), "yyyy-MM-dd"));
                setEndDate(format(endOfMonth(now), "yyyy-MM-dd"));
                break;
            case "3m":
                setStartDate(format(subMonths(now, 3), "yyyy-MM-dd"));
                setEndDate(format(now, "yyyy-MM-dd"));
                break;
            case "year":
                setStartDate(format(startOfYear(now), "yyyy-MM-dd"));
                setEndDate(format(now, "yyyy-MM-dd"));
                break;
        }
    };

    const exportCSV = () => {
        // Simple CSV export
        const csvData = [
            ["Métrique", "Valeur", "Changement (%)"],
            ["CA", kpis?.revenue.value.toFixed(2) || "0", kpis?.revenue.change.toFixed(2) || "0"],
            ["Bénéfice", kpis?.profit.value.toFixed(2) || "0", kpis?.profit.change.toFixed(2) || "0"],
            ["MRR", kpis?.mrr.value.toFixed(2) || "0", "-"],
            ["Retards", kpis?.latePayments.count.toString() || "0", "-"],
            ["Projets créés", kpis?.projectsCreated.value.toString() || "0", kpis?.projectsCreated.change.toString() || "0"],
            ["Projets terminés", kpis?.projectsCompleted.value.toString() || "0", kpis?.projectsCompleted.change.toString() || "0"],
            ["Devis envoyés", kpis?.quotesSent.value.toString() || "0", kpis?.quotesSent.acceptanceRate.toFixed(2) + "% acceptés" || "0"],
            ["Nouveaux clients", kpis?.newClients.value.toString() || "0", kpis?.newClients.change.toString() || "0"],
            ["Tickets", kpis?.tickets.count.toString() || "0", kpis?.tickets.avgResolutionHours.toFixed(1) + "h moy" || "0"],
        ];

        const csv = csvData.map((row) => row.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `statistiques_${startDate}_${endDate}.csv`;
        a.click();
        success("Export CSV téléchargé");
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-[#111]">
            <Toast toasts={toasts} onRemove={removeToast} />
            <Topbar
                title="Statistiques"
                subtitle="Vue d'ensemble de la performance"
                rightContent={
                    <button
                        onClick={exportCSV}
                        className="w-full md:w-auto bg-white text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-50 transition flex items-center justify-center gap-2 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:hover:bg-[#222]"
                        disabled={!kpis}
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                }
            />

            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {/* Filters */}
                <div className="mb-8 bg-white p-4 md:p-6 rounded-2xl border border-gray-100 dark:bg-[#1a1a1a] dark:border-[#333]">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Période</h3>
                        {["today", "7d", "30d", "month", "3m", "year"].map((p) => (
                            <button
                                key={p}
                                onClick={() => setQuickPeriod(p)}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition dark:bg-[#111] dark:text-gray-400 dark:hover:bg-[#222] dark:hover:text-white"
                            >
                                {p === "today" ? "Aujourd'hui" : p === "7d" ? "7 jours" : p === "30d" ? "30 jours" : p === "month" ? "Ce mois" : p === "3m" ? "3 mois" : "Cette année"}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Du</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm dark:bg-[#111] dark:border-[#333] dark:text-white outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Au</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm dark:bg-[#111] dark:border-[#333] dark:text-white outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">Chargement des statistiques...</div>
                )}

                {!loading && kpis && (
                    <>
                        {/* KPI Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <KPICard
                                title="Chiffre d'Affaires"
                                value={formatCurrency(kpis.revenue.value)}
                                change={kpis.revenue.change}
                                icon="euro"
                                color="green"
                            />
                            <KPICard
                                title="Bénéfice Net"
                                value={formatCurrency(kpis.profit.value)}
                                change={kpis.profit.change}
                                icon="trending-up"
                                color="blue"
                            />
                            <KPICard
                                title="MRR"
                                value={formatCurrency(kpis.mrr.value) + "/mois"}
                                icon="repeat"
                                color="purple"
                            />
                            <KPICard
                                title="Retards de Paiement"
                                value={kpis.latePayments.count.toString()}
                                subtitle={formatCurrency(kpis.latePayments.amount)}
                                icon="alert-triangle"
                                color={kpis.latePayments.count > 0 ? "red" : "gray"}
                            />
                            <KPICard
                                title="Projets Créés"
                                value={kpis.projectsCreated.value.toString()}
                                change={kpis.projectsCreated.change}
                                subtitle={kpis.projectsCreated.amount ? formatCurrency(kpis.projectsCreated.amount) : undefined}
                                icon="rocket"
                            />
                            <KPICard
                                title="Projets Terminés"
                                value={kpis.projectsCompleted.value.toString()}
                                change={kpis.projectsCompleted.change}
                                icon="check-circle"
                            />
                            <KPICard
                                title="Devis Envoyés"
                                value={kpis.quotesSent.value.toString()}
                                subtitle={`${kpis.quotesSent.acceptanceRate.toFixed(1)}% acceptés`}
                                icon="file-text"
                            />
                            <KPICard
                                title="Nouveaux Clients"
                                value={kpis.newClients.value.toString()}
                                change={kpis.newClients.change}
                                icon="users"
                            />
                            <KPICard
                                title="Demandes (Tickets)"
                                value={kpis.tickets.count.toString()}
                                subtitle={`${kpis.tickets.avgResolutionHours.toFixed(1)}h en moyenne`}
                                icon="ticket"
                            />
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <RevenueChart startDate={startDate} endDate={endDate} />
                            <ProfitChart startDate={startDate} endDate={endDate} />
                        </div>

                        {/* Tables */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <TopClientsTable clients={topClients} />
                            <TopProjectsTable projects={topProjects} />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
