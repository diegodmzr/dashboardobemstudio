"use client";

import { ProjectRequestFormData } from "./ProjectRequestForm";

type Props = {
    formData: ProjectRequestFormData;
    updateFormData: (data: Partial<ProjectRequestFormData>) => void;
    nextStep: () => void;
    prevStep: () => void;
};

const typographies = [
    { id: "Inter", name: "Inter", category: "Sans-serif moderne", style: { fontFamily: "Inter, sans-serif" } },
    { id: "Roboto", name: "Roboto", category: "Sans-serif classique", style: { fontFamily: "Roboto, sans-serif" } },
    { id: "Playfair Display", name: "Playfair Display", category: "Serif élégant", style: { fontFamily: "Playfair Display, serif" } },
    { id: "Montserrat", name: "Montserrat", category: "Sans-serif géométrique", style: { fontFamily: "Montserrat, sans-serif" } },
    { id: "Lora", name: "Lora", category: "Serif lisible", style: { fontFamily: "Lora, serif" } },
    { id: "Poppins", name: "Poppins", category: "Sans-serif arrondi", style: { fontFamily: "Poppins, sans-serif" } },
];

export default function ProjectRequestStep4({ formData, updateFormData, nextStep, prevStep }: Props) {
    const handleNext = () => {
        if (!formData.typography) {
            alert("Veuillez choisir une typographie");
            return;
        }
        if (formData.typography === "Autre" && !formData.typographyOther.trim()) {
            alert("Veuillez préciser la typographie souhaitée");
            return;
        }
        nextStep();
    };

    const selectTypography = (typoId: string) => {
        updateFormData({ typography: typoId });
        if (typoId !== "Autre") {
            updateFormData({ typographyOther: "" });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 text-2xl font-bold text-[#2f2f2f] dark:text-white">
                    Typographie
                </h2>
                <p className="text-sm text-[#6a6a6a] dark:text-gray-400">
                    Sélectionnez la police qui correspond le mieux à votre projet
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {typographies.map((typo) => {
                    const isSelected = formData.typography === typo.id;
                    return (
                        <button
                            key={typo.id}
                            onClick={() => selectTypography(typo.id)}
                            className={`group relative flex flex-col items-center rounded-xl border-2 p-6 transition hover:-translate-y-1 hover:shadow-md ${isSelected
                                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                                : "border-[#ece7ef] bg-white text-[#2f2f2f] hover:border-black dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:hover:border-white"
                                }`}
                        >
                            <div className="mb-3 text-3xl" style={typo.style}>
                                Aa
                            </div>
                            <div className="text-sm font-bold">{typo.name}</div>
                            <div className={`mt-1 text-xs ${isSelected ? "text-white/80 dark:text-black/80" : "text-[#8a8a8a] dark:text-gray-500"}`}>
                                {typo.category}
                            </div>
                            {isSelected && (
                                <div className="absolute right-2 top-2">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    );
                })}

                {/* Option "Autre" */}
                <button
                    onClick={() => selectTypography("Autre")}
                    className={`group relative flex flex-col items-center rounded-xl border-2 p-6 transition hover:-translate-y-1 hover:shadow-md ${formData.typography === "Autre"
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-[#ece7ef] bg-white text-[#2f2f2f] hover:border-black dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:hover:border-white"
                        }`}
                >
                    <div className="mb-3">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="text-sm font-bold">Autre</div>
                    <div className={`mt-1 text-xs ${formData.typography === "Autre" ? "text-white/80 dark:text-black/80" : "text-[#8a8a8a] dark:text-gray-500"}`}>
                        Police personnalisée
                    </div>
                    {formData.typography === "Autre" && (
                        <div className="absolute right-2 top-2">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </button>
            </div>

            {formData.typography === "Autre" && (
                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#2f2f2f] dark:text-white">
                        Précisez la typographie souhaitée
                    </label>
                    <input
                        type="text"
                        value={formData.typographyOther}
                        onChange={(e) => updateFormData({ typographyOther: e.target.value })}
                        placeholder="Ex: Helvetica Neue, Open Sans..."
                        className="w-full rounded-lg border border-[#ece7ef] bg-white px-4 py-3 text-[#2f2f2f] outline-none transition focus:border-black focus:ring-1 focus:ring-black dark:bg-[#111] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white"
                    />
                </div>
            )}

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
