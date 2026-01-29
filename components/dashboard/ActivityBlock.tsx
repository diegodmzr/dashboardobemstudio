"use client";

import { Activity, CheckCircle, FileText, DollarSign, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type Props = {
    activities: {
        id: string;
        type: string;
        text: string;
        date: string;
        icon: string;
    }[];
    role: "ADMIN" | "CLIENT";
};

export default function ActivityBlock({ activities, role }: Props) {

    // Map icons helper
    const getIcon = (type: string) => {
        if (type.includes("PAYMENT")) return <DollarSign className="w-4 h-4 text-green-500" />;
        if (type.includes("PROJECT")) return <FileText className="w-4 h-4 text-blue-500" />;
        if (type.includes("MESSAGE")) return <MessageSquare className="w-4 h-4 text-purple-500" />;
        return <Activity className="w-4 h-4 text-gray-500" />;
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 dark:bg-[#111] dark:border-[#333]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">
                    {role === "ADMIN" ? "Activité Récente" : "Dernières Mises à jour"}
                </h3>
            </div>

            <div className="space-y-6">
                {activities.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-4">Aucune activité récente</div>
                ) : (
                    activities.map((item, index) => (
                        <div key={item.id} className="relative flex gap-4">
                            {/* Connector Line */}
                            {index !== activities.length - 1 && (
                                <div className="absolute left-[19px] top-8 bottom-0 w-px bg-gray-100 dark:bg-[#333] -mb-6"></div>
                            )}

                            <div className="relative z-10 w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 dark:bg-[#1a1a1a] dark:border-[#333]">
                                {getIcon(item.type)}
                            </div>

                            <div className="flex-1 py-1">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {item.text}
                                </p>
                                <span className="text-xs text-gray-400">
                                    {formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: fr })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
