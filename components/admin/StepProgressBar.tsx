"use client";

export type ProgressStep = {
    key: string;
    label: string;
    description?: string;
};

export type ProgressConfig = {
    steps: ProgressStep[];
    currentStepIndex: number;
};

type Props = {
    // Legacy support
    currentStatus?: string;
    // New: custom progress configuration
    progressConfig?: ProgressConfig;
    currentStepIndex?: number;
    size?: "small" | "large";
    showTooltips?: boolean;
};

const DEFAULT_STEPS: ProgressStep[] = [
    { key: "Brief", label: "Brief", description: "Réception et analyse du brief client" },
    { key: "Design", label: "Design", description: "Création des maquettes et validation visuelle" },
    { key: "Dev", label: "Dev", description: "Développement technique du projet" },
    { key: "Tests", label: "Tests", description: "Tests qualité et corrections" },
    { key: "Livré", label: "Livré", description: "Mise en production et livraison finale" },
];

export default function StepProgressBar({
    currentStatus,
    progressConfig,
    currentStepIndex,
    size = "small",
    showTooltips = false,
}: Props) {
    // Determine which steps to use
    const steps = progressConfig?.steps || DEFAULT_STEPS;

    // Determine current index - FIX: default to 0 if status not found
    let activeIndex: number = 0;

    if (progressConfig && currentStepIndex !== undefined) {
        activeIndex = currentStepIndex;
    } else if (currentStatus) {
        const foundIndex = steps.findIndex((s) => s.key === currentStatus);
        // If status doesn't match, default to first step instead of -1
        activeIndex = foundIndex >= 0 ? foundIndex : 0;
    } else if (progressConfig?.currentStepIndex !== undefined) {
        activeIndex = progressConfig.currentStepIndex;
    }

    const isSmall = size === "small";
    const enableTooltips = showTooltips;

    return (
        <div className="flex items-start justify-center">
            {steps.map((step, idx) => {
                const isCompleted = idx <= activeIndex;
                const isActive = idx === activeIndex;
                const isLast = idx === steps.length - 1;

                return (
                    <div key={step.key} className="flex items-start">
                        {/* Step Circle with improved design */}
                        <div className="flex flex-col items-center relative group/step">
                            <div
                                className={`
                                    flex items-center justify-center rounded-full transition-all duration-300 z-10
                                    ${isSmall ? "h-6 w-6" : "h-9 w-9"}
                                    ${isCompleted
                                        ? isActive
                                            ? "bg-black text-white shadow-lg scale-110 ring-4 ring-black/10 dark:bg-white dark:text-black dark:ring-white/10"
                                            : "bg-black text-white dark:bg-white dark:text-black"
                                        : "border-2 border-gray-300 bg-white text-gray-400 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-600"
                                    }
                                `}
                            >
                                {isCompleted ? (
                                    <svg
                                        className={isSmall ? "h-3 w-3" : "h-4 w-4"}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ) : (
                                    <span className={`font-semibold ${isSmall ? "text-xs" : "text-sm"}`}>
                                        {idx + 1}
                                    </span>
                                )}
                            </div>

                            {/* Label (large view only) */}
                            {!isSmall && (
                                <span
                                    className={`
                                        mt-2 text-xs font-semibold
                                        ${isCompleted ? "text-black dark:text-white" : "text-gray-400 dark:text-gray-500"}
                                    `}
                                >
                                    {step.label}
                                </span>
                            )}

                            {/* Tooltip (large view with descriptions) */}
                            {enableTooltips && step.description && (
                                <StepTooltip description={step.description} />
                            )}
                        </div>

                        {/* Connector Line - PERFECTLY CENTERED */}
                        {!isLast && (
                            <div className="flex items-center px-0.5 md:px-1" style={{ height: isSmall ? "24px" : "36px" }}>
                                <div
                                    className={`
                                        transition-all duration-300 rounded-full
                                        ${isSmall ? "h-0.5 w-3 md:w-8" : "h-1 w-8 md:w-16"}
                                        ${isCompleted ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-[#333]"}
                                    `}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// Tooltip component that appears on hover - IMPROVED design
function StepTooltip({ description }: { description: string }) {
    return (
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 opacity-0 group-hover/step:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
            <div className="relative bg-black text-white text-xs px-4 py-2 rounded-xl shadow-2xl dark:bg-white dark:text-black">
                {description}
                {/* Arrow pointing down */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rotate-45 dark:bg-white"></div>
            </div>
        </div>
    );
}
