"use client";

import { Bell, CreditCard, Layers, MessageSquare, Monitor, Target, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type Props = {
    notifications: any[];
    onRead: (id: string) => void;
};

import { useRouter } from "next/navigation";

export default function NotificationList({ notifications, onRead }: Props) {
    const router = useRouter();


    if (notifications.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                <Bell className="w-12 h-12 mb-4 opacity-20" />
                <p>Aucune notification pour le moment 🎉</p>
            </div>
        );
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "PAYMENT": return <CreditCard className="w-5 h-5 text-green-500" />;
            case "PROJECT": return <Layers className="w-5 h-5 text-blue-500" />;
            case "DISCUSSION": return <MessageSquare className="w-5 h-5 text-purple-500" />;
            case "GOAL": return <Target className="w-5 h-5 text-orange-500" />;
            default: return <Monitor className="w-5 h-5 text-gray-500" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case "PAYMENT": return "bg-green-50 dark:bg-green-900/20";
            case "PROJECT": return "bg-blue-50 dark:bg-blue-900/20";
            case "DISCUSSION": return "bg-purple-50 dark:bg-purple-900/20";
            case "GOAL": return "bg-orange-50 dark:bg-orange-900/20";
            default: return "bg-gray-50 dark:bg-[#222]";
        }
    };

    return (
        <div className="divide-y divide-gray-50 dark:divide-[#222]">
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    onClick={() => {
                        if (!notif.isRead) onRead(notif.id);

                        // Navigation Logic based on Entity
                        if (notif.entityType === "Quote" && notif.entityId) {
                            router.push(`/dashboard/finances/devis?open=${notif.entityId}`);
                        }
                    }}
                    className={`p-4 hover:bg-gray-50 transition cursor-pointer flex gap-4 relative group dark:hover:bg-[#1a1a1a] ${!notif.isRead ? "bg-blue-50/30 dark:bg-blue-900/5" : ""}`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getBgColor(notif.type)}`}>
                        {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-semibold mb-1 ${!notif.isRead ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                                {notif.title}
                            </h4>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2">
                            {notif.message}
                        </p>
                    </div>
                    {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 absolute top-6 right-4"></div>
                    )}
                </div>
            ))}
        </div>
    );
}
