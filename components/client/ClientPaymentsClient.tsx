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
    isVirtual?: boolean;
    subscriptionId?: string;
    stripeSubscriptionId?: string | null;
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
    initialQuotes?: Quote[];
    userName?: string;
    userEmail?: string;
};

export default function ClientPaymentsClient({ initialPayments, initialQuotes = [], userName, userEmail }: Props) {
    const router = useRouter();
    const [view, setView] = useState<"PAYMENTS" | "QUOTES">("PAYMENTS");

    // Payment State
    const [activePaymentTab, setActivePaymentTab] = useState<"all" | "paid" | "overdue" | "cancelled">("all");
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const searchParams = useSearchParams();
    const { toasts, success, error, removeToast } = useToast();

    // Verify Stripe Session on Mount
    useEffect(() => {
        const sessionId = searchParams.get("session_id");
        const successParam = searchParams.get("success");
        const openId = searchParams.get("open");

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
                        router.replace("/dashboard/finances/paiements");
                    }
                } catch (e) {
                    console.error(e);
                    error("Erreur lors de la vérification du paiement");
                }
            };
            verifyPayment();
        } else if (searchParams.get("canceled")) {
            error("Le paiement a été annulé.");
        } else if (openId) {
            // Auto open payment drawer if 'open' param is present
            const payment = initialPayments.find(p => p.id === openId);
            if (payment) {
                setSelectedPayment(payment);
                setIsPaymentDrawerOpen(true);
            }
        }
    }, [searchParams, initialPayments]);

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

    const getStatusBadge = (status: string) => {
        const classNameBase = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";

        const paymentStyles: Record<string, string> = {
            PAID: "bg-black text-white dark:bg-white dark:text-black",
            PENDING: "bg-[#f3f4f6] text-[#6a6a6a] dark:bg-[#333] dark:text-gray-400",
            SCHEDULED: "bg-[#e5e7eb] text-[#374151] dark:bg-[#4a4a4a] dark:text-gray-200",
            OVERDUE: "bg-white border text-red-600 border-red-200 dark:bg-black dark:border-red-900 dark:text-red-400",
            FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            CANCELLED: "bg-gray-100 text-gray-500 dark:bg-[#222] dark:text-gray-500",
        };

        const style = paymentStyles[status] || "bg-gray-100 text-gray-600";

        let label = status;
        if (status === "PAID") label = "Payé";
        if (status === "PENDING") label = "En attente";
        if (status === "SCHEDULED") label = "À venir";
        if (status === "OVERDUE") label = "En retard";
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

    const handlePay = async (payment: Payment) => {
        setActionLoading(true);
        try {
            // Check if it's a subscription renewal (Virtual or Real Subscription Payment)
            if (payment.type === "SUBSCRIPTION" && payment.subscriptionId) {
                const res = await fetch(`/api/client/subscriptions/${payment.subscriptionId}/checkout`, { method: "POST" });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Erreur initialization");
                if (data.url) window.location.href = data.url;
                return;
            }

            // Normal Payment
            const res = await fetch(`/api/client/payments/${payment.id}/pay`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur initialization");
            if (data.url) window.location.href = data.url;
        } catch (e) {
            alert("Erreur: Impossible d'initier le paiement.");
        } finally {
            setActionLoading(false);
        }
    };

    // --- Drawers ---

    const openPaymentDrawer = (p: Payment) => { setSelectedPayment(p); setIsPaymentDrawerOpen(true); };

    return (
        <>
            <Toast toasts={toasts} onRemove={removeToast} />
            <Topbar title="Mes Paiements" userName={userName} userEmail={userEmail} />

            <main className="flex-1 px-4 md:px-8 py-6 bg-[#f8f6fb] dark:bg-black min-h-screen">

                {/* --- PAYMENTS VIEW --- */}
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
                                            <td className="px-6 py-4 text-sm text-[#2f2f2f] dark:text-white">
                                                {p.status === 'PAID' ? formatDate(p.paidAt || p.createdAt) : formatDate(p.dueDate || p.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-[#2f2f2f] dark:text-white flex items-center gap-2">
                                                {p.projectName}
                                                {p.type === "SUBSCRIPTION" && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                        Abonnement
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-[#2f2f2f] dark:text-white">{formatCurrency(p.amount, p.currency)}</td>
                                            <td className="px-6 py-4 text-center">{getStatusBadge(p.status)}</td>
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
                                <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
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
                            {/* Logic: Show Pay button ONLY if:
                                1. Payment is PENDING or OVERDUE (always payable)
                                2. Payment is SCHEDULED but valid ONLY if it's NOT an auto-debit Stripe subscription (i.e. starts with sub_)
                            */}
                            {(
                                (["PENDING", "OVERDUE"].includes(selectedPayment.status)) ||
                                (selectedPayment.status === "SCHEDULED" &&
                                    (!selectedPayment.stripeSubscriptionId || !selectedPayment.stripeSubscriptionId.startsWith("sub_")))
                            ) && (
                                    <button
                                        onClick={() => handlePay(selectedPayment)}
                                        disabled={actionLoading}
                                        className="cursor-pointer w-full rounded-full bg-black py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black"
                                    >
                                        {actionLoading ? "Chargement..." : "Régler maintenant"}
                                    </button>
                                )}

                            {/* Info message for auto-debit scheduled payments */}
                            {selectedPayment.status === "SCHEDULED" && selectedPayment.stripeSubscriptionId && selectedPayment.stripeSubscriptionId.startsWith("sub_") && (
                                <div className="p-3 bg-blue-50 text-blue-700 text-sm font-medium rounded-xl text-center dark:bg-blue-900/30 dark:text-blue-300">
                                    🔒 Prélèvement automatique prévu
                                </div>
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
