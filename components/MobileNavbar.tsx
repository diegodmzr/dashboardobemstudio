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

type Props = {
    role?: string;
    onMobileClose?: () => void;
    isVisible?: boolean;
};

export default function MobileNavbar({ role, onMobileClose, isVisible = true }: Props) {
    const pathname = usePathname();

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
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onMobileClose}
                                    className="relative flex flex-col items-center py-0.5"
                                >
                                    <div className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                                        item.active
                                            ? "bg-black text-white shadow-md dark:bg-white dark:text-black"
                                            : "text-[#8a8a8a] dark:text-gray-400"
                                    )}>
                                        <Icon className="h-5 w-5" strokeWidth={item.active ? 2.2 : 1.8} />

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
