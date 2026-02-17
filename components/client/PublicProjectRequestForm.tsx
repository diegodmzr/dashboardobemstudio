"use client";

import { useState, useMemo } from "react";
import ProjectRequestStep1 from "@/components/client/ProjectRequestStep1";
import ProjectRequestStepPages from "@/components/client/ProjectRequestStepPages";
import ProjectRequestStepFeatures from "@/components/client/ProjectRequestStepFeatures";
import ProjectRequestStep2 from "@/components/client/ProjectRequestStep2";
import ProjectRequestStep3 from "@/components/client/ProjectRequestStep3";
import ProjectRequestStep4 from "@/components/client/ProjectRequestStep4";
import ProjectRequestStep5 from "@/components/client/ProjectRequestStep5";
import ProjectRequestSuccess from "@/components/client/ProjectRequestSuccess";
import ProjectRequestStepContact from "@/components/client/ProjectRequestStepContact";
import ProjectRequestStepVision from "@/components/client/ProjectRequestStepVision";
import ProjectRequestStepEcommerce from "@/components/client/ProjectRequestStepEcommerce";

import { Check } from "lucide-react";

export type PublicProjectRequestFormData = {
    // Contact Info
    contactName: string;
    contactEmail: string;
    contactCompany?: string;
    contactPhone?: string;
    contactSiret?: string;
    contactAddress?: string;

    // Project Info
    projectName: string;
    description: string;
    websiteType: "vitrine" | "ecommerce" | "landing" | "";
    pages: string[];
    features: string[];

    // E-commerce Info
    productType?: string;
    productCount?: string;

    // Vision & Identity
    highlights: string[];
    competitors?: string;
    targetAudience?: string;

    colors: string;
    designStyles: string[];
    referenceUrls: string[];
    typography: string;
    typographyOther: string;
};

type Props = {
    currentUser?: {
        name: string;
        email: string;
        firstName?: string | null;
        lastName?: string | null;
    } | null;
};

export default function PublicProjectRequestForm({ currentUser }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState<PublicProjectRequestFormData>({
        contactName: currentUser
            ? (currentUser.firstName && currentUser.lastName
                ? `${currentUser.firstName} ${currentUser.lastName}`
                : currentUser.name || "")
            : "",
        contactEmail: currentUser?.email || "",
        contactCompany: "",
        contactPhone: "",
        contactSiret: "",
        contactAddress: "",
        projectName: "",
        description: "",
        websiteType: "",
        pages: [],
        features: [],
        productType: "",
        productCount: "",
        highlights: [],
        competitors: "",
        targetAudience: "",
        colors: "",
        designStyles: [],
        referenceUrls: [""],
        typography: "",
        typographyOther: "",
    });

    const steps = useMemo(() => {
        const baseSteps = [
            { id: "contact", title: "Contact" },
            { id: "basics", title: "Projet" },
            { id: "ecommerce", title: "E-commerce", condition: formData.websiteType === "ecommerce" },
            { id: "pages", title: "Pages" },
            { id: "features", title: "Fonctions" },
            { id: "vision", title: "Vision" },
            { id: "design", title: "Design" },
            { id: "references", title: "Références" },
            { id: "typography", title: "Typo" },
            { id: "recap", title: "Récap" },
        ];
        return baseSteps.filter(step => step.condition !== false);
    }, [currentUser, formData.websiteType]);

    const totalSteps = steps.length;

    const updateFormData = (data: Partial<PublicProjectRequestFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo(0, 0);
        }
    };

    const goToStep = (step: number) => {
        if (step >= 1 && step <= currentStep) {
            setCurrentStep(step);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/forms/demande-de-projet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to submit request");
            }

            setIsSuccess(true);
            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Error submitting project request:", error);
            alert("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return <ProjectRequestSuccess />;
    }

    const renderStep = () => {
        const stepId = steps[currentStep - 1].id;
        switch (stepId) {
            case "contact":
                return <ProjectRequestStepContact formData={formData} updateFormData={updateFormData} nextStep={nextStep} />;
            case "basics":
                return <ProjectRequestStep1 formData={formData as any} updateFormData={updateFormData} nextStep={nextStep} />;
            case "ecommerce":
                return <ProjectRequestStepEcommerce formData={formData as any} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
            case "pages":
                return <ProjectRequestStepPages formData={formData as any} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
            case "features":
                return <ProjectRequestStepFeatures formData={formData as any} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
            case "vision":
                return <ProjectRequestStepVision formData={formData as any} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
            case "design":
                return <ProjectRequestStep2 formData={formData as any} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
            case "references":
                return <ProjectRequestStep3 formData={formData as any} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
            case "typography":
                return <ProjectRequestStep4 formData={formData as any} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
            case "recap":
                return <ProjectRequestStep5 formData={formData as any} prevStep={prevStep} goToStep={goToStep} handleSubmit={handleSubmit} isSubmitting={isSubmitting} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f6fb] font-sans dark:bg-black transition-colors duration-300">
            <header className="sticky top-0 z-30 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md dark:bg-black/80 dark:border-[#222]">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 overflow-hidden">
                            <img src="/logonoir.png" alt="Logo" className="h-full w-full object-contain block dark:hidden" />
                            <img src="/logonoir.png" alt="Logo" className="h-full w-full object-contain hidden dark:block invert" />
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Demande de Projet</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Étape {currentStep}/{totalSteps}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <div className="flex items-center justify-center overflow-x-auto p-6 scrollbar-hide">
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
                                const isCompleted = step < currentStep;
                                const isCurrent = step === currentStep;

                                return (
                                    <div key={step} className="flex items-center">
                                        <button
                                            onClick={() => goToStep(step)}
                                            disabled={step > currentStep}
                                            className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${isCompleted
                                                ? "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black"
                                                : isCurrent
                                                    ? "bg-black text-white shadow-lg shadow-black/30 scale-110 dark:bg-white dark:text-black dark:shadow-white/10"
                                                    : "bg-white border-2 border-gray-100 text-gray-300 dark:bg-[#111] dark:border-[#222] dark:text-gray-600"
                                                }`}
                                        >
                                            {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : step}
                                        </button>
                                        {step < totalSteps && (
                                            <div
                                                className={`h-[2px] w-6 sm:w-10 md:w-14 transition-colors duration-500 ease-in-out ${isCompleted ? "bg-black dark:bg-white" : "bg-gray-100 dark:bg-[#222]"
                                                    }`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-black/5 sm:p-10 dark:bg-[#0a0a0a] dark:border-[#222] dark:shadow-none transition-all duration-300">
                    {renderStep()}
                </div>
            </main>
        </div>
    );
}
