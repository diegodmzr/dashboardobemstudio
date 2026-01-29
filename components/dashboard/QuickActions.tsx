"use client";

import { PlusCircle, FileText, CreditCard, MessageSquare, BarChart2 } from "lucide-react";
import Link from "next/link";

type Props = {
    role: "ADMIN" | "CLIENT";
};

export default function QuickActions({ role }: Props) {
    const actions = role === "ADMIN" ? [
        { label: "Nouveau Projet", icon: PlusCircle, href: "/dashboard/projets?action=create", color: "bg-black text-white dark:bg-white dark:text-black" },
        { label: "Nouveau Client", icon: FileText, href: "/dashboard/clients?action=create", color: "bg-gray-100 text-gray-900 dark:bg-[#222] dark:text-white" },
        { label: "Créer Devis", icon: CreditCard, href: "/dashboard/finances/devis?action=create", color: "bg-gray-100 text-gray-900 dark:bg-[#222] dark:text-white" },
        { label: "Statistiques", icon: BarChart2, href: "/dashboard/statistiques", color: "bg-gray-100 text-gray-900 dark:bg-[#222] dark:text-white" },
    ] : [
        { label: "Nouvelle Demande", icon: MessageSquare, href: "/dashboard/client/demandes?action=create", color: "bg-black text-white dark:bg-white dark:text-black" },
        { label: "Mes Paiements", icon: CreditCard, href: "/dashboard/client/paiements", color: "bg-gray-100 text-gray-900 dark:bg-[#222] dark:text-white" },
        { label: "Mes Projets", icon: FileText, href: "/dashboard/client/projets", color: "bg-gray-100 text-gray-900 dark:bg-[#222] dark:text-white" },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 dark:bg-[#111] dark:border-[#333]">
            <h3 className="font-bold text-gray-900 mb-4 dark:text-white">Actions Rapides</h3>
            <div className="flex flex-wrap gap-3">
                {actions.map((act) => (
                    <Link
                        key={act.label}
                        href={act.href}
                        className={`group px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer ${act.color}`}
                    >
                        <act.icon className="w-4 h-4" />
                        {act.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
