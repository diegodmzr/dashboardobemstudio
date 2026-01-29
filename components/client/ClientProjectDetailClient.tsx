"use client";

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
    paymentType?: string | null;
    progressConfig?: string | null;
    attributes?: string | null;
    level?: string | null;
    createdAt: string;
    updatedAt: string;
    client: {
        id: string;
        name: string;
        email: string;
        companyName?: string | null;
    };
};

type Props = {
    project: Project;
};

export default function ClientProjectDetailClient({ project }: Props) {
    // Parse progressConfig to get custom steps
    const getProgressSteps = () => {
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
            { label: "Brief", description: "Cadrage initial du projet" },
            { label: "Design", description: "Création des maquettes UI/UX" },
            { label: "Développement", description: "Intégration et développement" },
            { label: "Tests", description: "Validation et tests qualité" },
            { label: "Livraison", description: "Mise en ligne et livraison" },
        ];
    };

    // Calculate current step based on progress
    const getCurrentStep = (progress: number, totalSteps: number) => {
        const stepPercentage = 100 / totalSteps;
        return Math.min(Math.floor(progress / stepPercentage), totalSteps - 1);
    };

    const steps = getProgressSteps();
    const currentStepIndex = getCurrentStep(project.progress, steps.length);

    // Parse attributes if available
    const attributes = project.attributes
        ? (() => {
            try {
                return JSON.parse(project.attributes);
            } catch {
                return [];
            }
        })()
        : [];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
        }).format(amount);
    };

    return (
        <>
            <Topbar
                title={project.name}
                rightContent={
                    <Link
                        href="/dashboard/projets"
                        className="flex items-center gap-2 rounded-full border border-[#ece7ef] bg-white px-4 py-2 text-sm font-medium text-[#4a4a4a] transition hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:hover:bg-[#222]"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Retour aux projets
                    </Link>
                }
            />

            <main className="flex-1 overflow-y-auto bg-[#f8f6fb] dark:bg-black">
                <div className="mx-auto max-w-5xl px-8 py-8">
                    {/* Header Card */}
                    <div className="mb-6 rounded-2xl border border-[#ece7ef] bg-white p-6 shadow-sm dark:bg-[#1a1a1a] dark:border-[#333]">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h1 className="mb-2 text-2xl font-bold text-[#2f2f2f] dark:text-white">
                                    {project.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f6] px-3 py-1 text-sm font-semibold text-[#6a6a6a] dark:bg-[#333] dark:text-gray-400">
                                        <span className="h-2 w-2 rounded-full bg-[#6a6a6a] dark:bg-gray-400" />
                                        {project.status}
                                    </span>
                                    {project.type && (
                                        <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-sm font-semibold text-[#6a6a6a] dark:bg-[#333] dark:text-gray-400">
                                            {project.type}
                                        </span>
                                    )}
                                    {project.technology && (
                                        <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-sm font-semibold text-[#6a6a6a] dark:bg-[#333] dark:text-gray-400">
                                            {project.technology}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-semibold text-[#6a6a6a] dark:text-gray-400">
                                    Progression globale
                                </span>
                                <span className="text-lg font-bold text-[#2f2f2f] dark:text-white">
                                    {project.progress}%
                                </span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-[#ece7ef] dark:bg-[#333]">
                                <div
                                    className="h-full rounded-full bg-black dark:bg-white transition-all duration-500"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Project Info Grid */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl bg-[#f8f6fb] p-4 dark:bg-[#111]">
                                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">
                                    Montant
                                </div>
                                <div className="text-xl font-bold text-[#2f2f2f] dark:text-white">
                                    {formatCurrency(project.amount)}
                                </div>
                                {project.paymentType && (
                                    <div className="mt-1 text-xs text-[#6a6a6a] dark:text-gray-400">
                                        {project.paymentType}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl bg-[#f8f6fb] p-4 dark:bg-[#111]">
                                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">
                                    Date de création
                                </div>
                                <div className="text-sm font-semibold text-[#2f2f2f] dark:text-white">
                                    {formatDate(project.createdAt)}
                                </div>
                            </div>

                            {project.deadline && (
                                <div className="rounded-xl bg-[#f8f6fb] p-4 dark:bg-[#111]">
                                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">
                                        Échéance
                                    </div>
                                    <div className="text-sm font-semibold text-[#2f2f2f] dark:text-white">
                                        {formatDate(project.deadline)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline Steps */}
                    <div className="mb-6 rounded-2xl border border-[#ece7ef] bg-white p-6 shadow-sm dark:bg-[#1a1a1a] dark:border-[#333]">
                        <h2 className="mb-4 text-lg font-bold text-[#2f2f2f] dark:text-white">
                            Étapes du projet
                        </h2>
                        <div className="space-y-4">
                            {steps.map((step: { label: string; description: string }, index: number) => {
                                const isDone = index < currentStepIndex;
                                const isCurrent = index === currentStepIndex;

                                return (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${isDone
                                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                                    : isCurrent
                                                        ? "bg-[#4a4a4a] text-white ring-4 ring-[#4a4a4a]/20 dark:bg-gray-300 dark:text-black dark:ring-gray-300/20"
                                                        : "bg-white border-2 border-[#c9c4ce] text-[#8b8690] dark:bg-[#1a1a1a] dark:border-[#444]"
                                                    }`}
                                            >
                                                {isDone ? "✓" : index + 1}
                                            </div>
                                            {index < steps.length - 1 && (
                                                <div
                                                    className={`h-full w-0.5 flex-1 ${isDone
                                                        ? "bg-black dark:bg-white"
                                                        : "bg-[#c9c4ce] dark:bg-[#444]"
                                                        }`}
                                                    style={{ minHeight: "40px" }}
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-8">
                                            <div className="mb-1 text-base font-bold text-[#2f2f2f] dark:text-white">
                                                {step.label}
                                            </div>
                                            <div className="text-sm text-[#6a6a6a] dark:text-gray-400">
                                                {step.description}
                                            </div>
                                            {isCurrent && (
                                                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-black/10 px-3 py-1 text-xs font-semibold text-black dark:bg-white/10 dark:text-white">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-75 dark:bg-white"></span>
                                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-black dark:bg-white"></span>
                                                    </span>
                                                    En cours
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Attributes */}
                    {attributes.length > 0 && (
                        <div className="mb-6 rounded-2xl border border-[#ece7ef] bg-white p-6 shadow-sm dark:bg-[#1a1a1a] dark:border-[#333]">
                            <h2 className="mb-4 text-lg font-bold text-[#2f2f2f] dark:text-white">
                                Caractéristiques
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {attributes.map((attr: string, index: number) => (
                                    <span
                                        key={index}
                                        className="rounded-full bg-[#f8f6fb] px-3 py-1.5 text-sm font-medium text-[#4a4a4a] dark:bg-[#111] dark:text-gray-300"
                                    >
                                        {attr}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contact CTA */}
                    <div className="rounded-2xl border-2 border-black bg-black p-6 shadow-lg dark:border-white dark:bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="mb-1 text-lg font-bold text-white dark:text-black">
                                    Une question sur votre projet ?
                                </h3>
                                <p className="text-sm text-white/80 dark:text-black/80">
                                    Contactez-nous pour toute demande ou modification
                                </p>
                            </div>
                            <Link
                                href="/dashboard/client/demandes"
                                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg transition hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-gray-900"
                            >
                                Faire une demande
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
