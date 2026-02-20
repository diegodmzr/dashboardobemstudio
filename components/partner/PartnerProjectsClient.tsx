"use client";

import { TrendingUp, Calendar, User, CheckCircle, Clock, Play, Package, Eye, Euro } from "lucide-react";

type Project = {
    id: string;
    name: string;
    status: string;
    progress: number;
    amount: number;
    deadline?: string;
    type?: string;
    technology?: string;
    client?: { name: string; email: string; companyName?: string };
    quotes: { id: string; reference: string; total: number; status: string }[];
    myCommission: {
        commissionRate: number;
        baseAmount: number;
        commissionAmount: number;
        status: string;
    };
};

const STATUS_COLORS: Record<string, string> = {
    "Brief": "bg-gray-100 text-gray-600 dark:bg-[#2a2a2a] dark:text-gray-400",
    "Design": "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    "Dev": "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
    "Tests": "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-600",
    "Livré": "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    "En cours": "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
};

const COMMISSION_STATUS: Record<string, { label: string; color: string; dot: string }> = {
    PENDING: { label: "Non payé", color: "text-amber-600 bg-amber-50 border-amber-200", dot: "bg-amber-400" },
    IN_PROGRESS: { label: "En cours d'envoi", color: "text-blue-600 bg-blue-50 border-blue-200", dot: "bg-blue-400" },
    PAID: { label: "Payé", color: "text-emerald-600 bg-emerald-50 border-emerald-200", dot: "bg-emerald-400" },
};

function fmt(n: number) {
    return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default function PartnerProjectsClient({ projects }: { projects: Project[] }) {
    if (projects.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Projets</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Projets sur lesquels vous avez une commission.</p>
                </div>
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <Package className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-medium text-gray-500">Aucun projet assigné</p>
                    <p className="text-sm text-gray-400 mt-1">Vos projets avec commission apparaîtront ici.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Projets</h1>
                <p className="text-sm text-gray-500 mt-0.5">{projects.length} projet{projects.length > 1 ? "s" : ""} sur lesquels vous avez une commission.</p>
            </div>

            <div className="grid gap-4">
                {projects.map(project => {
                    const commStatus = COMMISSION_STATUS[project.myCommission.status] || COMMISSION_STATUS.PENDING;
                    const statusColor = STATUS_COLORS[project.status] || STATUS_COLORS["En cours"];

                    return (
                        <div key={project.id} className="rounded-2xl border border-gray-200 bg-white dark:bg-[#111] dark:border-[#333] overflow-hidden">
                            {/* Header */}
                            <div className="p-6 flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{project.name}</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColor}`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    {project.client && (
                                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5" />
                                            {project.client.companyName || project.client.name}
                                        </p>
                                    )}
                                </div>

                                {/* Commission badge */}
                                <div className="flex-shrink-0 text-right">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">{fmt(project.myCommission.commissionAmount)}</p>
                                    <p className="text-xs text-gray-400">Ma commission ({project.myCommission.commissionRate}%)</p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="px-6 pb-4">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-gray-500">Avancement</span>
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{project.progress}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-[#222] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-700"
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Footer info */}
                            <div className="px-6 py-4 border-t border-gray-100 dark:border-[#1a1a1a] flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Euro className="h-3.5 w-3.5" />
                                        Base : {fmt(project.amount)}
                                    </span>
                                    {project.deadline && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Date(project.deadline).toLocaleDateString("fr-FR")}
                                        </span>
                                    )}
                                    {project.technology && (
                                        <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#222] px-2 py-0.5 rounded-full font-medium">
                                            {project.technology}
                                        </span>
                                    )}
                                </div>

                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${commStatus.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${commStatus.dot}`} />
                                    Commission : {commStatus.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
