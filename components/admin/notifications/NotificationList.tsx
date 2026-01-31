"use client";

import {
    Bell,
    CreditCard,
    Layers,
    MessageSquare,
    Monitor,
    Target,
    ChevronRight,
    Circle,
    Info
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
    notifications: any[];
    onRead: (id: string) => void;
};

export default function NotificationList({ notifications, onRead }: Props) {
    const router = useRouter();

    if (notifications.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center p-12 bg-white/50 dark:bg-white/5 rounded-[32px] border border-dashed border-gray-200 dark:border-white/10"
            >
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6">
                    <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tout est à jour !</h3>
                <p className="text-sm text-gray-500 max-w-[240px] mt-2 leading-relaxed">
                    Vous n&apos;avez aucune nouvelle notification. Revenez plus tard !
                </p>
            </motion.div>
        );
    }

    const getIcon = (type: string) => {
        const iconClass = "w-5 h-5";
        switch (type) {
            case "PAYMENT": return <CreditCard className={cn(iconClass, "text-emerald-500")} />;
            case "PROJECT": return <Layers className={cn(iconClass, "text-blue-500")} />;
            case "DISCUSSION": return <MessageSquare className={cn(iconClass, "text-purple-500")} />;
            case "GOAL": return <Target className={cn(iconClass, "text-rose-500")} />;
            default: return <Info className={cn(iconClass, "text-gray-500")} />;
        }
    };

    const getColors = (type: string) => {
        switch (type) {
            case "PAYMENT": return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
            case "PROJECT": return "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
            case "DISCUSSION": return "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400";
            case "GOAL": return "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400";
            default: return "bg-gray-50 text-gray-600 dark:bg-white/5 dark:text-gray-400";
        }
    };

    return (
        <div className="space-y-3">
            <AnimatePresence initial={false}>
                {notifications.map((notif, index) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                            if (!notif.isRead) onRead(notif.id);

                            // Navigation Logic
                            if (notif.entityType === "Quote" && notif.entityId) {
                                router.push(`/dashboard/finances/devis?open=${notif.entityId}`);
                            } else if (notif.entityType === "Project" && notif.entityId) {
                                router.push(`/dashboard/projets/${notif.entityId}`);
                            }
                        }}
                        className={cn(
                            "group relative overflow-hidden flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-[24px] cursor-pointer transition-all duration-300 active:scale-[0.98]",
                            notif.isRead
                                ? "bg-white/50 border border-gray-100 dark:bg-[#111] dark:border-[#333] grayscale-[0.5] opacity-80"
                                : "bg-white border border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a1a] dark:shadow-none ring-1 ring-black/5 dark:ring-white/10"
                        )}
                    >
                        {/* Status bar */}
                        {!notif.isRead && (
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black dark:bg-white hidden sm:block" />
                        )}

                        {/* Icon & Category */}
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                            <div className={cn(
                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
                                getColors(notif.type)
                            )}>
                                {getIcon(notif.type)}
                            </div>

                            {/* Mobile only badge & dot */}
                            <div className="flex items-center gap-2 sm:hidden">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#8a8a8a]">
                                    {notif.type}
                                </span>
                                {!notif.isRead && <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                <h4 className={cn(
                                    "text-[15px] font-bold tracking-tight leading-tight transition-colors",
                                    notif.isRead ? "text-gray-500" : "text-[#1f1f1f] dark:text-white"
                                )}>
                                    {notif.title}
                                </h4>
                                <time className="text-[10px] font-bold uppercase tracking-wider text-[#b2b2b2] dark:text-gray-500 whitespace-nowrap">
                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                                </time>
                            </div>
                            <p className={cn(
                                "text-sm leading-relaxed line-clamp-2",
                                notif.isRead ? "text-gray-400" : "text-[#8a8a8a] dark:text-gray-400"
                            )}>
                                {notif.message}
                            </p>
                        </div>

                        {/* Desktop Only Actions */}
                        <div className="hidden sm:flex items-center justify-center h-10 w-10 rounded-2xl bg-gray-50 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
