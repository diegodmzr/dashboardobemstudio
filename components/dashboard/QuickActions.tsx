"use client";

import { PlusCircle, FileText, CreditCard, MessageSquare, BarChart2 } from "lucide-react";
import Link from "next/link";

type Props = {
    role: "ADMIN" | "CLIENT" | "SUPER_ADMIN";
};

export default function QuickActions({ role }: Props) {
    const actions = role !== "CLIENT" ? [
        { label: "Nouveau Projet", icon: PlusCircle, href: "/dashboard/projets?action=create", color: "bg-black text-white dark:bg-white dark:text-black" },
        { label: "Nouveau Client", icon: FileText, href: "/dashboard/clients?action=create", color: "bg-gray-100 text-gray-900 dark:bg-[#222] dark:text-white" },
        { label: "Créer Devis", icon: CreditCard, href: "/dashboard/finances/devis?action=create", color: "bg-gray-100 text-gray-900 dark:bg-[#222] dark:text-white" },
        { label: "Statistiques", icon: BarChart2, href: "/dashboard/statistiques", color: "bg-gray-100 text-gray-900 dark:bg-[#222] dark:text-white" },
    ] : [
        { label: "Nouvelle Demande", icon: MessageSquare, href: "/dashboard/discussion?action=create", color: "bg-black text-white dark:bg-white dark:text-black" },
        { label: "Mes Paiements", icon: CreditCard, href: "/dashboard/finances/paiements", color: "bg-gray-100 text-gray-900 dark:bg-[#222] dark:text-white" },
        { label: "Mes Projets", icon: FileText, href: "/dashboard/projets", color: "bg-gray-100 text-gray-900 dark:bg-[#222] dark:text-white" },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 dark:bg-[#111] dark:border-[#333]">
            <h3 className="font-bold text-gray-900 mb-4 dark:text-white">Actions Rapides</h3>
            {/* Scrollable container on mobile, flex-wrap on desktop */}
            <div className="flex flex-nowrap md:flex-wrap items-center gap-3 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide -mx-2 px-2 md:mx-0 md:px-0">
                {actions.map((act) => (
                    <Link
                        key={act.label}
                        href={act.href}
                        className={`shrink-0 group px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-transparent ${act.color}`}
                    >
                        <act.icon className="w-4 h-4" />
                        <span className="whitespace-nowrap">{act.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
