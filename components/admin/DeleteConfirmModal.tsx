"use client";

import { useEffect, useState } from "react";

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
    const [confirmName, setConfirmName] = useState("");
    const isConfirmed = confirmName.trim() === projectName.trim();

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
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/20">
                    <svg
                        className="h-8 w-8 text-rose-600 dark:text-rose-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                </div>

                <h3 className="mb-2 text-xl font-bold text-[#2f2f2f] dark:text-white">
                    Suppression définitive
                </h3>
                <p className="mb-6 text-sm text-[#6a6a6a] dark:text-gray-400 leading-relaxed">
                    Cette action est irréversible. Pour confirmer la suppression de{" "}
                    <span className="font-bold text-rose-600 dark:text-rose-400">"{projectName}"</span>,
                    veuillez saisir son nom ci-dessous :
                </p>

                <input
                    type="text"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder="Saisissez le nom exact ici..."
                    className="mb-8 w-full rounded-2xl border-2 border-gray-100 bg-[#f8f6fb] px-5 py-3.5 text-sm outline-none focus:border-rose-500/50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-rose-500/30"
                />

                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 rounded-full border-2 border-gray-100 px-6 py-3.5 text-sm font-bold text-[#4a4a4a] transition hover:bg-gray-50 disabled:opacity-50 dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#222]"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading || !isConfirmed}
                        className={`flex-1 rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-lg transition disabled:opacity-30 disabled:cursor-not-allowed ${isConfirmed ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-none" : "bg-gray-400"
                            }`}
                    >
                        {loading ? "Suppression..." : "Confirmer"}
                    </button>
                </div>
            </div>
        </div>
    );
}
