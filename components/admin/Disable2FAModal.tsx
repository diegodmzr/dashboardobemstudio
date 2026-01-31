"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
    userName: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
};

export default function Disable2FAModal({
    userName,
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onCancel}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl dark:bg-[#111] dark:ring-1 dark:ring-[#333]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute right-6 top-6 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-black dark:hover:bg-[#222] dark:hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="p-8 pt-10">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 dark:bg-amber-500/10 ring-1 ring-amber-100 dark:ring-amber-500/20">
                        <ShieldAlert className="h-8 w-8 text-amber-600 dark:text-amber-500" />
                    </div>

                    <h3 className="mb-3 text-2xl font-bold tracking-tight text-[#1f1f1f] dark:text-white">
                        Désactiver la sécurité ?
                    </h3>

                    <p className="mb-8 text-sm leading-relaxed text-[#6a6a6a] dark:text-gray-400">
                        Vous êtes sur le point de désactiver la double authentification pour <span className="font-semibold text-black dark:text-white">"{userName}"</span>.
                        Cela rendra son compte moins sécurisé jusqu'à ce qu'il la réactive manuellement.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-[#4a4a4a] transition hover:bg-gray-50 disabled:opacity-50 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-gray-400 dark:hover:bg-[#222]"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-[1.5] rounded-2xl bg-black px-6 py-4 text-sm font-bold text-white shadow-xl shadow-black/10 transition hover:bg-zinc-800 active:scale-95 disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                        >
                            {loading ? "Désactivation..." : "Confirmer la désactivation"}
                        </button>
                    </div>
                </div>

                {/* Decorative bottom bar */}
                <div className="h-2 w-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-20" />
            </motion.div>
        </div>
    );
}
