"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export type ToastMessage = {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
};

type Props = {
    toasts: ToastMessage[];
    onRemove: (id: string) => void;
};

export default function Toast({ toasts, onRemove }: Props) {
    return (
        <div className="fixed right-6 top-6 z-[100] flex flex-col gap-3">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

function ToastItem({
    toast,
    onRemove,
}: {
    toast: ToastMessage;
    onRemove: (id: string) => void;
}) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const duration = toast.duration || 4000;
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onRemove(toast.id), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    const colors = {
        success: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
        error: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
        warning: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
        info: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white",
    };

    const icons = {
        success: "✓",
        error: "✕",
        warning: "⚠",
        info: "ℹ",
    };

    return (
        <div
            className={`
        flex min-w-[320px] items-center gap-3 rounded-2xl px-5 py-4 shadow-2xl backdrop-blur-sm
        ${colors[toast.type]}
        ${isExiting ? "animate-slideOut" : "animate-slideIn"}
      `}
        >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
                {icons[toast.type]}
            </div>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => onRemove(toast.id), 300);
                }}
                className="h-6 w-6 rounded-full bg-white/20 text-xs font-bold transition hover:bg-white/30"
                aria-label="Fermer"
            >
                ✕
            </button>
        </div>
    );
}
