"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DollarSign, Plus } from "lucide-react";
import Topbar from "@/components/Topbar";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import SubscriptionDrawer from "./SubscriptionDrawer";

type Subscription = {
    id: string;
    status: string; // active, canceled, past_due
    amount: number;
    currency: string;
    interval: string; // month, year
    currentPeriodEnd: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    stripeProductId: string | null;
    client: { id: string; name: string; companyName: string | null; email: string };
    createdAt: string;
    projectId?: string | null;
    startDate: string;
    endDate?: string | null;
};

type Props = {
    initialSubscriptions: Subscription[];
    initialStats: {
        mrr: number;
        activeCount: number;
        canceledCount: number;
    };
    clients: any[];
    projects: any[];
};

export default function SubscriptionsClient({
    initialSubscriptions,
    initialStats,
    clients,
    projects,
}: Props) {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
    const [stats, setStats] = useState(initialStats);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const { toasts, success, error, removeToast } = useToast();
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filteredSubscriptions = subscriptions.filter((s) => {
        const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
        return matchesStatus;
    });

    const handleCreate = () => {
        setSelectedSubscription(null);
        setIsDrawerOpen(true);
    };

    const handleView = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setIsDrawerOpen(true);
    };

    const handleCancel = async (subscriptionId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir annuler cet abonnement ?")) return;

        try {
            const res = await fetch("/api/subscriptions/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionId }),
            });

            if (!res.ok) throw new Error("Failed");

            success("Abonnement annulé avec succès");
            window.location.reload();
        } catch (e) {
            error("Erreur lors de l'annulation");
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: "bg-green-100 text-green-600",
            canceled: "bg-gray-100 text-gray-500",
            past_due: "bg-orange-100 text-orange-600 ring-1 ring-orange-200",
            unpaid: "bg-red-100 text-red-600",
        };
        const labels: Record<string, string> = {
            active: "Actif",
            canceled: "Annulé",
            past_due: "En retard",
            unpaid: "Impayé",
        };
        return (
            <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-500"
                    }`}
            >
                {labels[status] || status}
            </span>
        );
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);
    const formatDate = (d: string | null) =>
        d
            ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
            : "—";

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black">
            <Toast toasts={toasts} onRemove={removeToast} />
            <Topbar
                title="Abonnements"
                subtitle="Revenus récurrents et gestion des contrats"
                rightContent={
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/finances/paiements"
                            className="bg-white text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-50 transition flex items-center gap-2"
                        >
                            <DollarSign className="w-4 h-4" />
                            <span>Paiements</span>
                        </Link>
                        <button
                            onClick={handleCreate}
                            className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition shadow-lg shadow-black/10 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Créer un abonnement</span>
                        </button>
                    </div>
                }
            />

            <main className="flex-1 p-8 overflow-y-auto">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 rounded-2xl border border-green-100 bg-green-50/50 dark:bg-black dark:border-green-900">
                        <span className="text-xs font-semibold uppercase tracking-wider text-green-600">
                            MRR (Revenu Mensuel Récurrent)
                        </span>
                        <div className="mt-2 text-3xl font-light text-green-700">{formatCurrency(stats.mrr)}</div>
                        <div className="mt-1 text-xs text-green-600">Abonnements actifs uniquement</div>
                    </div>
                    <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 dark:bg-black dark:border-[#333]">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Actifs
                        </span>
                        <div className="mt-2 text-3xl font-light text-black dark:text-white">{stats.activeCount}</div>
                    </div>
                    <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 dark:bg-black dark:border-[#333]">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Annulés
                        </span>
                        <div className="mt-2 text-3xl font-light text-gray-600">{stats.canceledCount}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        {["ALL", "active", "canceled", "past_due"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === status
                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-black dark:text-gray-400 dark:hover:bg-[#111]"
                                    }`}
                            >
                                {status === "ALL"
                                    ? "Tous"
                                    : status === "active"
                                        ? "Actifs"
                                        : status === "canceled"
                                            ? "Annulés"
                                            : "En retard"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-black dark:border-[#333]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 dark:bg-black dark:border-[#333]">
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Client
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Montant
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Période
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Prochaine Facturation
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">
                                    Statut
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-[#333]">
                            {filteredSubscriptions.length > 0 ? (
                                filteredSubscriptions.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="hover:bg-gray-50 transition cursor-pointer dark:hover:bg-[#111]"
                                        onClick={() => handleView(s)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.client.name}</span>
                                                {s.client.companyName && (
                                                    <span className="text-xs text-gray-400">{s.client.companyName}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatCurrency(s.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {s.interval === "month" ? "Mensuel" : "Annuel"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {s.status === "active" ? formatDate(s.currentPeriodEnd) : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-center">{getStatusBadge(s.status)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                className="text-gray-400 hover:text-black"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleView(s);
                                                }}
                                            >
                                                ➝
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                                        Aucun abonnement trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Drawer */}
            <SubscriptionDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                subscription={selectedSubscription}
                onCancel={handleCancel}
                clients={clients}
                projects={projects}
            />
        </div>
    );
}
