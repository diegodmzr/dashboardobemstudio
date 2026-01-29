"use client";

import { ProjectRequestFormData } from "./ProjectRequestForm";

type Props = {
    formData: ProjectRequestFormData;
    updateFormData: (data: Partial<ProjectRequestFormData>) => void;
    nextStep: () => void;
    prevStep: () => void;
};

const colorPalette = [
    { id: "noir", name: "Noir", hex: "#000000" },
    { id: "blanc", name: "Blanc", hex: "#FFFFFF", border: true },
    { id: "gris-fonce", name: "Gris foncé", hex: "#4A4A4A" },
    { id: "gris", name: "Gris", hex: "#9CA3AF" },
    { id: "gris-clair", name: "Gris clair", hex: "#E5E7EB" },
    { id: "rouge", name: "Rouge", hex: "#EF4444" },
    { id: "orange", name: "Orange", hex: "#F97316" },
    { id: "jaune", name: "Jaune", hex: "#FBBF24" },
    { id: "vert", name: "Vert", hex: "#10B981" },
    { id: "bleu", name: "Bleu", hex: "#3B82F6" },
    { id: "indigo", name: "Indigo", hex: "#6366F1" },
    { id: "violet", name: "Violet", hex: "#8B5CF6" },
    { id: "rose", name: "Rose", hex: "#EC4899" },
    { id: "marron", name: "Marron", hex: "#92400E" },
    { id: "beige", name: "Beige", hex: "#D4C5B9" },
    { id: "or", name: "Or", hex: "#D4AF37" },
];

export default function ProjectRequestStep2({ formData, updateFormData, nextStep, prevStep }: Props) {
    // Parse selected colors from the colors string
    const selectedColors = formData.colors ? formData.colors.split(",").map((c) => c.trim()) : [];

    const toggleColor = (colorId: string) => {
        if (selectedColors.includes(colorId)) {
            const newColors = selectedColors.filter((c) => c !== colorId);
            updateFormData({ colors: newColors.join(", ") });
        } else {
            const newColors = [...selectedColors, colorId];
            updateFormData({ colors: newColors.join(", ") });
        }
    };

    const isValid = selectedColors.length > 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 text-2xl font-bold text-[#2f2f2f] dark:text-white">
                    Couleurs souhaitées
                </h2>
                <p className="text-sm text-[#6a6a6a] dark:text-gray-400">
                    Sélectionnez les couleurs que vous souhaitez pour votre projet
                </p>
            </div>

            <div>
                <label className="mb-3 block text-sm font-semibold text-[#2f2f2f] dark:text-white">
                    Palette de couleurs <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                    {colorPalette.map((color) => {
                        const isSelected = selectedColors.includes(color.id);
                        return (
                            <button
                                key={color.id}
                                onClick={() => toggleColor(color.id)}
                                className="group relative flex flex-col items-center"
                                title={color.name}
                            >
                                <div
                                    className={`relative h-12 w-12 rounded-full transition hover:scale-110 ${color.border ? "border-2 border-[#c9c4ce]" : ""
                                        } ${isSelected
                                            ? "ring-4 ring-black dark:ring-white ring-offset-2"
                                            : "hover:ring-2 hover:ring-[#c9c4ce]"
                                        }`}
                                    style={{ backgroundColor: color.hex }}
                                >
                                    {isSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg
                                                className={`h-6 w-6 ${color.id === "blanc" || color.id === "gris-clair" || color.id === "jaune" || color.id === "beige"
                                                    ? "text-black"
                                                    : "text-white"
                                                    }`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <span className="mt-1 text-xs text-[#6a6a6a] dark:text-gray-400">
                                    {color.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {selectedColors.length > 0 && (
                    <p className="mt-3 text-xs text-[#8a8a8a] dark:text-gray-500">
                        {selectedColors.length} couleur{selectedColors.length > 1 ? "s" : ""} sélectionnée{selectedColors.length > 1 ? "s" : ""}
                    </p>
                )}
            </div>

            <div className="flex justify-between">
                <button
                    onClick={prevStep}
                    className="flex items-center gap-2 rounded-full border border-[#ece7ef] bg-white px-8 py-3 text-sm font-semibold text-[#6a6a6a] transition hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#222]"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Précédent
                </button>
                <button
                    onClick={nextStep}
                    className="group flex items-center gap-2 rounded-xl bg-black px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 dark:bg-white dark:text-black"
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
