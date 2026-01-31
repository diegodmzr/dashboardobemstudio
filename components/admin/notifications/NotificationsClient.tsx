"use client";

import { useState, useEffect } from "react";
import { Check, Bell, BellOff, Settings2 } from "lucide-react";
import NotificationList from "./NotificationList";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function NotificationsClient() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [filter, setFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/notifications?filter=${filter}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            // Simplified: call an API or just update UI
            // Assuming we want to mark all as read
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            await fetch("/api/notifications/read-all", { method: "POST" });
        } catch (error) {
            console.error(error);
        }
    };

    const filterOptions = [
        { label: "Tout", value: "ALL" },
        { label: "Non lues", value: "UNREAD" },
        { label: "Urgent", value: "URGENT" }
    ];

    return (
        <div className="flex h-full flex-col max-w-4xl mx-auto w-full">
            {/* Header Area */}
            <div className="flex flex-col gap-6 mb-8 mt-2">
                <div className="flex items-end justify-between px-2">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1f1f1f] dark:text-white">
                            Centre d&apos;alertes
                        </h1>
                        <p className="text-sm text-[#8a8a8a] dark:text-gray-400 mt-1">
                            Gérez vos notifications et l&apos;activité de votre compte.
                        </p>
                    </div>
                </div>

                {/* Filters & Actions bar */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 dark:bg-white/5 p-2 rounded-[24px] border border-white/20 backdrop-blur-sm">
                    <div className="flex p-1 bg-gray-100/50 dark:bg-black/20 rounded-2xl w-full sm:w-auto">
                        {filterOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setFilter(opt.value)}
                                className={cn(
                                    "flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs font-semibold rounded-[14px] transition-all duration-300 whitespace-nowrap",
                                    filter === opt.value
                                        ? "bg-black text-white shadow-lg dark:bg-white dark:text-black"
                                        : "text-[#8a8a8a] hover:text-black dark:text-gray-400 dark:hover:text-white"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 ml-auto w-full sm:w-auto px-2 sm:px-0">
                        <button
                            onClick={handleMarkAllRead}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-xs font-semibold text-[#8a8a8a] hover:text-black transition-colors rounded-2xl hover:bg-white dark:hover:bg-[#111] dark:hover:text-white"
                        >
                            <Check className="w-4 h-4" />
                            Tout marquer comme lu
                        </button>
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-t-black border-gray-200 animate-spin dark:border-gray-800 dark:border-t-white" />
                        <p className="text-sm font-medium text-gray-400 animate-pulse">Récupération des alertes...</p>
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto pb-20 scrollbar-hide">
                        <NotificationList notifications={notifications} onRead={handleMarkAsRead} />
                    </div>
                )}
            </div>
        </div>
    );
}
