"use client";

import { useState } from "react";
import ProjectRequestStep1 from "@/components/client/ProjectRequestStep1";
import ProjectRequestStepPages from "@/components/client/ProjectRequestStepPages";
import ProjectRequestStepFeatures from "@/components/client/ProjectRequestStepFeatures";
import ProjectRequestStep2 from "@/components/client/ProjectRequestStep2";
import ProjectRequestStep3 from "@/components/client/ProjectRequestStep3";
import ProjectRequestStep4 from "@/components/client/ProjectRequestStep4";
import ProjectRequestStep5 from "@/components/client/ProjectRequestStep5";
import ProjectRequestSuccess from "@/components/client/ProjectRequestSuccess";
import ProjectRequestStepContact from "@/components/client/ProjectRequestStepContact";

import { Check } from "lucide-react";

export type PublicProjectRequestFormData = {
    // Contact Info (New)
    contactName: string;
    contactEmail: string;
    contactCompany?: string;
    contactPhone?: string;

    // Project Info
    projectName: string;
    description: string;
    websiteType: "vitrine" | "ecommerce" | "landing" | "";
    pages: string[];
    features: string[];
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
        projectName: "",
        description: "",
        websiteType: "",
        pages: [],
        features: [],
        colors: "",
        designStyles: [],
        referenceUrls: [""],
        typography: "",
        typographyOther: "",
    });

    // Step 1: Contact
    // Step 2: Project Basics (Step1)
    // Step 3: Pages (StepPages)
    // Step 4: Features (StepFeatures)
    // Step 5: Design (Step2)
    // Step 6: References (Step3)
    // Step 7: Typography (Step4)
    // Step 8: Recap (Step5)
    const totalSteps = 8;

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

    return (
        <div className="min-h-screen bg-[#f8f6fb] font-sans">
            {/* Public Header */}
            <header className="sticky top-0 z-30 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 overflow-hidden">
                            <img src="/logonoir.png" alt="Logo" className="h-full w-full object-contain" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">Demande de Projet</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        Étape {currentStep}/{totalSteps}
                    </div>
                </div>
            </header>



            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Stepper Visual */}
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
                                                ? "bg-black text-white hover:bg-gray-800"
                                                : isCurrent
                                                    ? "bg-black text-white shadow-lg shadow-black/30 scale-110"
                                                    : "bg-white border-2 border-gray-100 text-gray-300"
                                                }`}
                                        >
                                            {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : step}
                                        </button>
                                        {step < totalSteps && (
                                            <div
                                                className={`h-[2px] w-6 sm:w-10 md:w-14 transition-colors duration-500 ease-in-out ${isCompleted ? "bg-black" : "bg-gray-100"
                                                    }`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Form Container */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-black/5 sm:p-10">
                    {currentStep === 1 && (
                        <ProjectRequestStepContact
                            formData={formData}
                            updateFormData={updateFormData}
                            nextStep={nextStep}
                        />
                    )}
                    {currentStep === 2 && (
                        <ProjectRequestStep1
                            formData={formData}
                            updateFormData={updateFormData}
                            nextStep={nextStep}
                        />
                    )}
                    {currentStep === 3 && (
                        <ProjectRequestStepPages
                            formData={formData}
                            updateFormData={updateFormData}
                            nextStep={nextStep}
                            prevStep={prevStep}
                        />
                    )}
                    {currentStep === 4 && (
                        <ProjectRequestStepFeatures
                            formData={formData}
                            updateFormData={updateFormData}
                            nextStep={nextStep}
                            prevStep={prevStep}
                        />
                    )}
                    {currentStep === 5 && (
                        <ProjectRequestStep2
                            formData={formData}
                            updateFormData={updateFormData}
                            nextStep={nextStep}
                            prevStep={prevStep}
                        />
                    )}
                    {currentStep === 6 && (
                        <ProjectRequestStep3
                            formData={formData}
                            updateFormData={updateFormData}
                            nextStep={nextStep}
                            prevStep={prevStep}
                        />
                    )}
                    {currentStep === 7 && (
                        <ProjectRequestStep4
                            formData={formData}
                            updateFormData={updateFormData}
                            nextStep={nextStep}
                            prevStep={prevStep}
                        />
                    )}
                    {currentStep === 8 && (
                        <ProjectRequestStep5
                            formData={formData}
                            prevStep={prevStep}
                            goToStep={goToStep}
                            handleSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
