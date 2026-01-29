"use client";

import { useState } from "react";
import Topbar from "@/components/Topbar";
import { useRouter } from "next/navigation";
import { pdf } from '@react-pdf/renderer';
import QuotePDF from "@/components/admin/quotes/QuotePDF";
import { Download, Loader2, Eye } from "lucide-react";

type Quote = {
    id: string;
    reference: string;
    projectId?: string;
    projectName?: string; // Optional if we fetch it
    status: string;
    total: number;
    issuedAt: string;
    validUntil?: string;
    pdfUrl?: string;
    items?: any[];
};

type Props = {
    initialQuotes: Quote[];
    userName?: string;
    userEmail?: string;
};

export default function ClientQuotesClient({ initialQuotes, userName, userEmail }: Props) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "signed" | "rejected">("all");
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    // Filter quotes
    const filteredQuotes = initialQuotes.filter((quote) => {
        if (activeTab === "all") return true;
        if (activeTab === "pending") return ["SENT", "PENDING"].includes(quote.status);
        if (activeTab === "signed") return ["ACCEPTED", "SIGNED"].includes(quote.status);
        if (activeTab === "rejected") return ["REJECTED", "REFUSED", "EXPIRED"].includes(quote.status);
        return true;
    });

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
        }).format(price);
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; className: string }> = {
            DRAFT: {
                label: "Brouillon",
                className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
            },
            SENT: {
                label: "En attente",
                className: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
            },
            PENDING: {
                label: "En attente",
                className: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
            },
            ACCEPTED: {
                label: "Signé",
                className: "bg-black text-white dark:bg-white dark:text-black",
            },
            SIGNED: {
                label: "Signé",
                className: "bg-black text-white dark:bg-white dark:text-black",
            },
            REJECTED: {
                label: "Refusé",
                className: "bg-gray-400 text-white dark:bg-gray-500",
            },
            REFUSED: {
                label: "Refusé",
                className: "bg-gray-400 text-white dark:bg-gray-500",
            },
            EXPIRED: {
                label: "Expiré",
                className: "bg-gray-300 text-gray-700 dark:bg-gray-600",
            },
        };

        const badge = badges[status] || badges.SENT;

        return (
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                {badge.label}
            </span>
        );
    };

    const handleDownloadPDF = async (quote: Quote, e: React.MouseEvent) => {
        e.stopPropagation();
        if (downloadingId) return;

        setDownloadingId(quote.id);
        try {
            const blob = await pdf(<QuotePDF quote={quote} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `DEVIS-${quote.reference}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF Error", error);
            alert("Impossible de générer le PDF");
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <>
            <Topbar title="Mes Devis" userName={userName} userEmail={userEmail} />

            <main className="flex-1 px-8 py-6 bg-[#f8f6fb] dark:bg-black">
                {/* Tabs */}
                <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`cursor-pointer whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-semibold transition ${activeTab === "all"
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-white border border-[#ece7ef] text-[#6a6a6a] hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#222]"
                            }`}
                    >
                        Tous
                    </button>
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`cursor-pointer whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-semibold transition ${activeTab === "pending"
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-white border border-[#ece7ef] text-[#6a6a6a] hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#222]"
                            }`}
                    >
                        En attente
                    </button>
                    <button
                        onClick={() => setActiveTab("signed")}
                        className={`cursor-pointer whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-semibold transition ${activeTab === "signed"
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-white border border-[#ece7ef] text-[#6a6a6a] hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#222]"
                            }`}
                    >
                        Signés
                    </button>
                    <button
                        onClick={() => setActiveTab("rejected")}
                        className={`cursor-pointer whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-semibold transition ${activeTab === "rejected"
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-white border border-[#ece7ef] text-[#6a6a6a] hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#222]"
                            }`}
                    >
                        Refusés
                    </button>
                </div>

                {/* Table */}
                {filteredQuotes.length === 0 ? (
                    <div className="mt-20 flex flex-col items-center justify-center">
                        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#f8f6fb] to-[#ece7ef] dark:from-[#333] dark:to-[#222]">
                            <svg className="h-16 w-16 text-[#8a8a8a] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-[#2f2f2f] dark:text-white">
                            Aucun devis trouvé
                        </h3>
                        <p className="text-sm text-[#6a6a6a] dark:text-gray-400">
                            Vous n'avez pas encore de devis dans cette catégorie
                        </p>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-[#ece7ef] bg-white shadow-sm dark:bg-[#1a1a1a] dark:border-[#333]">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#ece7ef] dark:border-[#333]">
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#6a6a6a] dark:text-gray-400">
                                            Référence
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#6a6a6a] dark:text-gray-400">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#6a6a6a] dark:text-gray-400">
                                            Projet
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#6a6a6a] dark:text-gray-400">
                                            Montant TTC
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[#6a6a6a] dark:text-gray-400">
                                            Statut
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#6a6a6a] dark:text-gray-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#ece7ef] dark:divide-[#333]">
                                    {filteredQuotes.map((quote) => (
                                        <tr
                                            key={quote.id}
                                            className="transition hover:bg-[#f8f6fb] dark:hover:bg-[#222] cursor-pointer"
                                            onClick={() => router.push(`/dashboard/client/devis/${quote.id}`)}
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-[#2f2f2f] dark:text-white">
                                                {quote.reference}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#6a6a6a] dark:text-gray-400">
                                                {formatDate(quote.issuedAt)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#2f2f2f] dark:text-white">
                                                {quote.projectName || "Projet standard"}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-[#2f2f2f] dark:text-white">
                                                {formatPrice(quote.total)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(quote.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => router.push(`/dashboard/client/devis/${quote.id}`)}
                                                        className="flex items-center justify-center rounded-full border border-[#ece7ef] bg-white h-8 w-8 text-[#6a6a6a] transition hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#222]"
                                                        title="Voir le devis"
                                                    >
                                                        <Eye size={14} />
                                                    </button>

                                                    {["SENT", "PENDING"].includes(quote.status) && (
                                                        <button
                                                            onClick={() => router.push(`/dashboard/client/devis/${quote.id}`)}
                                                            className="cursor-pointer rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                                        >
                                                            ✍️ Signer
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={(e) => handleDownloadPDF(quote, e)}
                                                        disabled={downloadingId === quote.id}
                                                        className="flex items-center gap-1 rounded-full border border-[#ece7ef] bg-white px-4 py-2 text-xs font-semibold text-[#6a6a6a] transition hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#222]"
                                                    >
                                                        {downloadingId === quote.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                                        <span>PDF</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
