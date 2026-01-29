"use client";

import { useState, useCallback } from "react";
import { ToastMessage, ToastType } from "@/components/Toast";

export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback(
        (message: string, type: ToastType = "info", duration?: number) => {
            const id = Math.random().toString(36).substring(7);
            setToasts((prev) => [...prev, { id, message, type, duration }]);
        },
        []
    );

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return {
        toasts,
        showToast,
        removeToast,
        success: (msg: string) => showToast(msg, "success"),
        error: (msg: string) => showToast(msg, "error"),
        warning: (msg: string) => showToast(msg, "warning"),
        info: (msg: string) => showToast(msg, "info"),
    };
}
