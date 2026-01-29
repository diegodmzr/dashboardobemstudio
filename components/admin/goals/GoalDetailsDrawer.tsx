"use client";

import { useState, useEffect } from "react";
import { X, TrendingUp, Calendar, AlertTriangle, CheckCircle, Pencil, Archive, Trash2, History } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import GoalProgressChart from "./GoalProgressChart";
import ManualProgressModal from "./ManualProgressModal";
import { useToast } from "@/hooks/useToast";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    goalId: string | null;
    onEdit: (goal: any) => void;
    onDelete: (id: string, permanent: boolean) => void;
    onRefreshParent: () => void;
};

export default function GoalDetailsDrawer({ isOpen, onClose, goalId, onEdit, onDelete, onRefreshParent }: Props) {
    const [goal, setGoal] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const { success, error } = useToast();

    useEffect(() => {
        if (isOpen && goalId) {
            setIsClosing(false);
            fetchGoalDetails(goalId);
        } else {
            setGoal(null);
            setStats(null);
        }
    }, [isOpen, goalId]);

    const fetchGoalDetails = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/goals/${id}`);
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setGoal(data.goal);
            setStats(data.stats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const handleManualUpdate = async (value: number, note: string) => {
        if (!goal) return;
        try {
            const res = await fetch(`/api/goals/${goal.id}/progress`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value, note, date: new Date().toISOString() }),
            });
            if (!res.ok) throw new Error("Update failed");

            success("Progression mise à jour");
            fetchGoalDetails(goal.id);
            onRefreshParent();
        } catch (err) {
            error("Erreur lors de la mise à jour");
        }
    };

    if (!isOpen) return null;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);

    const formatValue = (val: number) => {
        const isFinancial = ["REVENUE", "PROFIT", "MRR", "AVERAGE_DEAL_SIZE"].includes(goal?.type);
        if (isFinancial) return formatCurrency(val);
        if (goal?.type === "CONVERSION_RATE") return val.toFixed(1) + "%";
        return val.toString();
    };

    return (
        <>
            <div
                className={`fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100 animate-fadeIn"}`}
                onClick={handleClose}
            >
                <div
                    className={`w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto ${isClosing ? "animate-slideOutRight" : "animate-slideInRight"} dark:bg-[#111]`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 dark:bg-[#111]/80 dark:border-[#333]">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{goal?.title || "Détails"}</h2>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1 dark:text-gray-400">{goal?.type.replace(/_/g, " ")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => onEdit(goal)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition tooltip dark:hover:bg-[#222]" title="Modifier">
                                <Pencil className="w-5 h-5" />
                            </button>
                            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition dark:hover:bg-[#222]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
                        </div>
                    ) : goal && stats ? (
                        <div className="p-8 space-y-10">

                            {/* Hero Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 dark:bg-[#1a1a1a] dark:border-[#333]">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 dark:text-gray-500">Progression</h3>
                                    <div className="text-2xl font-light text-black flex items-end gap-2 dark:text-white">
                                        {stats.progressPercent.toFixed(1)}%
                                        {stats.progressPercent >= 100 && <CheckCircle className="w-5 h-5 text-green-500 mb-1" />}
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-200 rounded-full mt-3 overflow-hidden dark:bg-[#333]">
                                        <div className="h-full bg-black rounded-full dark:bg-white" style={{ width: `${Math.min(100, stats.progressPercent)}%` }}></div>
                                    </div>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 dark:bg-[#1a1a1a] dark:border-[#333]">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 dark:text-gray-500">Cible</h3>
                                    <div className="text-2xl font-light text-black dark:text-white">{formatValue(goal.targetValue)}</div>
                                    <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">Actuel: {formatValue(goal.currentValue)}</div>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 dark:bg-[#1a1a1a] dark:border-[#333]">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 dark:text-gray-500">Temps</h3>
                                    <div className="text-2xl font-light text-black dark:text-white">{stats.daysRemaining}j</div>
                                    <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                                        Fin: {format(new Date(goal.endDate), "d MMM yyyy", { locale: fr })}
                                    </div>
                                </div>
                            </div>

                            {/* Chart Section */}
                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 dark:text-white">
                                        <TrendingUp className="w-4 h-4" />
                                        Évolution
                                    </h3>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Rythme actuel: <span className="font-medium text-black dark:text-white">{formatValue(stats.currentPace)}/j</span>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-100 p-4 h-[350px] dark:bg-[#1a1a1a] dark:border-[#333]">
                                    <GoalProgressChart
                                        data={goal.progress || []}
                                        targetValue={goal.targetValue}
                                        startDate={goal.startDate}
                                        endDate={goal.endDate}
                                        goalType={goal.type}
                                    />
                                </div>
                            </div>

                            {/* Prediction / Insight */}
                            {!stats.isOnTrack && goal.status === "ACTIVE" && (
                                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3 text-orange-800 text-sm dark:bg-orange-900/10 dark:border-orange-900/20 dark:text-orange-300">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    <div>
                                        <span className="font-bold">Attention :</span> Au rythme actuel, vous risquez de manquer l'objectif de {formatValue(goal.targetValue - (goal.currentValue + (stats.currentPace * stats.daysRemaining)))}.
                                        Il faudrait atteindre {formatValue(stats.requiredPace)}/j pour réussir.
                                    </div>
                                </div>
                            )}

                            {/* Actions & History */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 dark:text-white">
                                        <History className="w-4 h-4" />
                                        Historique
                                    </h3>
                                    <button
                                        onClick={() => setIsManualModalOpen(true)}
                                        className="text-xs font-bold text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition dark:text-white dark:border-[#333] dark:hover:bg-[#222]"
                                    >
                                        + Ajuster
                                    </button>
                                </div>

                                <div className="border border-gray-100 rounded-2xl overflow-hidden dark:border-[#333]">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 font-medium dark:bg-[#1a1a1a] dark:text-gray-400">
                                            <tr>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Valeur</th>
                                                <th className="px-4 py-3">Source</th>
                                                <th className="px-4 py-3">Note</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-[#333]">
                                            {/* Show latest 10 */}
                                            {goal.progress?.slice().reverse().slice(0, 10).map((p: any) => (
                                                <tr key={p.id} className="bg-white hover:bg-gray-50/50 dark:bg-[#111] dark:hover:bg-[#1a1a1a]">
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                        {format(new Date(p.date), "d MMM HH:mm", { locale: fr })}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-black dark:text-white">
                                                        {formatValue(p.value)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {p.isManual ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-[#333] dark:text-gray-200">
                                                                Manuel
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                                Auto
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-400 italic text-xs truncate max-w-[150px] dark:text-gray-500">
                                                        {p.note || "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!goal.progress || goal.progress.length === 0) && (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-4 text-center text-gray-400 text-xs dark:text-gray-500">Aucun historique</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="pt-8 border-t border-gray-100 dark:border-[#333]">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 dark:text-gray-500">Zone de danger</h3>
                                <div className="flex gap-4">
                                    {goal.status !== "ARCHIVED" && (
                                        <button
                                            onClick={() => onDelete(goal.id, false)}
                                            className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-100 transition flex items-center gap-2 dark:bg-[#1a1a1a] dark:text-gray-400 dark:border-[#333] dark:hover:bg-[#222]"
                                        >
                                            <Archive className="w-4 h-4" />
                                            Archiver l'objectif
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onDelete(goal.id, true)}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 hover:bg-red-100 transition flex items-center gap-2 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Supprimer définitivement
                                    </button>
                                </div>
                            </div>

                        </div>
                    ) : null}
                </div>
            </div>

            <ManualProgressModal
                isOpen={isManualModalOpen}
                onClose={() => setIsManualModalOpen(false)}
                currentValue={goal?.currentValue || 0}
                onSubmit={handleManualUpdate}
            />
        </>
    );
}
