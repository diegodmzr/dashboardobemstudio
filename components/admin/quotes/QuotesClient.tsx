"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Topbar from "@/components/Topbar";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import QuoteDrawer, { QuoteFormData } from "./QuoteDrawer";
import QuoteRowActions from "./QuoteRowActions";
import SendQuoteModal from "./SendQuoteModal";
import { Search, Plus, Filter, ChevronRight, FileText, Calendar, Building2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
    const [sendModalOpen, setSendModalOpen] = useState(false);
    const [quoteToSend, setQuoteToSend] = useState<Quote | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const action = searchParams.get("action");
    const openId = searchParams.get("open");

    useEffect(() => {
        if (action === "create") setIsDrawerOpen(true);
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
            (q.client.companyName?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreate = () => { setEditingQuote(null); setIsDrawerOpen(true); };
    const handleEdit = (quote: Quote) => { setEditingQuote(quote); setIsDrawerOpen(true); };

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
            if (!res.ok) throw new Error("Erreur de sauvegarde");
            window.location.reload();
            success(isEdit ? "Devis mis à jour" : "Devis créé");
            setIsDrawerOpen(false);
        } catch (err) {
            error("Une erreur est survenue");
        }
    };

    const handleSend = (quote: Quote) => {
        setQuoteToSend(quote);
        setSendModalOpen(true);
    };

    const confirmSend = async () => {
        if (!quoteToSend) return;
        setIsSending(true);
        setSendError(null);
        try {
            const res = await fetch(`/api/quotes/${quoteToSend.id}/send`, { method: "POST" });
            const data = await res.json().catch(() => ({ error: "Erreur inconnue" }));

            if (res.ok) {
                setSendSuccess(true);
                // We'll reload when closing the modal if success
            } else {
                setSendError(data.error || "Erreur d'envoi");
            }
        } catch (err: any) {
            setSendError("Une erreur de communication est survenue.");
        } finally {
            setIsSending(false);
        }
    };

    const getStatusInfo = (status: string) => {
        const map: Record<string, { label: string, color: string, bg: string }> = {
            DRAFT: { label: "Brouillon", color: "text-gray-600", bg: "bg-gray-100 dark:bg-white/10" },
            SENT: { label: "Envoyé", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
            ACCEPTED: { label: "Accepté", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
            REJECTED: { label: "Refusé", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10" },
        };
        return map[status] || { label: status, color: "text-gray-500", bg: "bg-gray-50" };
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);
    const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' });

    return (
        <div className="flex flex-col h-full bg-[#fcfcfd] dark:bg-black">
            <Toast toasts={toasts} onRemove={removeToast} />
            <Topbar
                title="Devis"
                subtitle="Facturation et propositions"
                rightContent={
                    <button
                        onClick={handleCreate}
                        className="bg-black text-white px-6 py-2.5 rounded-2xl text-sm font-semibold hover:bg-zinc-800 transition-all shadow-lg active:scale-95 dark:bg-white dark:text-black flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nouveau devis</span>
                        <span className="sm:hidden">Nouveau</span>
                    </button>
                }
            />

            <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
                {/* Search & Mobile Filter Toggle */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-black dark:group-focus-within:text-white" />
                        <input
                            type="text"
                            placeholder="Rechercher par référence ou client..."
                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Horizontal Slide Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-1 px-1">
                        {["ALL", "DRAFT", "SENT", "ACCEPTED", "REJECTED"].map(status => {
                            const info = getStatusInfo(status);
                            const isActive = statusFilter === status;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={cn(
                                        "whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 active:scale-95",
                                        isActive
                                            ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                                            : "bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                    )}
                                >
                                    {status === "ALL" ? "Tous" : info.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile Grid List (Shown on < md) */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    <AnimatePresence mode="popLayout">
                        {filteredQuotes.map((quote) => {
                            const info = getStatusInfo(quote.status);
                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={quote.id}
                                    onClick={() => handleEdit(quote)}
                                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm active:bg-zinc-50 dark:active:bg-zinc-800/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#b2b2b2]">{quote.reference}</span>
                                            <h3 className="font-semibold text-zinc-900 dark:text-white">{quote.client.name}</h3>
                                        </div>
                                        <div className={cn("px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-tight", info.bg, info.color)}>
                                            {info.label}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#b2b2b2]">Montant</span>
                                            <span className="font-semibold text-zinc-900 dark:text-white">{formatCurrency(quote.total || 0)}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#b2b2b2]">Émis le</span>
                                            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">{formatDate(quote.issuedAt)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Desktop Table (Shown on >= md) */}
                <div className="hidden md:block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-white/5">
                                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Référence</th>
                                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Client</th>
                                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Date</th>
                                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 text-right">Montant</th>
                                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 text-center">Statut</th>
                                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {filteredQuotes.map((quote) => {
                                const info = getStatusInfo(quote.status);
                                return (
                                    <tr
                                        key={quote.id}
                                        className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                        onClick={() => handleEdit(quote)}
                                    >
                                        <td className="px-8 py-5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{quote.reference}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{quote.client.name}</span>
                                                {quote.client.companyName && <span className="text-xs text-zinc-400">{quote.client.companyName}</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-zinc-500">{formatDate(quote.issuedAt)}</td>
                                        <td className="px-8 py-5 text-sm font-semibold text-zinc-900 text-right dark:text-zinc-100">{formatCurrency(quote.total || 0)}</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={cn("px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-tight", info.bg, info.color)}>
                                                {info.label}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                            <QuoteRowActions quote={quote} onEdit={handleEdit} onSend={handleSend} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredQuotes.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                            <FileText className="w-8 h-8 text-zinc-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Aucun devis trouvé</h3>
                        <p className="text-sm text-zinc-500 max-w-xs mt-2">Affinez votre recherche ou créez un nouveau document.</p>
                    </div>
                )}
            </main>

            <QuoteDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onSave={handleSave}
                initialData={editingQuote}
                clients={clients}
                projects={projects}
            />

            <SendQuoteModal
                isOpen={sendModalOpen}
                onClose={() => {
                    if (sendSuccess) window.location.reload();
                    setSendModalOpen(false);
                    setQuoteToSend(null);
                    setSendSuccess(false);
                    setSendError(null);
                }}
                onConfirm={confirmSend}
                quoteReference={quoteToSend?.reference || ""}
                loading={isSending}
                isSuccess={sendSuccess}
                error={sendError}
            />
        </div>
    );
}
