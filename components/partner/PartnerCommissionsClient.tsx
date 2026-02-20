"use client";

import { useState, useMemo } from "react";
import { Euro, Clock, CheckCircle, AlertCircle, TrendingUp, Filter, ChevronDown } from "lucide-react";

type Commission = {
    id: string;
    label: string;
    commissionRate: number;
    baseAmount: number;
    commissionAmount: number;
    status: "PENDING" | "IN_PROGRESS" | "PAID";
    paidAt?: string;
    notes?: string;
    createdAt: string;
    project?: { id: string; name: string; amount: number; status: string };
    quote?: { id: string; reference: string; total: number; status: string };
};

type Props = {
    commissions: Commission[];
    commissionRate: number;
    totalEarned: number;
    paidAmount: number;
    pendingAmount: number;
};

const STATUS_META = {
    PENDING: { label: "Non payé", color: "text-amber-600 bg-amber-50 border-amber-200", dot: "bg-amber-400", icon: AlertCircle },
    IN_PROGRESS: { label: "En cours d'envoi", color: "text-blue-600 bg-blue-50 border-blue-200", dot: "bg-blue-400", icon: Clock },
    PAID: { label: "Payé", color: "text-emerald-600 bg-emerald-50 border-emerald-200", dot: "bg-emerald-400", icon: CheckCircle },
};

function fmt(n: number) {
    return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default function PartnerCommissionsClient({ commissions, commissionRate, totalEarned, paidAmount, pendingAmount }: Props) {
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const filtered = useMemo(() =>
        commissions.filter(c => !statusFilter || c.status === statusFilter),
        [commissions, statusFilter]
    );

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Commissions</h1>
                <p className="text-sm text-gray-500 mt-0.5">Suivi de toutes vos commissions et leur statut de paiement.</p>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Total généré", value: fmt(totalEarned), icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/10" },
                    { label: "Commissions payées", value: fmt(paidAmount), icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
                    { label: "En attente", value: fmt(pendingAmount), icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/10" },
                ].map(kpi => (
                    <div key={kpi.label} className="rounded-2xl border border-gray-200 bg-white p-5 dark:bg-[#111] dark:border-[#333]">
                        <div className={`inline-flex p-2 rounded-xl ${kpi.bg} ${kpi.color} mb-3`}>
                            <kpi.icon className="h-4 w-4" />
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{kpi.value}</p>
                        <p className="text-sm text-gray-500 font-medium mt-0.5">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Info banner ── */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>ℹ️ Comment sont payées vos commissions ?</strong><br />
                    Vos commissions sont versées par virement bancaire. Nous mettons à jour le statut dès que le virement est émis.
                    Pour toute question, contactez-nous directement.
                </p>
            </div>

            {/* ── Filters ── */}
            <div className="flex items-center gap-2 flex-wrap">
                {[null, "PENDING", "IN_PROGRESS", "PAID"].map(s => (
                    <button
                        key={s || "all"}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition border ${statusFilter === s
                            ? "bg-black text-white border-black dark:bg-white dark:text-black"
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-[#111] dark:border-[#333] dark:text-gray-400"
                            }`}
                    >
                        {s === null ? "Tout" : STATUS_META[s as keyof typeof STATUS_META]?.label}
                    </button>
                ))}
            </div>

            {/* ── Commission list ── */}
            {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-[#333] p-16 text-center">
                    <Euro className="h-10 w-10 mx-auto mb-3 text-gray-200 dark:text-[#333]" />
                    <p className="text-gray-500 font-medium">Aucune commission</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-gray-200 bg-white dark:bg-[#111] dark:border-[#333] overflow-hidden">
                    {/* Table header */}
                    <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-gray-100 dark:border-[#1a1a1a] text-xs font-bold uppercase tracking-wider text-gray-400">
                        <span>Description</span>
                        <span className="text-right">Montant base</span>
                        <span className="text-right">Commission</span>
                        <span className="text-right">Statut</span>
                    </div>

                    {filtered.map((comm, i) => {
                        const meta = STATUS_META[comm.status] || STATUS_META.PENDING;
                        const StatusIcon = meta.icon;
                        return (
                            <div key={comm.id} className={`flex flex-col md:grid md:grid-cols-[1fr_auto_auto_auto] gap-2 md:gap-4 items-start md:items-center px-5 py-4 ${i < filtered.length - 1 ? "border-b border-gray-100 dark:border-[#1a1a1a]" : ""}`}>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{comm.label}</p>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                                        {comm.project && <span>Projet : {comm.project.name}</span>}
                                        {comm.quote && <span>Devis : {comm.quote.reference}</span>}
                                        {!comm.project && !comm.quote && (
                                            <span>{new Date(comm.createdAt).toLocaleDateString("fr-FR")}</span>
                                        )}
                                        <span className="text-gray-300 dark:text-[#444]">·</span>
                                        <span>{comm.commissionRate}%</span>
                                        {comm.paidAt && (
                                            <>
                                                <span className="text-gray-300 dark:text-[#444]">·</span>
                                                <span className="text-emerald-500">Payé le {new Date(comm.paidAt).toLocaleDateString("fr-FR")}</span>
                                            </>
                                        )}
                                    </div>
                                    {comm.notes && (
                                        <p className="text-xs text-gray-400 mt-1 italic">{comm.notes}</p>
                                    )}
                                </div>

                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-medium">Base</p>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{fmt(comm.baseAmount)}</p>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-medium">Commission</p>
                                    <p className="text-base font-black text-gray-900 dark:text-white">{fmt(comm.commissionAmount)}</p>
                                </div>

                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                    {meta.label}
                                </span>
                            </div>
                        );
                    })}

                    {/* Total footer */}
                    <div className="flex items-center justify-end gap-4 px-5 py-4 border-t-2 border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#0d0d0d]">
                        <span className="text-sm font-bold text-gray-500">Total filtré :</span>
                        <span className="text-xl font-black text-gray-900 dark:text-white">
                            {fmt(filtered.reduce((s, c) => s + c.commissionAmount, 0))}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
