"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Layers,
    MessageSquare,
    CreditCard,
    Bell,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Props = {
    role?: string;
    onMobileClose?: () => void;
};

export default function MobileNavbar({ role, onMobileClose }: Props) {
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
    ];

    // Finance link
    items.push({
        label: "Finances",
        href: "/dashboard/finances",
        icon: CreditCard,
        active: pathname.startsWith("/dashboard/finances")
    });

    // Final item: Notifications OR Team for Super Admin?
    // Let's stick to Notifications as it's universally useful on mobile.
    items.push({
        label: "Alertes",
        href: "/dashboard/notifications",
        icon: Bell,
        active: pathname.startsWith("/dashboard/notifications")
    });

    return (
        <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden">
            <nav className="flex items-center justify-around rounded-3xl border border-white/20 bg-white/70 px-2 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:bg-black/70 dark:border-white/10">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onMobileClose}
                            className="relative flex flex-col items-center gap-1 px-3"
                        >
                            <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300",
                                item.active
                                    ? "bg-black text-white scale-110 shadow-lg dark:bg-white dark:text-black"
                                    : "text-[#8a8a8a] hover:text-black dark:text-gray-400 dark:hover:text-white"
                            )}>
                                <Icon className="h-5 w-5" strokeWidth={item.active ? 2.5 : 2} />

                                {item.active && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute -bottom-1 h-1 w-1 rounded-full bg-current"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider transition-colors",
                                item.active ? "text-black dark:text-white" : "text-[#b2b2b2] dark:text-gray-500"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    );
}
