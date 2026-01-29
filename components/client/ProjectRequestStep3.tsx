"use client";

import { ProjectRequestFormData } from "./ProjectRequestForm";

type Props = {
    formData: ProjectRequestFormData;
    updateFormData: (data: Partial<ProjectRequestFormData>) => void;
    nextStep: () => void;
    prevStep: () => void;
};

const designStyles = [
    {
        id: "minimaliste",
        name: "Minimaliste",
        description: "Épuré, lignes simples",
        icon: (
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="4" y="4" width="16" height="16" strokeWidth="1.5" />
                <path d="M4 12h16" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        id: "moderne",
        name: "Moderne",
        description: "Formes géométriques, dynamique",
        icon: (
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="8" strokeWidth="1.5" />
                <path d="M12 4v16M4 12h16" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        id: "classique",
        name: "Classique",
        description: "Élégant, intemporel",
        icon: (
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 4h12M8 4v16M16 4v16M6 20h12" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        id: "creatif",
        name: "Créatif",
        description: "Formes abstraites, original",
        icon: (
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        id: "corporate",
        name: "Corporate",
        description: "Professionnel, structuré",
        icon: (
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="3" width="7" height="7" strokeWidth="1.5" />
                <rect x="14" y="3" width="7" height="7" strokeWidth="1.5" />
                <rect x="3" y="14" width="7" height="7" strokeWidth="1.5" />
                <rect x="14" y="14" width="7" height="7" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        id: "autre",
        name: "Autre",
        description: "Style personnalisé",
        icon: (
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
];

export default function ProjectRequestStep3({ formData, updateFormData, nextStep, prevStep }: Props) {
    const toggleStyle = (styleId: string) => {
        const current = formData.designStyles;
        if (current.includes(styleId)) {
            updateFormData({ designStyles: current.filter((s) => s !== styleId) });
        } else {
            if (current.length < 2) {
                updateFormData({ designStyles: [...current, styleId] });
            }
        }
    };

    const handleNext = () => {
        if (formData.designStyles.length === 0) {
            alert("Veuillez sélectionner au moins un style de design");
            return;
        }
        nextStep();
    };

    const addUrlField = () => {
        if (formData.referenceUrls.length < 3) {
            updateFormData({ referenceUrls: [...formData.referenceUrls, ""] });
        }
    };

    const updateUrl = (index: number, value: string) => {
        const newUrls = [...formData.referenceUrls];
        newUrls[index] = value;
        updateFormData({ referenceUrls: newUrls });
    };

    const removeUrl = (index: number) => {
        const newUrls = formData.referenceUrls.filter((_, i) => i !== index);
        updateFormData({ referenceUrls: newUrls.length > 0 ? newUrls : [""] });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 text-2xl font-bold text-[#2f2f2f] dark:text-white">
                    Design préféré
                </h2>
                <p className="text-sm text-[#6a6a6a] dark:text-gray-400">
                    Sélectionnez 1 à 2 styles qui vous plaisent
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {designStyles.map((style) => {
                    const isSelected = formData.designStyles.includes(style.id);
                    return (
                        <button
                            key={style.id}
                            onClick={() => toggleStyle(style.id)}
                            className={`group relative flex flex-col items-center rounded-xl border-2 p-6 transition hover:-translate-y-1 hover:shadow-md ${isSelected
                                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                                : "border-[#ece7ef] bg-white text-[#2f2f2f] hover:border-black dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white dark:hover:border-white"
                                }`}
                        >
                            <div className="mb-3">{style.icon}</div>
                            <div className="text-sm font-bold">{style.name}</div>
                            <div className={`mt-1 text-xs ${isSelected ? "text-white/80 dark:text-black/80" : "text-[#8a8a8a] dark:text-gray-500"}`}>
                                {style.description}
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
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-[#2f2f2f] dark:text-white">
                    URLs de référence (optionnel)
                </label>
                <p className="mb-3 text-xs text-[#8a8a8a] dark:text-gray-500">
                    Ajoutez jusqu'à 3 sites web qui vous inspirent
                </p>
                <div className="space-y-2">
                    {formData.referenceUrls.map((url, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => updateUrl(index, e.target.value)}
                                placeholder="https://exemple.com"
                                className="flex-1 rounded-lg border border-[#ece7ef] bg-white px-4 py-2 text-sm text-[#2f2f2f] outline-none transition focus:border-black focus:ring-1 focus:ring-black dark:bg-[#111] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white"
                            />
                            {formData.referenceUrls.length > 1 && (
                                <button
                                    onClick={() => removeUrl(index)}
                                    className="rounded-lg border border-[#ece7ef] bg-white px-3 text-[#6a6a6a] transition hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#222]"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    {formData.referenceUrls.length < 3 && (
                        <button
                            onClick={addUrlField}
                            className="text-sm text-[#6a6a6a] hover:text-black dark:text-gray-400 dark:hover:text-white"
                        >
                            + Ajouter une URL
                        </button>
                    )}
                </div>
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
