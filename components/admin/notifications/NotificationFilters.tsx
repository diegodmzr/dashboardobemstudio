"use client";

import { Bell, CreditCard, Layers, MessageSquare, Monitor, Target } from "lucide-react";

type Props = {
    currentFilter: string;
    onChange: (filter: string) => void;
};

export default function NotificationFilters({ currentFilter, onChange }: Props) {

    const filters = [
        { id: "ALL", label: "Tout voir", icon: Bell },
        { id: "PROJECT", label: "Projets", icon: Layers },
        { id: "PAYMENT", label: "Paiements", icon: CreditCard },
        { id: "DISCUSSION", label: "Discussions", icon: MessageSquare },
        { id: "SYSTEM", label: "Système", icon: Monitor },
        { id: "GOAL", label: "Objectifs", icon: Target },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-0 dark:bg-[#111] dark:border-[#333]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Filtres</h3>
            <div className="space-y-1">
                {filters.map(f => (
                    <button
                        key={f.id}
                        onClick={() => onChange(f.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${currentFilter === f.id
                                ? "bg-black text-white dark:bg-white dark:text-black"
                                : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-[#222]"
                            }`}
                    >
                        <f.icon className="w-4 h-4" />
                        {f.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
