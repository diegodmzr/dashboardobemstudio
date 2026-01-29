"use client";

import { useEffect } from "react";

type Props = {
    direction: "next" | "previous";
    currentStep: string;
    targetStep: string;
    projectName: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
};

export default function StepConfirmModal({
    direction,
    currentStep,
    targetStep,
    projectName,
    onConfirm,
    onCancel,
    loading = false,
}: Props) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                    <svg
                        className="h-8 w-8 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {direction === "next" ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 17l-5-5m0 0l5-5m-5 5h12"
                            />
                        )}
                    </svg>
                </div>

                <h3 className="mb-2 text-xl font-bold text-[#2f2f2f]">
                    {direction === "next" ? "Passer à l'étape suivante ?" : "Revenir à l'étape précédente ?"}
                </h3>
                <p className="mb-6 text-sm text-[#6a6a6a]">
                    Êtes-vous sûr de vouloir passer de{" "}
                    <span className="font-semibold text-[#2f2f2f]">{currentStep}</span> à{" "}
                    <span className="font-semibold text-[#2f2f2f]">{targetStep}</span> pour le projet{" "}
                    <span className="font-semibold text-[#2f2f2f]">{projectName}</span> ?
                </p>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 rounded-full border-2 border-gray-300 px-6 py-3 text-sm font-semibold text-[#4a4a4a] transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Mise à jour..." : "Confirmer"}
                    </button>
                </div>
            </div>
        </div>
    );
}
