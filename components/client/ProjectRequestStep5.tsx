"use client";

import { ProjectRequestFormData } from "./ProjectRequestForm";

type Props = {
    formData: ProjectRequestFormData;
    prevStep: () => void;
    goToStep: (step: number) => void;
    handleSubmit: () => void;
    isSubmitting: boolean;
};

export default function ProjectRequestStep5({ formData, prevStep, goToStep, handleSubmit, isSubmitting }: Props) {
    const sections = [
        {
            step: 1,
            title: "Informations de base",
            items: [
                { label: "Nom du projet", value: formData.projectName },
                { label: "Description", value: formData.description || "Non renseigné" },
                {
                    label: "Type de site",
                    value: formData.websiteType === "vitrine" ? "Site Vitrine"
                        : formData.websiteType === "ecommerce" ? "E-commerce"
                            : formData.websiteType === "landing" ? "Landing Page"
                                : formData.websiteType
                },
            ],
        },
        {
            step: 2,
            title: "Pages sélectionnées",
            items: [{ label: "Pages", value: formData.pages && formData.pages.length > 0 ? formData.pages.join(", ") : "Aucune page sélectionnée" }],
        },
        {
            step: 3,
            title: "Fonctionnalités",
            items: [{ label: "Features", value: formData.features && formData.features.length > 0 ? formData.features.join(", ") : "Aucune fonctionnalité sélectionnée" }],
        },
        {
            step: 4,
            title: "Couleurs souhaitées",
            items: [{ label: "Couleurs", value: formData.colors || "Non renseigné" }],
        },
        {
            step: 5,
            title: "Design préféré",
            items: [
                { label: "Styles", value: formData.designStyles.length > 0 ? formData.designStyles.join(", ") : "Non renseigné" },
                {
                    label: "Références",
                    value: formData.referenceUrls.filter((url) => url.trim()).length > 0
                        ? formData.referenceUrls.filter((url) => url.trim()).join(", ")
                        : "Aucune",
                },
            ],
        },
        {
            step: 6,
            title: "Typographie",
            items: [
                {
                    label: "Police",
                    value: formData.typography === "Autre" ? formData.typographyOther : formData.typography,
                },
            ],
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 text-2xl font-bold text-[#2f2f2f] dark:text-white">
                    Récapitulatif
                </h2>
                <p className="text-sm text-[#6a6a6a] dark:text-gray-400">
                    Vérifiez vos réponses avant d'envoyer votre demande
                </p>
            </div>

            <div className="space-y-4">
                {sections.map((section) => (
                    <div
                        key={section.step}
                        className="rounded-xl border border-[#ece7ef] bg-[#f8f6fb] p-4 dark:bg-[#111] dark:border-[#333]"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-[#2f2f2f] dark:text-white">
                                {section.title}
                            </h3>
                            <button
                                onClick={() => goToStep(section.step)}
                                className="text-xs text-[#6a6a6a] hover:text-black dark:text-gray-400 dark:hover:text-white"
                            >
                                Modifier
                            </button>
                        </div>
                        <div className="space-y-2">
                            {section.items.map((item, index) => (
                                <div key={index}>
                                    <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">
                                        {item.label}
                                    </div>
                                    <div className="text-sm text-[#2f2f2f] dark:text-white">
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border-2 border-[#ece7ef] bg-white p-4 dark:bg-[#1a1a1a] dark:border-[#333]">
                <p className="text-sm text-[#6a6a6a] dark:text-gray-400">
                    En envoyant cette demande, vous acceptez que notre équipe vous contacte pour discuter de votre projet. Nous reviendrons vers vous sous <strong className="text-[#2f2f2f] dark:text-white">24-48h</strong>.
                </p>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-full border border-[#ece7ef] bg-white px-8 py-3 text-sm font-semibold text-[#6a6a6a] transition hover:bg-gray-50 disabled:opacity-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#222]"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Précédent
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="group flex items-center justify-center gap-2 rounded-xl bg-black px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black"
                >
                    {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
                    {!isSubmitting && (
                        <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    )}
                </button>
            </div>
        </div >
    );
}
