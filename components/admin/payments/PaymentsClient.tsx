"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, CreditCard, Building, HandCoins, Landmark } from "lucide-react";
import Topbar from "@/components/Topbar";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import PaymentDrawer from "./PaymentDrawer";

type Payment = {
    id: string;
    amount: number;
    status: string; // PENDING, PAID, LATE, FAILED
    method: string | null;
    client: { id: string, name: string; companyName: string | null; email: string };
    createdAt: string;
    dueDate: string | null;
    paidAt: string | null;
    stripePaymentIntentId: string | null;
    invoiceUrl: string | null;
    projectId?: string | null;
};

type Props = {
    initialPayments: Payment[];
    initialStats: {
        totalRevenue: number;
        pendingAmount: number;
        lateCount: number;
    };
    clients: any[];
    projects: any[];
};

export default function PaymentsClient({ initialPayments, initialStats, clients, projects }: Props) {
    const [payments, setPayments] = useState<Payment[]>(initialPayments);
    const [stats, setStats] = useState(initialStats);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const { toasts, success, error, removeToast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const searchParams = useSearchParams();

    // Check query params for deep linking
    useEffect(() => {
        const paymentId = searchParams.get("paymentId") || searchParams.get("open");
        if (paymentId) {
            const paymentToOpen = initialPayments.find(p => p.id === paymentId);
            if (paymentToOpen) {
                setSelectedPayment(paymentToOpen);
                setIsDrawerOpen(true);
            }
        }
    }, [searchParams, initialPayments]);

    const filteredPayments = payments.filter(p => {
        const matchesSearch =
            p.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.client.companyName && p.client.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreate = () => {
        setSelectedPayment(null);
        setIsDrawerOpen(true);
    };

    const handleView = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsDrawerOpen(true);
    };

    const handleSave = async (data: any) => {
        try {
            // Logic to create payment via API
            const res = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed");

            // Refresh
            window.location.reload();
            setIsDrawerOpen(false);
            success("Paiement enregistré");
        } catch (e) {
            error("Erreur lors de l'enregistrement");
        }
    };

    const handleReminder = async (paymentId: string) => {
        // Mock reminder
        success("Relance envoyée au client");
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/payments/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");

            setPayments(prev => prev.filter(p => p.id !== id));
            setIsDrawerOpen(false);
            success("Paiement supprimé");

            // Refresh stats (simple way: reload or recalculate)
            window.location.reload();
        } catch (e) {
            error("Erreur lors de la suppression");
        }
    };

    const handleArchive = async (id: string) => {
        try {
            const res = await fetch(`/api/payments/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isArchived: true })
            });
            if (!res.ok) throw new Error("Archive failed");

            setPayments(prev => prev.filter(p => p.id !== id));
            setIsDrawerOpen(false);
            success("Paiement archivé");

            // Refresh stats
            window.location.reload();
        } catch (e) {
            error("Erreur lors de l'archivage");
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: "bg-gray-100 text-gray-600 dark:bg-[#222] dark:text-gray-400",
            PAID: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
            LATE: "bg-red-50 text-red-600 ring-1 ring-red-100 animate-pulse dark:bg-red-900/30 dark:text-red-400 dark:ring-red-900/50",
            FAILED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
            REFUNDED: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
        };
        const labels: Record<string, string> = {
            PENDING: "Non payé",
            PAID: "Payé",
            LATE: "En retard",
            FAILED: "Échoué",
            REFUNDED: "Remboursé"
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-500 dark:bg-[#333] dark:text-gray-400"}`}>
                {labels[status] || status}
            </span>
        );
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);
    const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: 'numeric' }) : "—";

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#111]">
            <Toast toasts={toasts} onRemove={removeToast} />
            <Topbar
                title="Paiements"
                subtitle="Suivi de la trésorerie et encaissements"
                rightContent={
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/finances/abonnements"
                            className="bg-white text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-50 transition flex items-center gap-2 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:hover:bg-[#222]"
                        >
                            <CalendarDays className="w-4 h-4" />
                            <span>Abonnements</span>
                        </Link>
                        <button
                            onClick={handleCreate}
                            className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition shadow-lg shadow-black/10 flex items-center gap-2 dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:shadow-none"
                        >
                            <span>+ Saisir un paiement</span>
                        </button>
                    </div>
                }
            />

            <main className="flex-1 p-8 overflow-y-auto">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 dark:bg-[#1a1a1a] dark:border-[#333]">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Total Encaissé</span>
                        <div className="mt-2 text-3xl font-light text-black dark:text-white">{formatCurrency(stats.totalRevenue)}</div>
                    </div>
                    <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 dark:bg-[#1a1a1a] dark:border-[#333]">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Non payé</span>
                        <div className="mt-2 text-3xl font-light text-gray-600 dark:text-gray-300">{formatCurrency(stats.pendingAmount)}</div>
                    </div>
                    <div className={`p-6 rounded-2xl border border-gray-100 ${stats.lateCount > 0 ? 'bg-red-50/50 dark:bg-red-900/10' : 'bg-gray-50/50 dark:bg-[#1a1a1a]'} dark:border-[#333]`}>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${stats.lateCount > 0 ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>Retards</span>
                        <div className={`mt-2 text-3xl font-light ${stats.lateCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>{stats.lateCount}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher client..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex items-center gap-2">
                        {["ALL", "PAID", "PENDING", "LATE", "FAILED"].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === status
                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-[#1a1a1a] dark:text-gray-400 dark:hover:bg-[#222]"
                                    }`}
                            >
                                {status === "ALL" ? "Tous" : getStatusBadge(status).props.children}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-[#1a1a1a] dark:border-[#333] dark:shadow-none">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 dark:bg-[#222] dark:border-[#333]">
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Client / Projet</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Méthode</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right dark:text-gray-400">Montant</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center dark:text-gray-400">Statut</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right dark:text-gray-400"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-[#333]">
                            {filteredPayments.length > 0 ? (
                                filteredPayments.map((p) => {
                                    const project = projects.find(pr => pr.id === p.projectId);
                                    return (
                                        <tr key={p.id} className="hover:bg-gray-50 transition cursor-pointer dark:hover:bg-[#222]" onClick={() => handleView(p)}>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{p.client.name}</span>
                                                    {project && <span className="text-xs text-blue-500 mt-0.5">{project.name}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {p.status === 'PAID' ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900 font-medium dark:text-white">{formatDate(p.paidAt)}</span>
                                                        <span className="text-xs text-green-600 dark:text-green-400">Réglé</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900 font-medium dark:text-white">{formatDate(p.dueDate)}</span>
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">Échéance</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    {p.method === 'CARD' && (
                                                        <>
                                                            <CreditCard className="w-4 h-4" />
                                                            <span>Carte</span>
                                                        </>
                                                    )}
                                                    {p.method === 'TRANSFER' && (
                                                        <>
                                                            <Building className="w-4 h-4" />
                                                            <span>Virement</span>
                                                        </>
                                                    )}
                                                    {p.method === 'MANUAL' && (
                                                        <>
                                                            <HandCoins className="w-4 h-4" />
                                                            <span>Manuel</span>
                                                        </>
                                                    )}
                                                    {p.method === 'SEPA' && (
                                                        <>
                                                            <Landmark className="w-4 h-4" />
                                                            <span>SEPA</span>
                                                        </>
                                                    )}
                                                    {!p.method && '—'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right dark:text-white">{formatCurrency(p.amount)}</td>
                                            <td className="px-6 py-4 text-center">{getStatusBadge(p.status)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="cursor-pointer text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white">➝</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm dark:text-gray-400">
                                        Aucun paiement trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Drawer */}
            <PaymentDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                payment={selectedPayment}
                onSave={handleSave}
                onRemind={handleReminder}
                onDelete={handleDelete}
                onArchive={handleArchive}
                clients={clients}
                projects={projects}
            />
        </div>
    );
}
