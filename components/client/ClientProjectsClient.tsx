"use client";

import { useState } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";

type Project = {
    id: string;
    name: string;
    status: string;
    progress: number;
    type?: string | null;
    technology?: string | null;
    deadline?: string | null;
    amount: number;
    progressConfig?: string | null;
    createdAt: string;
};

type Props = {
    projects: Project[];
    userName?: string;
    userEmail?: string;
};

export default function ClientProjectsClient({ projects, userName, userEmail }: Props) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    // Parse progressConfig to get custom steps
    const getProgressSteps = (project: Project) => {
        if (project.progressConfig) {
            try {
                const config = JSON.parse(project.progressConfig);
                if (config.steps && Array.isArray(config.steps)) {
                    return config.steps;
                }
            } catch (e) {
                // Fallback to default steps
            }
        }

        // Default steps
        return [
            { label: "Brief", description: "Cadrage initial" },
            { label: "Design", description: "Maquettes UI/UX" },
            { label: "Développement", description: "Intégration" },
            { label: "Tests", description: "Validation" },
            { label: "Livraison", description: "Mise en ligne" },
        ];
    };

    // Calculate current step based on progress
    const getCurrentStep = (progress: number, totalSteps: number) => {
        const stepPercentage = 100 / totalSteps;
        return Math.min(Math.floor(progress / stepPercentage), totalSteps - 1);
    };

    // Filter projects
    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Get unique statuses for filter
    const uniqueStatuses = Array.from(new Set(projects.map((p) => p.status)));

    return (
        <>
            <Topbar
                title="Mes Projets"
                userName={userName}
                userEmail={userEmail}
                rightContent={
                    <div className="flex items-center gap-3">
                        {/* Search Input aligned with Admin style */}
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="h-11 w-64 rounded-full border border-[#e0e0e0] px-4 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Link
                            href="/dashboard/projets/nouveau"
                            className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                            + Nouvelle demande
                        </Link>
                    </div>
                }
            />

            <main className="flex-1 px-8 py-6">
                {/* Filters */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setStatusFilter(null)}
                            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${!statusFilter
                                ? "bg-black text-white shadow-lg shadow-black/10 dark:bg-white dark:text-black"
                                : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400"
                                }`}
                        >
                            Tous
                        </button>
                        {uniqueStatuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${statusFilter === status
                                    ? "bg-black text-white shadow-lg shadow-black/10 dark:bg-white dark:text-black"
                                    : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Projects Grid */}
                {filteredProjects.length === 0 ? (
                    <div className="mt-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-[#333]">
                            <svg className="h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                            Aucun projet trouvé
                        </h3>
                        <p className="mb-8 text-sm text-gray-500 max-w-xs">
                            {searchTerm || statusFilter
                                ? "Aucun résultat ne correspond à vos critères de recherche actuels."
                                : "Vous n'avez pas encore de projet en cours avec nous."}
                        </p>
                        {!searchTerm && !statusFilter && (
                            <Link
                                href="/dashboard/projets/nouveau"
                                className="rounded-full bg-black px-8 py-3.5 text-sm font-bold text-white shadow-xl transition hover:scale-105 active:scale-95 dark:bg-white dark:text-black"
                            >
                                Lancer mon premier projet
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProjects.map((project) => {
                            const steps = getProgressSteps(project);
                            const currentStepIndex = getCurrentStep(project.progress, steps.length);
                            const currentStep = steps[currentStepIndex];
                            const nextStep = steps[currentStepIndex + 1];

                            // Dynamic status colors
                            const statusStyles: Record<string, string> = {
                                "En cours": "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                                "Terminé": "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                                "À venir": "bg-gray-50 text-gray-600 dark:bg-[#222] dark:text-gray-400",
                                "En pause": "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
                                "LATE": "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
                            };

                            const currentStatusStyle = statusStyles[project.status] || "bg-gray-50 text-gray-600 dark:bg-[#222] dark:text-gray-400";

                            return (
                                <Link
                                    key={project.id}
                                    href={`/dashboard/projets/${project.id}`}
                                    className="group relative flex flex-col rounded-[24px] border border-gray-100 bg-white p-6 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:bg-[#111] dark:border-[#333] hover:-translate-y-1"
                                >
                                    {/* Header */}
                                    <div className="mb-6">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-black dark:group-hover:text-white transition-colors">
                                                    {project.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentStatusStyle}`}>
                                                        {project.status}
                                                    </span>
                                                    {project.type && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                            {project.type}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="h-10 w-10 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 dark:bg-[#1a1a1a] group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Meta */}
                                        <div className="flex flex-wrap gap-y-2 gap-x-4 items-center mb-6">
                                            {project.technology && (
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{project.technology}</span>
                                                </div>
                                            )}
                                            {project.deadline && (
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                        {new Date(project.deadline).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Area */}
                                    <div className="mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border border-transparent group-hover:border-gray-100 dark:group-hover:border-[#333] transition-all">
                                        <div className="mb-3 flex items-end justify-between">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-0.5">
                                                    Progression
                                                </span>
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {currentStep.label}
                                                </span>
                                            </div>
                                            <span className="text-lg font-black text-black dark:text-white italic">
                                                {project.progress}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-[#333]">
                                            <div
                                                className="h-full rounded-full bg-black dark:bg-white transition-all duration-700 ease-out shadow-[0_0_8px_rgba(0,0,0,0.2)]"
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>

                                        {nextStep && (
                                            <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-800 flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Suivant:</span>
                                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate">
                                                    {nextStep.label}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Info */}
                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {/* Could show team members here if available */}
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold dark:border-black dark:bg-[#222]">
                                                +
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-medium text-gray-400">
                                            Mis à jour il y a 2j
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </>
    );
}
