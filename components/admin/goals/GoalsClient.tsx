"use client";

import { useState, useEffect } from "react";
import { Plus, RefreshCw, Archive, Trash2, SlidersHorizontal, ArrowUpDown, Target } from "lucide-react";
import Topbar from "@/components/Topbar";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import GoalCard from "./GoalCard";
import GoalModal from "./GoalModal";
import GoalDetailsDrawer from "./GoalDetailsDrawer";

export default function GoalsClient() {
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<any | null>(null);

    const [detailGoalId, setDetailGoalId] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState("ACTIVE"); // ACTIVE, ARCHIVED, ALL
    const [scopeFilter, setScopeFilter] = useState("ALL"); // ALL, GLOBAL, PERSONAL
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

    const { toasts, success, error, removeToast } = useToast();

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "ALL") params.append("status", statusFilter);
            if (scopeFilter !== "ALL") params.append("scope", scopeFilter);
            if (yearFilter) params.append("year", yearFilter);

            const res = await fetch(`/api/goals?${params}`);
            if (!res.ok) throw new Error("Failed to fetch goals");
            const data = await res.json();
            setGoals(data.goals);
        } catch (err: any) {
            error("Erreur lors du chargement des objectifs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, [statusFilter, scopeFilter, yearFilter]);

    const handleCreate = async (data: any) => {
        try {
            const res = await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create goal");

            success("Objectif créé avec succès !");
            setIsModalOpen(false);
            fetchGoals();
        } catch (err: any) {
            error(err.message || "Erreur création");
        }
    };

    const handleUpdate = async (data: any) => {
        if (!selectedGoal) return;
        try {
            const res = await fetch(`/api/goals/${selectedGoal.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update goal");

            success("Objectif mis à jour !");
            setIsModalOpen(false);
            setSelectedGoal(null);
            fetchGoals();
        } catch (err: any) {
            error(err.message || "Erreur modification");
        }
    };

    const handleDelete = async (id: string, permanent: boolean) => {
        if (!confirm(permanent ? "Êtes-vous sûr de vouloir supprimer définitivement cet objectif ?" : "Voulez-vous archiver cet objectif ?")) return;

        try {
            const res = await fetch(`/api/goals/${id}?permanent=${permanent}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete goal");

            success(permanent ? "Objectif supprimé définitivement" : "Objectif archivé");
            fetchGoals();
        } catch (err: any) {
            error("Erreur suppression");
        }
    };

    const handleRefreshProgress = async () => {
        try {
            const res = await fetch("/api/goals/compute-progress", { method: "POST" });
            const data = await res.json();
            success(`${data.processed} objectifs mis à jour !`);
            fetchGoals();
        } catch (err) {
            error("Erreur lors du recalcul");
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-[#111]">
            <Toast toasts={toasts} onRemove={removeToast} />

            <Topbar
                title="Objectifs & Performance"
                rightContent={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefreshProgress}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition tooltip dark:hover:bg-[#222] dark:text-gray-400"
                            title="Recalculer la progression maintenant"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => { setSelectedGoal(null); setIsModalOpen(true); }}
                            className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition shadow-lg shadow-black/10 flex items-center gap-2 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nouvel Objectif</span>
                        </button>
                    </div>
                }
            />

            <main className="flex-1 p-8 overflow-y-auto">

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 dark:bg-[#1a1a1a] dark:border-[#333]">
                        {["ACTIVE", "ARCHIVED", "ALL"].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === status
                                    ? "bg-black text-white shadow-md dark:bg-white dark:text-black"
                                    : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-[#222]"
                                    }`}
                            >
                                {status === "ACTIVE" ? "En cours" : status === "ARCHIVED" ? "Archivés" : "Tous"}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:border-black dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                        >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>

                        <div className="border-l border-gray-300 h-6 mx-2 dark:border-[#333]"></div>

                        <select
                            value={scopeFilter}
                            onChange={(e) => setScopeFilter(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:border-black dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                        >
                            <option value="ALL">Tous les scopes</option>
                            <option value="GLOBAL">Global</option>
                            <option value="PERSONAL">Personnel</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
                    </div>
                ) : (
                    <>
                        {goals.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed dark:bg-[#1a1a1a] dark:border-[#333]">
                                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 dark:bg-[#222]">
                                    <Target className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1 dark:text-white">Aucun objectif trouvé</h3>
                                <p className="text-gray-500 text-sm mb-6 dark:text-gray-400">Commencez par définir vos objectifs pour cette année.</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-black font-semibold hover:underline dark:text-white"
                                >
                                    Créer mon premier objectif
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {goals.map(goal => (
                                    <GoalCard
                                        key={goal.id}
                                        goal={goal}
                                        onClick={() => setDetailGoalId(goal.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Create/Edit Modal */}
            <GoalModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedGoal(null); }}
                goal={selectedGoal}
                onSubmit={selectedGoal ? handleUpdate : handleCreate}
            />

            {/* Details Drawer */}
            <GoalDetailsDrawer
                isOpen={!!detailGoalId}
                onClose={() => setDetailGoalId(null)}
                goalId={detailGoalId}
                onEdit={(goal) => {
                    setSelectedGoal(goal);
                    setDetailGoalId(null);
                    setIsModalOpen(true);
                }}
                onDelete={(id, permanent) => {
                    handleDelete(id, permanent);
                    setDetailGoalId(null);
                }}
                onRefreshParent={fetchGoals}
            />
        </div>
    );
}
