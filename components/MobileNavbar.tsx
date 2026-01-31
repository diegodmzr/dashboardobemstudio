"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Layers,
    MessageSquare,
    CreditCard,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

type Props = {
    role?: string;
    onMobileClose?: () => void;
    isVisible?: boolean;
};

export default function MobileNavbar({ role, onMobileClose, isVisible = true }: Props) {
    const pathname = usePathname();
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await fetch("/api/notifications/count");
                if (res.ok) {
                    const data = await res.json();
                    setNotificationCount(data.count);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const items = [
        {
            label: "Accueil",
            href: "/dashboard",
            icon: Home,
            active: pathname === "/dashboard"
        },
        {
            label: "Projets",
            href: "/dashboard/projets",
            icon: Layers,
            active: pathname.startsWith("/dashboard/projets")
        },
        {
            label: "Messagerie",
            href: "/dashboard/discussion",
            icon: MessageSquare,
            active: pathname.startsWith("/dashboard/discussion")
        },
        {
            label: "Finances",
            href: "/dashboard/finances/devis",
            icon: CreditCard,
            active: pathname.startsWith("/dashboard/finances")
        },
        {
            label: "Alertes",
            href: "/dashboard/notifications",
            icon: Bell,
            active: pathname.startsWith("/dashboard/notifications")
        },
    ];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
                >
                    <nav className="flex items-center justify-around rounded-2xl border border-white/20 bg-white/80 px-1 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:bg-black/80 dark:border-white/10">
                        {items.map((item) => {
                            const Icon = item.icon;
                            const isNotification = item.href.includes("notifications");

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onMobileClose}
                                    className="relative flex flex-col items-center py-0.5"
                                >
                                    <div className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 relative",
                                        item.active
                                            ? "bg-black text-white shadow-md dark:bg-white dark:text-black"
                                            : "text-[#8a8a8a] dark:text-gray-400"
                                    )}>
                                        <Icon className="h-5 w-5" strokeWidth={item.active ? 2.2 : 1.8} />

                                        {/* Notification Dot */}
                                        {isNotification && notificationCount > 0 && (
                                            <span className="absolute top-2 right-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#f43f5e] ring-2 ring-white dark:ring-black">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f43f5e] opacity-75"></span>
                                            </span>
                                        )}

                                        {item.active && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-current"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </nav>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
