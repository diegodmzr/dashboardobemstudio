"use client";

import { ProjectRequestFormData } from "./ProjectRequestForm";
import { Layout, ShoppingBag, Target } from "lucide-react";

type Props = {
    formData: ProjectRequestFormData;
    updateFormData: (data: Partial<ProjectRequestFormData>) => void;
    nextStep: () => void;
};

export default function ProjectRequestStep1({ formData, updateFormData, nextStep }: Props) {
    const handleNext = () => {
        if (!formData.projectName.trim() || formData.projectName.length < 3) {
            alert("Le nom du projet est requis (minimum 3 caractères)");
            return;
        }
        if (!formData.websiteType) {
            alert("Veuillez sélectionner un type de site");
            return;
        }
        nextStep();
    };

    const websiteTypes = [
        {
            id: "vitrine" as const,
            label: "Site Vitrine",
            description: "Présentation de votre activité",
            icon: <Layout className="h-8 w-8" />,
        },
        {
            id: "ecommerce" as const,
            label: "E-commerce",
            description: "Boutique en ligne complète",
            icon: <ShoppingBag className="h-8 w-8" />,
        },
        {
            id: "landing" as const,
            label: "Landing Page",
            description: "Page de conversion dédiée",
            icon: <Target className="h-8 w-8" />,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 text-2xl font-bold text-[#2f2f2f] dark:text-white">
                    Informations de base
                </h2>
                <p className="text-sm text-[#6a6a6a] dark:text-gray-400">
                    Commençons par les informations essentielles de votre projet
                </p>
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-[#2f2f2f] dark:text-white">
                    Nom du projet <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => updateFormData({ projectName: e.target.value })}
                    placeholder="Ex: Mon site e-commerce"
                    className="w-full rounded-lg border border-[#ece7ef] bg-white px-4 py-3 text-[#2f2f2f] outline-none transition focus:border-black focus:ring-1 focus:ring-black dark:bg-[#111] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-[#2f2f2f] dark:text-white">
                    Description courte (optionnel)
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Décrivez brièvement votre projet..."
                    rows={4}
                    className="w-full rounded-lg border border-[#ece7ef] bg-white px-4 py-3 text-[#2f2f2f] outline-none transition focus:border-black focus:ring-1 focus:ring-black dark:bg-[#111] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white resize-none"
                />
            </div>

            <div>
                <label className="mb-3 block text-sm font-semibold text-[#2f2f2f] dark:text-white">
                    Type de site <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {websiteTypes.map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => updateFormData({ websiteType: type.id })}
                            className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition ${formData.websiteType === type.id
                                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                                : "border-[#ece7ef] bg-white hover:border-gray-300 dark:border-[#333] dark:bg-[#111] dark:hover:border-[#444]"
                                }`}
                        >
                            <div className="text-3xl mb-2">{type.icon}</div>
                            <div className={`text-sm font-bold mb-1 ${formData.websiteType === type.id
                                ? "text-white dark:text-black"
                                : "text-[#2f2f2f] dark:text-white"
                                }`}>
                                {type.label}
                            </div>
                            <div className={`text-xs ${formData.websiteType === type.id
                                ? "text-gray-200 dark:text-gray-700"
                                : "text-[#6a6a6a] dark:text-gray-400"
                                }`}>
                                {type.description}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={!formData.projectName.trim() || formData.projectName.length < 3 || !formData.websiteType}
                    className={`group flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all ${formData.projectName.trim() && formData.projectName.length >= 3 && formData.websiteType
                        ? "bg-black text-white shadow-lg hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 dark:bg-white dark:text-black"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none dark:bg-gray-800 dark:text-gray-600"
                        }`}
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
