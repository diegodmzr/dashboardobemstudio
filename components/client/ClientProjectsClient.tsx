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
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setStatusFilter(null)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${!statusFilter
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-white border border-[#e0e0e0] text-[#6a6a6a] hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400"
                            }`}
                    >
                        Tous
                    </button>
                    {uniqueStatuses.map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${statusFilter === status
                                ? "bg-black text-white dark:bg-white dark:text-black"
                                : "bg-white border border-[#e0e0e0] text-[#6a6a6a] hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Projects Grid */}
                {filteredProjects.length === 0 ? (
                    <div className="mt-20 flex flex-col items-center justify-center">
                        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#f8f6fb] to-[#ece7ef] dark:from-[#333] dark:to-[#222]">
                            <svg className="h-16 w-16 text-[#8a8a8a] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <rect x="3.5" y="6" width="17" height="12.5" rx="2" strokeWidth="1.5" />
                                <path d="M3.5 10.5h17" strokeLinecap="round" strokeWidth="1.5" />
                                <path d="M9.5 6V4" strokeLinecap="round" strokeWidth="1.5" />
                                <path d="M14.5 6V4" strokeLinecap="round" strokeWidth="1.5" />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-[#2f2f2f] dark:text-white">
                            Aucun projet trouvé
                        </h3>
                        <p className="mb-6 text-sm text-[#6a6a6a] dark:text-gray-400">
                            {searchTerm || statusFilter
                                ? "Essayez de modifier vos filtres"
                                : "Vous n'avez pas encore de projet"}
                        </p>
                        {!searchTerm && !statusFilter && (
                            <Link
                                href="/dashboard/projets"
                                className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                            >
                                Faire une demande
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

                            return (
                                <Link
                                    key={project.id}
                                    href={`/dashboard/projets/${project.id}`}
                                    className="group relative flex flex-col rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-[0_2px_6px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] dark:bg-[#1a1a1a] dark:border-[#333] dark:hover:bg-[#222]"
                                >
                                    {/* Header */}
                                    <div className="mb-4">
                                        <div className="mb-2 flex items-start justify-between">
                                            {/* Font-semibold to match Admin */}
                                            <h3 className="text-lg font-semibold text-[#2f2f2f] dark:text-white">
                                                {project.name}
                                            </h3>
                                            {project.type && (
                                                /* Badge style matched to Admin */
                                                <span className="rounded-full bg-[#e0e0e0] px-2 py-0.5 text-xs font-semibold text-[#2f2f2f] dark:bg-[#333] dark:text-white">
                                                    {project.type}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Status Badge */}
                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f6] px-2 py-0.5 text-xs font-semibold text-[#6a6a6a] dark:bg-[#333] dark:text-gray-400">
                                                <span className="h-1.5 w-1.5 rounded-full bg-[#6a6a6a] dark:bg-gray-400" />
                                                {project.status}
                                            </span>
                                            {project.technology && (
                                                <span className="text-xs text-[#8a8a8a] dark:text-gray-500">
                                                    • {project.technology}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-xs font-semibold text-[#6a6a6a] dark:text-gray-400">
                                                Progression
                                            </span>
                                            <span className="text-xs font-bold text-[#2f2f2f] dark:text-white">
                                                {project.progress}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#f1eef2] dark:bg-[#333]">
                                            <div
                                                className="h-full rounded-full bg-black dark:bg-white transition-all duration-500"
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Steps */}
                                    <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
                                        {steps.map((step: { label: string; description: string }, index: number) => {
                                            const isDone = index < currentStepIndex;
                                            const isCurrent = index === currentStepIndex;

                                            return (
                                                <div key={index} className="flex items-center gap-1.5">
                                                    <div
                                                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${isDone
                                                            ? "bg-black text-white dark:bg-white dark:text-black"
                                                            : isCurrent
                                                                ? "bg-[#4a4a4a] text-white dark:bg-gray-300 dark:text-black"
                                                                : "bg-white border border-[#e0e0e0] text-[#8b8690] dark:bg-[#1a1a1a] dark:border-[#444]"
                                                            }`}
                                                        title={step.label}
                                                    >
                                                        {isDone ? "✓" : index + 1}
                                                    </div>
                                                    {index < steps.length - 1 && (
                                                        <div
                                                            className={`h-0.5 w-4 ${isDone
                                                                ? "bg-black dark:bg-white"
                                                                : "bg-[#e0e0e0] dark:bg-[#444]"
                                                                }`}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Current Step Info */}
                                    <div className="mt-auto">
                                        <div className="rounded-xl bg-[#f8f6fb] p-3 dark:bg-[#111]">
                                            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">
                                                Étape actuelle
                                            </div>
                                            <div className="text-sm font-semibold text-[#2f2f2f] dark:text-white">
                                                {currentStep.label}
                                            </div>
                                            {currentStep.description && (
                                                <div className="mt-0.5 text-xs text-[#6a6a6a] dark:text-gray-400">
                                                    {currentStep.description}
                                                </div>
                                            )}
                                            {nextStep && (
                                                <div className="mt-2 flex items-center gap-1 text-xs text-[#8a8a8a] dark:text-gray-500">
                                                    <span>Prochaine étape:</span>
                                                    <span className="font-semibold text-black dark:text-white">
                                                        {nextStep.label}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hover Arrow */}
                                    <div className="absolute right-4 top-4 opacity-0 transition group-hover:opacity-100">
                                        <svg
                                            className="h-5 w-5 text-black dark:text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
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
