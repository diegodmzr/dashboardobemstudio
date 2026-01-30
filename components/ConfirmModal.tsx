"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Info } from "lucide-react";

type Props = {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    variant?: "danger" | "warning" | "info";
};

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    onConfirm,
    onCancel,
    loading = false,
    variant = "danger",
}: Props) {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!isOpen) setIsClosing(false);
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onCancel, 200);
    };

    const handleConfirm = () => {
        onConfirm();
    };

    if (!isOpen && !isClosing) return null;

    const colors = {
        danger: {
            iconBg: "bg-red-100 dark:bg-red-900/20",
            iconColor: "text-red-600 dark:text-red-400",
            buttonBg: "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
        },
        warning: {
            iconBg: "bg-orange-100 dark:bg-orange-900/20",
            iconColor: "text-orange-600 dark:text-orange-400",
            buttonBg: "bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700",
        },
        info: {
            iconBg: "bg-blue-100 dark:bg-blue-900/20",
            iconColor: "text-blue-600 dark:text-blue-400",
            buttonBg: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
        }
    };

    const theme = colors[variant];

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm dark:bg-black/80 ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ${isClosing ? "animate-scaleOut" : "animate-scaleIn"} dark:bg-[#111] dark:ring-1 dark:ring-[#333]`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full ${theme.iconBg}`}>
                    <AlertTriangle className={`h-8 w-8 ${theme.iconColor}`} />
                </div>

                <h3 className="mb-2 text-xl font-bold text-[#2f2f2f] dark:text-white">
                    {title}
                </h3>
                <p className="mb-6 text-sm text-[#6a6a6a] dark:text-gray-400 whitespace-pre-line">
                    {message}
                </p>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1 rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-[#4a4a4a] transition hover:bg-gray-50 disabled:opacity-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#222]"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`flex-1 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${theme.buttonBg}`}
                    >
                        {loading ? "Chargement..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
