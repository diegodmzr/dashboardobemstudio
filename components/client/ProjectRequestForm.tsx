"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import ProjectRequestStep1 from "@/components/client/ProjectRequestStep1";
import ProjectRequestStepPages from "@/components/client/ProjectRequestStepPages";
import ProjectRequestStepFeatures from "@/components/client/ProjectRequestStepFeatures";
import ProjectRequestStep2 from "@/components/client/ProjectRequestStep2";
import ProjectRequestStep3 from "@/components/client/ProjectRequestStep3";
import ProjectRequestStep4 from "@/components/client/ProjectRequestStep4";
import ProjectRequestStep5 from "@/components/client/ProjectRequestStep5";
import ProjectRequestSuccess from "@/components/client/ProjectRequestSuccess";

export type ProjectRequestFormData = {
    projectName: string;
    description: string;
    websiteType: "vitrine" | "ecommerce" | "landing" | ""; // NEW
    pages: string[]; // NEW
    features: string[]; // NEW
    colors: string;
    designStyles: string[];
    referenceUrls: string[];
    typography: string;
    typographyOther: string;
};

type Props = {
    userName?: string;
    userEmail?: string;
    userId: string;
};

export default function ProjectRequestForm({ userName, userEmail, userId }: Props) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState<ProjectRequestFormData>({
        projectName: "",
        description: "",
        websiteType: "", // NEW
        pages: [], // NEW
        features: [], // NEW
        colors: "",
        designStyles: [],
        referenceUrls: [""],
        typography: "",
        typographyOther: "",
    });

    const totalSteps = 7; // Changed from 5 to 7 (added 2 new steps)

    const updateFormData = (data: Partial<ProjectRequestFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
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
            const response = await fetch("/api/conversations/project-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to submit request");
            }

            setIsSuccess(true);
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

    return (
        <>
            <Topbar
                title="Nouvelle Demande de Projet"
                userName={userName}
                userEmail={userEmail}
                rightContent={
                    <button
                        onClick={() => router.push("/dashboard/projets")}
                        className="rounded-full border border-[#ece7ef] bg-white px-4 py-2 text-sm font-medium text-[#4a4a4a] transition hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:hover:bg-[#222]"
                    >
                        Annuler
                    </button>
                }
            />

            <main className="flex-1 overflow-y-auto bg-[#f8f6fb] dark:bg-black">
                <div className="mx-auto max-w-3xl px-8 py-8">
                    {/* Stepper */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
                                const isCompleted = step < currentStep;
                                const isCurrent = step === currentStep;

                                return (
                                    <div key={step} className="flex flex-1 items-center">
                                        <button
                                            onClick={() => goToStep(step)}
                                            disabled={step > currentStep}
                                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${isCompleted
                                                ? "bg-black text-white dark:bg-white dark:text-black cursor-pointer hover:scale-110"
                                                : isCurrent
                                                    ? "bg-[#4a4a4a] text-white dark:bg-gray-300 dark:text-black ring-4 ring-[#4a4a4a]/20"
                                                    : "bg-white border-2 border-[#c9c4ce] text-[#8b8690] dark:bg-[#1a1a1a] dark:border-[#444] cursor-not-allowed"
                                                }`}
                                        >
                                            {isCompleted ? "✓" : step}
                                        </button>
                                        {step < totalSteps && (
                                            <div
                                                className={`h-0.5 flex-1 mx-2 ${isCompleted
                                                    ? "bg-black dark:bg-white"
                                                    : "bg-[#c9c4ce] dark:bg-[#444]"
                                                    }`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-3 text-center text-sm text-[#6a6a6a] dark:text-gray-400">
                            Étape {currentStep} sur {totalSteps}
                        </div>
                    </div>

                    {/* Form Steps */}
                    <div className="rounded-2xl border border-[#ece7ef] bg-white p-8 shadow-sm dark:bg-[#1a1a1a] dark:border-[#333]">
                        {currentStep === 1 && (
                            <ProjectRequestStep1
                                formData={formData}
                                updateFormData={updateFormData}
                                nextStep={nextStep}
                            />
                        )}
                        {currentStep === 2 && (
                            <ProjectRequestStepPages
                                formData={formData}
                                updateFormData={updateFormData}
                                nextStep={nextStep}
                                prevStep={prevStep}
                            />
                        )}
                        {currentStep === 3 && (
                            <ProjectRequestStepFeatures
                                formData={formData}
                                updateFormData={updateFormData}
                                nextStep={nextStep}
                                prevStep={prevStep}
                            />
                        )}
                        {currentStep === 4 && (
                            <ProjectRequestStep2
                                formData={formData}
                                updateFormData={updateFormData}
                                nextStep={nextStep}
                                prevStep={prevStep}
                            />
                        )}
                        {currentStep === 5 && (
                            <ProjectRequestStep3
                                formData={formData}
                                updateFormData={updateFormData}
                                nextStep={nextStep}
                                prevStep={prevStep}
                            />
                        )}
                        {currentStep === 6 && (
                            <ProjectRequestStep4
                                formData={formData}
                                updateFormData={updateFormData}
                                nextStep={nextStep}
                                prevStep={prevStep}
                            />
                        )}
                        {currentStep === 7 && (
                            <ProjectRequestStep5
                                formData={formData}
                                prevStep={prevStep}
                                goToStep={goToStep}
                                handleSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
