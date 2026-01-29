"use client";

import { useEffect } from "react";

type Props = {
    projectName: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
};

export default function DeleteConfirmModal({
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
                className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-scaleIn dark:bg-[#111] dark:ring-1 dark:ring-[#333] dark:shadow-none"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#222] dark:to-[#333]">
                    <svg
                        className="h-8 w-8 text-gray-700 dark:text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h3 className="mb-2 text-xl font-bold text-[#2f2f2f] dark:text-white">
                    Supprimer le projet ?
                </h3>
                <p className="mb-6 text-sm text-[#6a6a6a] dark:text-gray-400">
                    Êtes-vous sûr de vouloir supprimer le projet{" "}
                    <span className="font-semibold text-[#2f2f2f] dark:text-white">{projectName}</span> ?
                    Cette action est irréversible.
                </p>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 rounded-full border-2 border-gray-300 px-6 py-3 text-sm font-semibold text-[#4a4a4a] transition hover:bg-gray-50 disabled:opacity-50 dark:border-[#444] dark:text-gray-300 dark:hover:bg-[#222]"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black"
                    >
                        {loading ? "Suppression..." : "Supprimer"}
                    </button>
                </div>
            </div>
        </div>
    );
}
