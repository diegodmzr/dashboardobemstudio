"use client";

import { ProjectRequestFormData } from "./ProjectRequestForm";
import { Check } from "lucide-react";

type Props = {
    formData: ProjectRequestFormData;
    updateFormData: (data: Partial<ProjectRequestFormData>) => void;
    nextStep: () => void;
    prevStep: () => void;
};

export default function ProjectRequestStepVision({ formData, updateFormData, nextStep, prevStep }: Props) {
    const highlightsLabel: Record<string, string> = {
        savoir_faire: "Un savoir-faire",
        specialite: "Une spécialité",
        histoire: "Une histoire",
        valeur: "Une valeur importante"
    };

    const toggleHighlight = (id: string) => {
        const current = formData.highlights || [];
        if (current.includes(id)) {
            updateFormData({ highlights: current.filter(h => h !== id) });
        } else {
            updateFormData({ highlights: [...current, id] });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 text-2xl font-bold text-[#2f2f2f] dark:text-white">
                    Vision & Identité
                </h2>
                <p className="text-sm text-[#6a6a6a] dark:text-gray-400">
                    Aidez-nous à comprendre l'essence de votre marque
                </p>
            </div>

            <div>
                <label className="mb-3 block text-sm font-semibold text-[#2f2f2f] dark:text-white">
                    Quels éléments aimeriez-vous particulièrement mettre en avant ? (Plusieurs choix possibles)
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Object.entries(highlightsLabel).map(([id, label]) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => toggleHighlight(id)}
                            className={`flex items-center justify-between rounded-xl border-2 p-4 text-left transition ${formData.highlights?.includes(id)
                                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                                : "border-[#ece7ef] bg-white hover:border-gray-300 dark:border-[#333] dark:bg-[#111] dark:hover:border-[#444]"
                                }`}
                        >
                            <span className="text-sm font-medium">{label}</span>
                            {formData.highlights?.includes(id) && <Check className="h-4 w-4" />}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-[#2f2f2f] dark:text-white">
                    Connaissez-vous des concurrents ou des sources d'inspiration ?
                </label>
                <textarea
                    value={formData.competitors || ""}
                    onChange={(e) => updateFormData({ competitors: e.target.value })}
                    placeholder="Marques, sites web, concurrents directs..."
                    rows={3}
                    className="w-full rounded-lg border border-[#ece7ef] bg-white px-4 py-3 text-[#2f2f2f] outline-none transition focus:border-black focus:ring-1 focus:ring-black dark:bg-[#111] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white resize-none"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-[#2f2f2f] dark:text-white">
                    Quel est votre public cible ?
                </label>
                <input
                    type="text"
                    value={formData.targetAudience || ""}
                    onChange={(e) => updateFormData({ targetAudience: e.target.value })}
                    placeholder="Ex: Jeunes actifs, Professionnels du BTP, Femmes 25-40 ans..."
                    className="w-full rounded-lg border border-[#ece7ef] bg-white px-4 py-3 text-[#2f2f2f] outline-none transition focus:border-black focus:ring-1 focus:ring-black dark:bg-[#111] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white"
                />
            </div>

            <div className="flex justify-between pt-4">
                <button
                    onClick={prevStep}
                    className="rounded-xl px-6 py-3 text-sm font-bold text-[#4a4a4a] transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#222]"
                >
                    Retour
                </button>
                <button
                    onClick={nextStep}
                    className="group flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all bg-black text-white shadow-lg hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 dark:bg-white dark:text-black"
                >
                    Suivant
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
