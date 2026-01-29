"use client";

import { useState, useEffect } from "react";
import { Filter, Check, Trash2 } from "lucide-react";
import NotificationList from "./NotificationList";
import NotificationFilters from "./NotificationFilters";

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
                // Update local state
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllRead = async () => {
        // Implement bulk read if needed, or iterate
        // For now simple reload or optimistic update
        fetchNotifications();
    };

    return (
        <div className="flex h-full gap-6">
            {/* Left Column: Filters (Desktop) */}
            <div className="hidden lg:block w-64 flex-shrink-0">
                <NotificationFilters currentFilter={filter} onChange={setFilter} />
            </div>

            {/* Right Column: List */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden dark:bg-[#111] dark:border-[#333]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 dark:bg-[#1a1a1a] dark:border-[#333]">
                    <h2 className="font-bold text-gray-900 dark:text-white">Vos Notifications</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-semibold text-gray-500 hover:text-black flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:text-white dark:hover:bg-[#333]"
                        >
                            <Check className="w-3 h-3" /> Tout marquer comme lu
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-0">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Chargement...</div>
                    ) : (
                        <NotificationList notifications={notifications} onRead={handleMarkAsRead} />
                    )}
                </div>
            </div>
        </div>
    );
}
