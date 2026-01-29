"use client";

import { useState } from "react";
import StepProgressBar, { ProgressConfig, ProgressStep } from "./StepProgressBar";

type Props = {
    initialConfig?: ProgressConfig;
    onChange: (config: ProgressConfig) => void;
};

const DEFAULT_CONFIG: ProgressConfig = {
    steps: [
        { key: "brief", label: "Brief", description: "Réception et analyse du brief client" },
        { key: "design", label: "Design", description: "Création des maquettes et validation visuelle" },
        { key: "dev", label: "Dev", description: "Développement technique du projet" },
        { key: "tests", label: "Tests", description: "Tests qualité et corrections" },
        { key: "delivery", label: "Livré", description: "Mise en production et livraison finale" },
    ],
    currentStepIndex: 0,
};

export default function ProgressBarEditor({ initialConfig, onChange }: Props) {
    const [config, setConfig] = useState<ProgressConfig>(initialConfig || DEFAULT_CONFIG);

    const updateConfig = (newConfig: ProgressConfig) => {
        setConfig(newConfig);
        onChange(newConfig);
    };

    const addStep = () => {
        if (config.steps.length >= 10) return; // Max 10 steps

        const newStep: ProgressStep = {
            key: `step_${Date.now()}`,
            label: `Étape ${config.steps.length + 1}`,
            description: "",
        };

        updateConfig({
            ...config,
            steps: [...config.steps, newStep],
        });
    };

    const removeStep = (index: number) => {
        if (config.steps.length <= 2) return; // Min 2 steps

        const newSteps = config.steps.filter((_, idx) => idx !== index);
        updateConfig({
            ...config,
            steps: newSteps,
            currentStepIndex: Math.min(config.currentStepIndex, newSteps.length - 1),
        });
    };

    const moveStep = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= config.steps.length) return;

        const newSteps = [...config.steps];
        [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];

        updateConfig({
            ...config,
            steps: newSteps,
        });
    };

    const updateStep = (index: number, updates: Partial<ProgressStep>) => {
        const newSteps = config.steps.map((step, idx) =>
            idx === index ? { ...step, ...updates } : step
        );

        updateConfig({
            ...config,
            steps: newSteps,
        });
    };

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 dark:bg-black dark:border-[#333]">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#4a4a4a] dark:text-gray-400">
                    Configuration de la barre de progression
                </h3>

                {/* Number of steps indicator */}
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-[#6a6a6a] dark:text-gray-500">
                        Nombre d'étapes: <strong>{config.steps.length}</strong> (min: 2, max: 10)
                    </span>
                </div>

                {/* Step editor */}
                <div className="space-y-4">
                    {config.steps.map((step, idx) => (
                        <div
                            key={step.key}
                            className="rounded-xl border border-[#e0e0e0] bg-[#f5f5f5] p-4 dark:bg-black dark:border-[#333]"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-semibold text-[#2f2f2f] dark:text-white">
                                    Étape {idx + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                    {/* Move up */}
                                    <button
                                        type="button"
                                        onClick={() => moveStep(idx, "up")}
                                        disabled={idx === 0}
                                        className="rounded bg-white px-2 py-1 text-xs text-[#4a4a4a] transition hover:bg-gray-50 disabled:opacity-30 dark:bg-[#111] dark:text-gray-300 dark:hover:bg-[#1a1a1a]"
                                        title="Monter"
                                    >
                                        ↑
                                    </button>
                                    {/* Move down */}
                                    <button
                                        type="button"
                                        onClick={() => moveStep(idx, "down")}
                                        disabled={idx === config.steps.length - 1}
                                        className="rounded bg-white px-2 py-1 text-xs text-[#4a4a4a] transition hover:bg-gray-50 disabled:opacity-30 dark:bg-[#111] dark:text-gray-300 dark:hover:bg-[#1a1a1a]"
                                        title="Descendre"
                                    >
                                        ↓
                                    </button>
                                    {/* Remove */}
                                    <button
                                        type="button"
                                        onClick={() => removeStep(idx)}
                                        disabled={config.steps.length <= 2}
                                        className="rounded bg-white px-2 py-1 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-30 dark:bg-[#111] dark:bg-opacity-10 dark:hover:bg-red-900/20"
                                        title="Supprimer"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {/* Label input */}
                            <div className="mb-3">
                                <label className="mb-1 block text-xs font-medium text-[#6a6a6a] dark:text-gray-400">
                                    Label
                                </label>
                                <input
                                    type="text"
                                    value={step.label}
                                    onChange={(e) => updateStep(idx, { label: e.target.value })}
                                    placeholder="Ex: Brief, Design, Dev..."
                                    className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white/20"
                                />
                            </div>

                            {/* Description textarea */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-[#6a6a6a] dark:text-gray-400">
                                    Description (tooltip)
                                </label>
                                <textarea
                                    value={step.description || ""}
                                    onChange={(e) => updateStep(idx, { description: e.target.value })}
                                    placeholder="Description affichée au survol..."
                                    rows={2}
                                    className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white/20"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add step button */}
                <button
                    type="button"
                    onClick={addStep}
                    disabled={config.steps.length >= 10}
                    className="mt-4 w-full rounded-full border-2 border-dashed border-[#e0e0e0] px-4 py-3 text-sm font-semibold text-[#6a6a6a] transition hover:border-[#2f2f2f] hover:text-[#2f2f2f] disabled:opacity-30 disabled:cursor-not-allowed dark:border-[#333] dark:text-gray-400 dark:hover:border-white dark:hover:text-white"
                >
                    + Ajouter une étape
                </button>

                {/* Preview */}
                <div className="mt-6 rounded-xl border border-[#e0e0e0] bg-white p-4 dark:bg-black dark:border-[#333]">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#4a4a4a] dark:text-gray-400">
                        Aperçu
                    </h4>
                    <div className="flex justify-center">
                        <StepProgressBar
                            progressConfig={config}
                            currentStepIndex={config.currentStepIndex}
                            size="large"
                            showTooltips={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
