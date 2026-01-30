"use client";

import { ProjectRequestFormData } from "./ProjectRequestForm";
import { Check } from "lucide-react";

type Props = {
    formData: ProjectRequestFormData;
    updateFormData: (data: Partial<ProjectRequestFormData>) => void;
    nextStep: () => void;
    prevStep: () => void;
};

export default function ProjectRequestStepEcommerce({ formData, updateFormData, nextStep, prevStep }: Props) {
    const productCounts = [
        "1 à 10 produits",
        "10 à 30 produits",
        "30 à 60 produits",
        "60 à 100 produits",
        "100 ou plus"
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 text-2xl font-bold text-[#2f2f2f] dark:text-white">
                    Détails E-commerce
                </h2>
                <p className="text-sm text-[#6a6a6a] dark:text-gray-400">
                    Parlons un peu plus de votre future boutique en ligne
                </p>
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-[#2f2f2f] dark:text-white">
                    Quel type de produit allez-vous vendre ? <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.productType || ""}
                    onChange={(e) => updateFormData({ productType: e.target.value })}
                    placeholder="Ex: Vêtements, Accessoires high-tech, Formation..."
                    className="w-full rounded-lg border border-[#ece7ef] bg-white px-4 py-3 text-[#2f2f2f] outline-none transition focus:border-black focus:ring-1 focus:ring-black dark:bg-[#111] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white"
                />
            </div>

            <div>
                <label className="mb-3 block text-sm font-semibold text-[#2f2f2f] dark:text-white">
                    Nombre de produits au lancement <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {productCounts.map((count) => (
                        <button
                            key={count}
                            type="button"
                            onClick={() => updateFormData({ productCount: count })}
                            className={`flex items-center justify-between rounded-xl border-2 p-4 text-left transition ${formData.productCount === count
                                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                                : "border-[#ece7ef] bg-white hover:border-gray-300 dark:border-[#333] dark:bg-[#111] dark:hover:border-[#444]"
                                }`}
                        >
                            <span className="text-sm font-medium">{count}</span>
                            {formData.productCount === count && <Check className="h-4 w-4" />}
                        </button>
                    ))}
                </div>
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
                    disabled={!formData.productType || !formData.productCount}
                    className={`group flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all ${formData.productType && formData.productCount
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
