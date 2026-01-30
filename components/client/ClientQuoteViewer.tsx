"use client";

import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Download, CheckCircle, X, Eye, FileText } from "lucide-react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import QuotePDF from "@/components/admin/quotes/QuotePDF"; // Reuse Admin PDF or create shared one
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";

type Props = {
    quote: any;
    user: any;
};

export default function ClientQuoteViewer({ quote, user }: Props) {
    const [status, setStatus] = useState(quote.status);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPDFModal, setShowPDFModal] = useState(false);
    const sigCanvas = useRef<any>(null);

    const { toasts, error, success, removeToast } = useToast();

    const handleSign = async () => {
        if (sigCanvas.current.isEmpty()) {
            error("Veuillez signer avant de valider.");
            return;
        }

        const signatureData = sigCanvas.current.toDataURL();
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/client/quotes/${quote.id}/sign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ signature: signatureData })
            });

            if (res.ok) {
                setStatus("ACCEPTED");
                success("Devis signé avec succès !");
                // Force reload to show signed state nicely
                setTimeout(() => window.location.reload(), 1500);
            } else {
                throw new Error("Erreur");
            }
        } catch (err) {
            console.error(err);
            error("Une erreur est survenue lors de la signature.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearSignature = () => {
        sigCanvas.current.clear();
    };

    return (
        <div className="min-h-screen bg-[#f8f6fb] p-6 lg:p-10 dark:bg-black">
            <Toast toasts={toasts} onRemove={removeToast} />
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden dark:bg-[#111] dark:border dark:border-[#333]">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 dark:border-[#333]">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400">Devis {quote.reference}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                status === 'SENT' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {status === 'ACCEPTED' ? 'Signé' : status === 'SENT' ? 'En attente' : status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">Émis le {new Date(quote.issuedAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <PDFDownloadLink
                            document={<QuotePDF quote={quote} />}
                            fileName={`devis-${quote.reference}.pdf`}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-xl font-medium transition dark:bg-[#222] dark:hover:bg-[#333] dark:text-white"
                        >
                            {/* @ts-ignore */}
                            {({ loading }) => (loading ? "Chargement..." : <><Download size={18} /> Télécharger PDF</>)}
                        </PDFDownloadLink>

                        <button
                            onClick={() => setShowPDFModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition dark:bg-[#111] dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#222]"
                        >
                            <Eye size={18} /> Visualiser PDF
                        </button>
                    </div>
                </div>

                {/* Content Preview (Simplified HTML View) */}
                <div className="p-8 bg-gray-50 dark:bg-[#1a1a1a]">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 min-h-[600px] dark:bg-black dark:border-[#333]">
                        {/* Invoice-like layout */}
                        <div className="flex justify-between mb-10">
                            <div>
                                <h2 className="font-bold text-xl mb-1 dark:text-white">OBEM STUDIO</h2>
                                <p className="text-sm text-gray-500">Agence Digitale</p>
                            </div>
                            <div className="text-right">
                                <h3 className="font-bold text-gray-900 dark:text-white">CLIENT</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{quote.client.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{quote.client.companyName}</p>
                            </div>
                        </div>

                        <table className="w-full mb-8">
                            <thead className="border-b border-gray-200 dark:border-[#333]">
                                <tr>
                                    <th className="text-left py-3 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Description</th>
                                    <th className="text-right py-3 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase w-20">Qté</th>
                                    <th className="text-right py-3 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase w-32">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[#333]">
                                {(() => {
                                    try {
                                        return JSON.parse(quote.items || "[]").map((item: any, i: number) => (
                                            <tr key={i}>
                                                <td className="py-4 text-sm text-gray-900 dark:text-white">{item.description}</td>
                                                <td className="py-4 text-sm text-gray-600 text-right dark:text-gray-400">{item.quantity}</td>
                                                <td className="py-4 text-sm font-medium text-gray-900 text-right dark:text-white">
                                                    {(item.total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                </td>
                                            </tr>
                                        ));
                                    } catch (e) { return null; }
                                })()}
                            </tbody>
                        </table>

                        <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Sous-total HT</span>
                                    <span className="font-medium dark:text-white">{(quote.subtotal || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">TVA ({(quote.taxRate || 0)}%)</span>
                                    <span className="font-medium dark:text-white">{(quote.taxAmount || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-black border-t border-gray-100 pt-2 dark:text-white dark:border-[#333]">
                                    <span>Total TTC</span>
                                    <span>{(quote.total || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-12 border-t border-gray-100 pt-8 dark:border-[#333]">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Signature et Validation</h4>
                                <button
                                    onClick={() => setShowTermsModal(true)}
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium dark:text-blue-400"
                                >
                                    <FileText size={16} />
                                    Voir les conditions du devis
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* OBEM STUDIO Signature Block - Simulation */}
                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-400 mb-4">Pour OBEM STUDIO :</p>
                                    <div className="h-32 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-center opacity-50 select-none dark:bg-[#111] dark:border-[#333]">
                                        <span className="text-2xl font-handwriting transform -rotate-6 text-gray-400">Obem Studio</span>
                                    </div>
                                    <p className="text-xs text-center text-gray-400 mt-2">Signé électroniquement</p>
                                </div>

                                {/* Client Signature Block */}
                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-400 mb-4">Pour le CLIENT :</p>

                                    {status === "ACCEPTED" || status === "SIGNED" ? (
                                        // ALREADY SIGNED VIEW
                                        <div className="relative h-32 border-2 border-green-500/20 bg-green-50/50 rounded-xl flex items-center justify-center overflow-hidden dark:bg-green-900/10 dark:border-green-500/30">
                                            {quote.signature ? (
                                                <img src={quote.signature} alt="Signature Client" className="h-full object-contain" />
                                            ) : (
                                                <span className="text-2xl font-handwriting transform -rotate-3 text-black dark:text-white">{quote.client.name}</span>
                                            )}

                                            <div className="absolute top-2 right-2 flex items-center gap-1 text-green-600 bg-white/90 px-2 py-1 rounded-md shadow-sm text-[10px] font-bold uppercase border border-green-100">
                                                <CheckCircle size={12} /> Signé le {new Date(quote.signedAt || Date.now()).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ) : (
                                        // SIGNATURE PAD VIEW
                                        <div className="space-y-3">
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 relative hover:border-black transition-colors overflow-hidden dark:bg-[#111] dark:border-[#333] dark:hover:border-white">
                                                <SignatureCanvas
                                                    ref={sigCanvas}
                                                    penColor="black"
                                                    canvasProps={{ className: "w-full h-32 cursor-crosshair" }}
                                                    backgroundColor="transparent"
                                                />
                                                <button
                                                    onClick={clearSignature}
                                                    className="absolute top-2 right-2 text-[10px] text-gray-400 hover:text-red-500 px-2 py-1 bg-white/80 rounded shadow-sm transition dark:bg-black/50"
                                                >
                                                    Effacer
                                                </button>
                                            </div>

                                            <div className="text-xs text-gray-500 mb-2">
                                                En signant ci-dessus, vous validez la commande d'un montant de {(quote.total || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} TTC.
                                            </div>

                                            <button
                                                onClick={handleSign}
                                                disabled={isSubmitting}
                                                className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg shadow-black/10 flex items-center justify-center gap-2 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                            >
                                                {isSubmitting ? "Validation en cours..." : "Valider et Signer le devis"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Terms Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden dark:bg-[#111] dark:border dark:border-[#333]">
                        <div className="p-6 border-b border-gray-100 dark:border-[#333] flex justify-between items-center">
                            <h3 className="font-bold text-lg dark:text-white">Conditions Générales</h3>
                            <button onClick={() => setShowTermsModal(false)}><X className="dark:text-white" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {(() => {
                                try {
                                    const terms = JSON.parse(quote.termsConfig || "[]");
                                    if (terms.length === 0) return <p className="text-gray-500">Aucune condition particulière.</p>;

                                    return terms.filter((s: any) => s.enabled).map((section: any, idx: number) => (
                                        <div key={idx} className="mb-6 last:mb-0">
                                            {section.title && <h4 className="font-bold text-gray-900 mb-2 dark:text-white">{section.title}</h4>}
                                            <p className="text-sm text-gray-600 whitespace-pre-wrap dark:text-gray-400">{section.content}</p>
                                        </div>
                                    ));
                                } catch (e) { return <p className="text-red-500">Erreur de chargement des conditions.</p>; }
                            })()}

                            {quote.notes && (
                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-[#333]">
                                    <h4 className="font-bold text-gray-900 mb-2 dark:text-white">Notes</h4>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap dark:text-gray-400">{quote.notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-[#333] bg-gray-50 dark:bg-[#1a1a1a]">
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition dark:bg-white dark:text-black"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PDF Preview Modal */}
            {showPDFModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col">
                        <div className="absolute top-4 right-4 z-10">
                            <button
                                onClick={() => setShowPDFModal(false)}
                                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 w-full h-full">
                            <PDFViewer width="100%" height="100%" className="w-full h-full border-0">
                                <QuotePDF quote={quote} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
