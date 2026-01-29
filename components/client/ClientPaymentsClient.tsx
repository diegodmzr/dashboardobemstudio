"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";

// Types matching what we expect from the server
export type Payment = {
    id: string;
    projectId?: string | null;
    projectName: string;
    description: string;
    amount: number;
    currency: string;
    status: string;
    type: string;
    dueDate?: string | null;
    paidAt?: string | null;
    scheduledDate?: string | null;
    invoiceUrl?: string | null;
    method?: string | null;
    last4?: string | null;
    createdAt: string;
    stripeInvoiceId?: string | null;
    stripeReceiptUrl?: string | null;
};

export type Quote = {
    id: string;
    reference: string;
    projectName: string;
    issuedAt: string;
    validUntil?: string;
    total: number;
    status: string;
    pdfUrl?: string; // API URL to download PDF
    items?: string; // JSON string of items
};

type Props = {
    initialPayments: Payment[];
    initialQuotes: Quote[];
    userName?: string;
    userEmail?: string;
};

export default function ClientPaymentsClient({ initialPayments, initialQuotes, userName, userEmail }: Props) {
    const router = useRouter();
    const [view, setView] = useState<"PAYMENTS" | "QUOTES">("PAYMENTS");

    // Payment State
    const [activePaymentTab, setActivePaymentTab] = useState<"all" | "paid" | "overdue" | "cancelled">("all");
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);

    // Quote State
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const searchParams = useSearchParams();
    const { toasts, success, error, removeToast } = useToast();

    // Verify Stripe Session on Mount
    useEffect(() => {
        const sessionId = searchParams.get("session_id");
        const successParam = searchParams.get("success");

        if (successParam === "true" && sessionId) {
            const verifyPayment = async () => {
                try {
                    const res = await fetch("/api/client/payments/verify-session", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sessionId })
                    });
                    const data = await res.json();

                    if (data.success) {
                        success("Paiement validé avec succès !");
                        router.refresh();
                        // Clear params to avoid re-verify
                        router.replace("/dashboard/client/paiements");
                    } else {
                        // Don't show error if it's just not settled yet, but maybe valuable debugging
                        // error("Validation du paiement en attente...");
                    }
                } catch (e) {
                    console.error(e);
                    error("Erreur lors de la vérification du paiement");
                }
            };
            verifyPayment();
        } else if (searchParams.get("canceled")) {
            error("Le paiement a été annulé.");
        }
    }, [searchParams]);

    // --- Helpers ---

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatCurrency = (amount: number, currency = "EUR") => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: currency,
        }).format(amount);
    };

    const getStatusBadge = (status: string, type: "payment" | "quote") => {
        const classNameBase = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";

        const paymentStyles: Record<string, string> = {
            PAID: "bg-black text-white dark:bg-white dark:text-black",
            PENDING: "bg-[#f3f4f6] text-[#6a6a6a] dark:bg-[#333] dark:text-gray-400",
            SCHEDULED: "bg-[#e5e7eb] text-[#374151] dark:bg-[#4a4a4a] dark:text-gray-200",
            OVERDUE: "bg-white border text-red-600 border-red-200 dark:bg-black dark:border-red-900 dark:text-red-400",
            FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            CANCELLED: "bg-gray-100 text-gray-500 dark:bg-[#222] dark:text-gray-500",
        };

        const quoteStyles: Record<string, string> = {
            ACCEPTED: "bg-black text-white dark:bg-white dark:text-black",
            SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            DRAFT: "bg-gray-100 text-gray-500 border border-gray-200 dark:bg-[#222] dark:text-gray-500",
            REJECTED: "bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/10 dark:text-red-400",
        };

        const map = type === "payment" ? paymentStyles : quoteStyles;
        const style = map[status] || "bg-gray-100 text-gray-600";

        let label = status;
        if (status === "PAID") label = "Payé";
        if (status === "PENDING") label = "En attente";
        if (status === "OVERDUE") label = "En retard";
        if (status === "SENT") label = "Envoyé";
        if (status === "ACCEPTED") label = "Accepté";
        if (status === "REJECTED") label = "Refusé";
        if (status === "DRAFT") label = "Brouillon";

        return <span className={`${classNameBase} ${style}`}>{label}</span>;
    };

    // --- Filters ---

    const filteredPayments = initialPayments.filter((p) => {
        if (activePaymentTab === "all") return true;
        if (activePaymentTab === "paid") return p.status === "PAID";
        if (activePaymentTab === "overdue") return p.status === "OVERDUE";
        if (activePaymentTab === "cancelled") return ["CANCELLED", "FAILED"].includes(p.status);
        return true;
    });

    // --- Actions ---

    const handlePay = async (paymentId: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/client/payments/${paymentId}/pay`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur initialization");
            if (data.url) window.location.href = data.url;
        } catch (e) {
            alert("Erreur: Impossible d'initier le paiement.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleQuoteAction = async (id: string, action: "ACCEPTED" | "REJECTED") => {
        if (!confirm(action === "ACCEPTED" ? "Confirmer l'acceptation du devis ?" : "Refuser ce devis ?")) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/quotes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: action })
            });
            if (!res.ok) throw new Error("Erreur mise à jour devis");
            router.refresh();
            setIsQuoteDrawerOpen(false);
        } catch (e) {
            alert("Une erreur est survenue.");
        } finally {
            setActionLoading(false);
        }
    };

    // --- Drawers ---

    const openPaymentDrawer = (p: Payment) => { setSelectedPayment(p); setIsPaymentDrawerOpen(true); };
    const openQuoteDrawer = (q: Quote) => { setSelectedQuote(q); setIsQuoteDrawerOpen(true); };

    return (
        <>
            <Toast toasts={toasts} onRemove={removeToast} />
            <Topbar title="Mes Finances" userName={userName} userEmail={userEmail} />

            <main className="flex-1 px-4 md:px-8 py-6 bg-[#f8f6fb] dark:bg-black min-h-screen">

                {/* Main Tabs (Switch) */}
                <div className="mb-8 flex items-center justify-center">
                    <div className="relative flex rounded-full bg-white p-1 shadow-sm border border-[#e0e0e0] dark:bg-[#1a1a1a] dark:border-[#333]">
                        <button
                            onClick={() => setView("PAYMENTS")}
                            className={`cursor-pointer relative z-10 w-40 rounded-full py-2 text-sm font-semibold transition-colors ${view === "PAYMENTS" ? "text-white" : "text-[#6a6a6a] hover:text-[#2f2f2f] dark:text-gray-400 dark:hover:text-white"
                                }`}
                        >
                            Paiements
                        </button>
                        <button
                            onClick={() => setView("QUOTES")}
                            className={`cursor-pointer relative z-10 w-40 rounded-full py-2 text-sm font-semibold transition-colors ${view === "QUOTES" ? "text-white" : "text-[#6a6a6a] hover:text-[#2f2f2f] dark:text-gray-400 dark:hover:text-white"
                                }`}
                        >
                            Devis
                        </button>
                        {/* Sliding Background */}
                        <div
                            className={`absolute inset-y-1 rounded-full bg-black transition-transform duration-300 dark:bg-white ${view === "QUOTES" ? "translate-x-full" : "translate-x-0"
                                }`}
                            style={{ width: "50%" }}
                        />
                    </div>
                </div>

                {/* --- PAYMENTS VIEW --- */}
                {view === "PAYMENTS" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Sub filters */}
                        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                            {["all", "paid", "overdue", "cancelled"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActivePaymentTab(tab as any)}
                                    className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition whitespace-nowrap ${activePaymentTab === tab
                                        ? "bg-[#2f2f2f] text-white dark:bg-white dark:text-black"
                                        : "bg-white border border-[#e0e0e0] text-[#6a6a6a] hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400"
                                        }`}
                                >
                                    {tab === "all" ? "Tous" : tab === "paid" ? "Payés" : tab === "overdue" ? "En retard" : "Annulés"}
                                </button>
                            ))}
                        </div>

                        {filteredPayments.length === 0 ? (
                            <EmptyState label="Aucun paiement trouvé" subLabel="Tout est à jour de ce côté." />
                        ) : (
                            <div className="rounded-2xl border border-[#e0e0e0] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)] overflow-x-auto dark:bg-[#1a1a1a] dark:border-[#333]">
                                <table className="w-full">
                                    <thead className="bg-[#faf9fc] dark:bg-[#222]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">Projet</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">Montant</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">Statut</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e0e0e0] dark:divide-[#333]">
                                        {filteredPayments.map(p => (
                                            <tr key={p.id} onClick={() => openPaymentDrawer(p)} className="cursor-pointer hover:bg-gray-50 transition dark:hover:bg-[#222]">
                                                <td className="px-6 py-4 text-sm text-[#2f2f2f] dark:text-white">{formatDate(p.dueDate || p.createdAt)}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-[#2f2f2f] dark:text-white">{p.projectName}</td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-[#2f2f2f] dark:text-white">{formatCurrency(p.amount, p.currency)}</td>
                                                <td className="px-6 py-4 text-center">{getStatusBadge(p.status, "payment")}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">Détails →</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* --- QUOTES VIEW --- */}
                {view === "QUOTES" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {initialQuotes.length === 0 ? (
                            <EmptyState label="Aucun devis disponible" subLabel="Les devis que vous recevrez apparaîtront ici." />
                        ) : (
                            <div className="rounded-2xl border border-[#e0e0e0] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.04)] overflow-x-auto dark:bg-[#1a1a1a] dark:border-[#333]">
                                <table className="w-full">
                                    <thead className="bg-[#faf9fc] dark:bg-[#222]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">Référence</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">Projet</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">Total TTC</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">Statut</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e0e0e0] dark:divide-[#333]">
                                        {initialQuotes.map(q => (
                                            <tr key={q.id} onClick={() => openQuoteDrawer(q)} className="cursor-pointer hover:bg-gray-50 transition dark:hover:bg-[#222]">
                                                <td className="px-6 py-4 text-sm font-medium text-[#2f2f2f] dark:text-white">{q.reference}</td>
                                                <td className="px-6 py-4 text-sm text-[#6a6a6a] dark:text-gray-400">{formatDate(q.issuedAt)}</td>
                                                <td className="px-6 py-4 text-sm text-[#2f2f2f] dark:text-white">{q.projectName}</td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-[#2f2f2f] dark:text-white">{formatCurrency(q.total)}</td>
                                                <td className="px-6 py-4 text-center">{getStatusBadge(q.status, "quote")}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">Voir →</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* --- PAYMENT DRAWER --- */}
            {isPaymentDrawerOpen && selectedPayment && (
                <Drawer onClose={() => setIsPaymentDrawerOpen(false)} title="Détails du Paiement">
                    <div className="space-y-6">
                        <div>
                            <div className="text-xs font-bold uppercase text-[#8a8a8a] dark:text-gray-500">Projet</div>
                            <div className="text-lg font-semibold text-[#2f2f2f] dark:text-white">{selectedPayment.projectName}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs font-bold uppercase text-[#8a8a8a] dark:text-gray-500">Date</div>
                                <div className="text-sm dark:text-gray-300">{formatDate(selectedPayment.dueDate || selectedPayment.createdAt)}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase text-[#8a8a8a] dark:text-gray-500">Statut</div>
                                <div className="mt-1">{getStatusBadge(selectedPayment.status, "payment")}</div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl dark:bg-[#222]">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Montant total</span>
                                <span className="text-xl font-bold text-[#2f2f2f] dark:text-white">{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</span>
                            </div>
                            {selectedPayment.description && <p className="text-xs text-gray-500 mt-2 border-t pt-2 border-dashed border-gray-200 dark:border-gray-700">{selectedPayment.description}</p>}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 mt-8">
                            {["PENDING", "OVERDUE"].includes(selectedPayment.status) && (
                                <button
                                    onClick={() => handlePay(selectedPayment.id)}
                                    disabled={actionLoading}
                                    className="cursor-pointer w-full rounded-full bg-black py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black"
                                >
                                    {actionLoading ? "Chargement..." : "Régler maintenant"}
                                </button>
                            )}
                            {selectedPayment.invoiceUrl && (
                                <a
                                    href={selectedPayment.invoiceUrl}
                                    target="_blank"
                                    className="w-full items-center justify-center flex rounded-full border border-[#e0e0e0] bg-white py-3 text-sm font-bold text-[#4a4a4a] hover:bg-gray-50 dark:bg-[#333] dark:border-[#444] dark:text-white"
                                >
                                    Télécharger la facture
                                </a>
                            )}
                        </div>
                    </div>
                </Drawer>
            )}

            {/* --- QUOTE DRAWER --- */}
            {isQuoteDrawerOpen && selectedQuote && (
                <Drawer onClose={() => setIsQuoteDrawerOpen(false)} title={`Devis ${selectedQuote.reference}`}>
                    <div className="space-y-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-[#2f2f2f] dark:text-white">{selectedQuote.projectName}</h3>
                                    <p className="text-xs text-gray-500">Émis le {formatDate(selectedQuote.issuedAt)}</p>
                                </div>
                                {getStatusBadge(selectedQuote.status, "quote")}
                            </div>
                        </div>

                        {/* Lines */}
                        <div className="border rounded-xl border-[#e0e0e0] overflow-hidden dark:border-[#333]">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-[#222]">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">Description</th>
                                        <th className="px-4 py-2 text-right font-semibold text-gray-600 dark:text-gray-400">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-[#333]">
                                    {(() => {
                                        try {
                                            const items = JSON.parse(selectedQuote.items || "[]");
                                            return items.map((item: any, i: number) => (
                                                <tr key={i}>
                                                    <td className="px-4 py-2 dark:text-gray-300">
                                                        <div className="font-medium">{item.description}</div>
                                                        {item.quantity > 1 && <div className="text-xs text-gray-500">{item.quantity} x {formatCurrency(item.unitPrice)}</div>}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-medium dark:text-gray-300">{formatCurrency(item.total)}</td>
                                                </tr>
                                            ));
                                        } catch (e) { return <tr><td colSpan={2} className="p-4 text-center text-gray-500">Détails indisponibles</td></tr>; }
                                    })()}
                                </tbody>
                            </table>
                            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center dark:bg-[#222] dark:border-[#333]">
                                <span className="font-bold text-[#2f2f2f] dark:text-white">Total TTC</span>
                                <span className="text-lg font-bold text-[#2f2f2f] dark:text-white">{formatCurrency(selectedQuote.total)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 mt-8">
                            {selectedQuote.status === "SENT" && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleQuoteAction(selectedQuote.id, "ACCEPTED")}
                                        disabled={actionLoading}
                                        className="rounded-full bg-black py-3 text-sm font-bold text-white hover:bg-gray-800 dark:bg-white dark:text-black"
                                    >
                                        Accepter
                                    </button>
                                    <button
                                        onClick={() => handleQuoteAction(selectedQuote.id, "REJECTED")}
                                        disabled={actionLoading}
                                        className="rounded-full border border-red-200 bg-white py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:bg-[#222] dark:border-red-900 dark:text-red-400"
                                    >
                                        Refuser
                                    </button>
                                </div>
                            )}
                            {selectedQuote.pdfUrl && (
                                <a
                                    href={selectedQuote.pdfUrl}
                                    target="_blank"
                                    className="w-full items-center justify-center flex rounded-full border border-[#e0e0e0] bg-white py-3 text-sm font-bold text-[#4a4a4a] hover:bg-gray-50 dark:bg-[#333] dark:border-[#444] dark:text-white"
                                >
                                    📄 Télécharger le PDF
                                </a>
                            )}
                        </div>
                    </div>
                </Drawer>
            )}
        </>
    );
}

// Simple Drawer Component
function Drawer({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title: string }) {
    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl animate-in slide-in-from-right duration-300 dark:bg-[#111]">
                <div className="flex items-center justify-between border-b border-[#e0e0e0] px-6 py-4 dark:border-[#333]">
                    <h2 className="text-lg font-bold text-[#2f2f2f] dark:text-white">{title}</h2>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-[#222]">
                        <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </>
    );
}

function EmptyState({ label, subLabel }: { label: string, subLabel: string }) {
    return (
        <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#f1eff3] dark:bg-[#222]">
                <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="mb-1 text-lg font-bold text-[#2f2f2f] dark:text-white">{label}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{subLabel}</p>
        </div>
    );
}
