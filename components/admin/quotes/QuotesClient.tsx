"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Topbar from "@/components/Topbar";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import QuoteDrawer, { QuoteFormData } from "./QuoteDrawer";
import QuoteRowActions from "./QuoteRowActions";

type Quote = {
    id: string;
    reference: string;
    status: string; // DRAFT, SENT, ACCEPTED, REJECTED
    client: { name: string; companyName: string | null; email: string };
    issuedAt: string;
    amount?: number; // legacy
    total: number;
    pdfUrl: string | null;
    items?: string;
    subtotal?: number;
    taxRate?: number;
    notes?: string;
    terms?: string;
    validUntil?: string | null;
    clientId: string;
    projectId?: string | null;
};

type Props = {
    initialQuotes: Quote[];
    clients: any[];
    projects: any[];
};

export default function QuotesClient({ initialQuotes, clients, projects }: Props) {
    const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
    const { toasts, success, error, removeToast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // URL Params
    const searchParams = useSearchParams();
    const action = searchParams.get("action");
    const openId = searchParams.get("open");

    useEffect(() => {
        if (action === "create") {
            setIsDrawerOpen(true);
        }

        if (openId && quotes.length > 0) {
            const targetQuote = quotes.find(q => q.id === openId);
            if (targetQuote) {
                setEditingQuote(targetQuote);
                setIsDrawerOpen(true);
            }
        }
    }, [action, openId, quotes]);

    const filteredQuotes = quotes.filter(q => {
        const matchesSearch =
            q.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (q.client.companyName && q.client.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreate = () => {
        setEditingQuote(null);
        setIsDrawerOpen(true);
    };

    const handleEdit = (quote: Quote) => {
        setEditingQuote(quote);
        setIsDrawerOpen(true);
    };

    const handleSave = async (data: QuoteFormData) => {
        try {
            const isEdit = !!editingQuote;
            const url = isEdit ? `/api/quotes/${editingQuote.id}` : "/api/quotes";
            const method = isEdit ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Erreur lors de la sauvegarde");

            const savedQuote = await res.json();

            // Allow time for DB/Server update propagation or just update local state optimistically/via response
            // Ideally we reload page or update list. For now, reload to get clean state.
            window.location.reload();

            success(isEdit ? "Devis mis à jour" : "Devis créé avec succès");
            setIsDrawerOpen(false);
        } catch (err) {
            error("Une erreur est survenue");
            console.error(err);
        }
    };

    const handleSend = async (quote: Quote) => {
        if (!confirm(`Envoyer le devis ${quote.reference} au client ?`)) return;
        try {
            const res = await fetch(`/api/quotes/${quote.id}/send`, { method: "POST" });
            if (res.ok) {
                success("Devis envoyé avec succès");
                window.location.reload();
            } else {
                throw new Error("Erreur lors de l'envoi");
            }
        } catch (err) {
            error("Impossible d'envoyer le devis");
            console.error(err);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            DRAFT: "bg-gray-100 text-gray-600",
            SENT: "bg-blue-100 text-blue-600",
            ACCEPTED: "bg-green-100 text-green-600",
            REJECTED: "bg-red-100 text-red-600",
        };
        const labels: Record<string, string> = {
            DRAFT: "Brouillon",
            SENT: "Envoyé",
            ACCEPTED: "Accepté",
            REJECTED: "Refusé",
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-500"}`}>
                {labels[status] || status}
            </span>
        );
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);
    const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR");

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black">
            <Toast toasts={toasts} onRemove={removeToast} />
            <Topbar
                title="Devis"
                subtitle="Gérez votre facturation et vos propositions commerciales"
                rightContent={
                    <button
                        onClick={handleCreate}
                        className="cursor-pointer bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition shadow-lg shadow-black/10 flex items-center gap-2 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        <span>+ Créer un devis</span>
                    </button>
                }
            />

            <main className="flex-1 p-8 overflow-y-auto">
                {/* Filters */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black dark:bg-black dark:border-[#333] dark:text-white dark:focus:ring-white/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex items-center gap-2">
                        {["ALL", "DRAFT", "SENT", "ACCEPTED", "REJECTED"].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === status
                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-black dark:text-gray-400 dark:hover:bg-[#111]"
                                    }`}
                            >
                                {status === "ALL" ? "Tous" : getStatusBadge(status).props.children}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-black dark:border-[#333]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-[#333] dark:bg-black">
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Référence</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Client</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right dark:text-gray-400">Montant</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center dark:text-gray-400">Statut</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-[#333]">
                            {filteredQuotes.length > 0 ? (
                                filteredQuotes.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-gray-50 transition cursor-pointer dark:hover:bg-[#111]" onClick={() => handleEdit(quote)}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{quote.reference}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{quote.client.name}</span>
                                                {quote.client.companyName && <span className="text-xs text-gray-500 dark:text-gray-400">{quote.client.companyName}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(quote.issuedAt)}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right dark:text-gray-100">{formatCurrency(quote.total || quote.amount || 0)}</td>
                                        <td className="px-6 py-4 text-center">{getStatusBadge(quote.status)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <QuoteRowActions quote={quote} onEdit={handleEdit} onSend={handleSend} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                                        Aucun devis trouvé. Créez-en un nouveau !
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Drawer */}
            <QuoteDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onSave={handleSave}
                initialData={editingQuote}
                clients={clients}
                projects={projects}
            />
        </div>
    );
}
