"use client";

import { TrendingUp, Euro, Clock, CheckCircle, AlertCircle, ArrowUpRight, Handshake, Percent } from "lucide-react";
import Link from "next/link";

type Commission = {
    id: string;
    label: string;
    commissionRate: number;
    baseAmount: number;
    commissionAmount: number;
    status: "PENDING" | "IN_PROGRESS" | "PAID";
    paidAt?: string;
    createdAt: string;
    project?: { id: string; name: string; status: string };
    quote?: { id: string; reference: string; status: string };
};

type Props = {
    partner: {
        id: string;
        name: string;
        firstName?: string;
        commissionRate: number;
    };
    totalEarned: number;
    paidAmount: number;
    pendingAmount: number;
    recentCommissions: Commission[];
};

const STATUS_META = {
    PENDING: { label: "Non payé", color: "text-amber-600 bg-amber-50 border-amber-200", dot: "bg-amber-400" },
    IN_PROGRESS: { label: "En cours d'envoi", color: "text-blue-600 bg-blue-50 border-blue-200", dot: "bg-blue-400" },
    PAID: { label: "Payé", color: "text-emerald-600 bg-emerald-50 border-emerald-200", dot: "bg-emerald-400" },
};

function fmt(n: number) {
    return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default function PartnerHomeClient({ partner, totalEarned, paidAmount, pendingAmount, recentCommissions }: Props) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
    const firstName = partner.firstName || partner.name.split(" ")[0];

    return (
        <div className="space-y-8">
            {/* ── Hero greeting ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black to-gray-800 px-8 py-10 text-white dark:from-[#1a1a1a] dark:to-black">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                        <Handshake className="h-5 w-5 opacity-60" />
                        <span className="text-sm font-medium opacity-60">Espace Partenaire</span>
                    </div>
                    <h1 className="text-3xl font-black mb-1">{greeting}, {firstName} 👋</h1>
                    <p className="text-white/60 text-sm">
                        Votre taux de commission : <span className="text-white font-bold">{partner.commissionRate}%</span>
                    </p>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        label: "Total généré",
                        value: fmt(totalEarned),
                        icon: TrendingUp,
                        color: "text-violet-600",
                        bg: "bg-violet-50 dark:bg-violet-900/10",
                        desc: "Commissions totales"
                    },
                    {
                        label: "Commissions payées",
                        value: fmt(paidAmount),
                        icon: CheckCircle,
                        color: "text-emerald-600",
                        bg: "bg-emerald-50 dark:bg-emerald-900/10",
                        desc: "Virements reçus"
                    },
                    {
                        label: "En attente",
                        value: fmt(pendingAmount),
                        icon: Clock,
                        color: "text-amber-600",
                        bg: "bg-amber-50 dark:bg-amber-900/10",
                        desc: "À venir"
                    },
                ].map(kpi => (
                    <div key={kpi.label} className="rounded-2xl border border-gray-200 bg-white p-6 dark:bg-[#111] dark:border-[#333]">
                        <div className={`inline-flex p-2.5 rounded-xl ${kpi.bg} ${kpi.color} mb-4`}>
                            <kpi.icon className="h-5 w-5" />
                        </div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{kpi.value}</p>
                        <p className="text-sm font-semibold text-gray-500 mt-1">{kpi.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{kpi.desc}</p>
                    </div>
                ))}
            </div>

            {/* ── Commission rate card ── */}
            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 p-6 flex items-center gap-6 dark:border-violet-900/30 dark:from-violet-900/10 dark:to-purple-900/10">
                <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900/40">
                    <Percent className="h-8 w-8 text-white" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-violet-500">Votre taux de commission</p>
                    <p className="text-4xl font-black text-violet-700 dark:text-violet-300">{partner.commissionRate}%</p>
                    <p className="text-sm text-violet-600/70 mt-1 dark:text-violet-400/70">
                        Pour chaque projet référencé, vous touchez {partner.commissionRate}% du montant total.
                        Les paiements sont effectués par virement bancaire.
                    </p>
                </div>
            </div>

            {/* ── Recent commissions ── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Commissions récentes</h2>
                    <Link href="/partner/dashboard/commissions" className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-black transition dark:hover:text-white">
                        Voir tout <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>

                {recentCommissions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 dark:border-[#333] p-12 text-center">
                        <Euro className="h-10 w-10 mx-auto mb-3 text-gray-200 dark:text-[#333]" />
                        <p className="text-gray-500 font-medium">Aucune commission pour l'instant</p>
                        <p className="text-sm text-gray-400 mt-1">Vos commissions apparaîtront ici dès qu'un projet vous sera attribué.</p>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-gray-200 bg-white dark:bg-[#111] dark:border-[#333] overflow-hidden">
                        {recentCommissions.map((comm, i) => {
                            const meta = STATUS_META[comm.status] || STATUS_META.PENDING;
                            return (
                                <div key={comm.id} className={`flex items-center gap-4 px-5 py-4 ${i < recentCommissions.length - 1 ? "border-b border-gray-100 dark:border-[#1a1a1a]" : ""}`}>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{comm.label}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {comm.project?.name && `Projet : ${comm.project.name}`}
                                            {comm.quote?.reference && `Devis : ${comm.quote.reference}`}
                                            {!comm.project && !comm.quote && new Date(comm.createdAt).toLocaleDateString("fr-FR")}
                                        </p>
                                    </div>
                                    <p className="text-base font-black text-gray-900 dark:text-white">{fmt(comm.commissionAmount)}</p>
                                    <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                        {meta.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
