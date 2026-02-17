"use client";

import { useState, useEffect } from "react";
import { X, CreditCard, Calendar, Clock, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

type Subscription = {
    id: string;
    status: string;
    amount: number;
    currency: string;
    interval: string;
    currentPeriodEnd: string;
    stripeSubscriptionId: string;
    createdAt: string;
    projectId?: string | null;
    startDate?: string;
    endDate?: string | null;
    commitmentEndDate?: string | null;
    project?: { name: string } | null;
    payments?: {
        id: string;
        amount: number;
        status: string;
        paidAt: string | null;
        invoiceUrl?: string;
    }[];
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    subscription: Subscription | null;
};

export default function ClientSubscriptionDetailModal({
    isOpen,
    onClose,
    subscription,
}: Props) {
    const [isClosing, setIsClosing] = useState(false);
    const [loadingPayment, setLoadingPayment] = useState(false);

    useEffect(() => {
        if (isOpen) setIsClosing(false);
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const handlePay = async () => {
        if (!subscription) return;
        setLoadingPayment(true);
        // Simulate payment link generation or alert for now
        // Ideally this would call an API that creates a Stripe Checkout Session for this subscription
        try {
            // For Manual Subscriptions, we need to generate a ONE-OFF or RECURRING checkout session dynamically
            const res = await fetch(`/api/client/subscriptions/${subscription.id}/checkout`, {
                method: "POST"
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Impossible de générer le lien de paiement. Veuillez contacter l'administrateur.");
            }
        } catch (e) {
            console.error(e);
            alert("Erreur lors de l'initialisation du paiement");
        } finally {
            setLoadingPayment(false);
        }
    };

    if (!isOpen || !subscription) return null;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);
    const formatDate = (d: string | null | undefined) =>
        d ? new Date(d).toLocaleDateString("fr-FR", { dateStyle: "long" }) : "—";

    // Status Logic
    const isPayable = subscription.status === "active" || subscription.status === "past_due" || subscription.status === "unpaid";
    // If it's pure "manual" creation without Stripe ID (starts with manual_), we treat it as needing payment setup.
    // If it has stripe ID (starts with sub_), it's already on Stripe, so we link to portal? Or simple payment?
    // If user clicked "Pay", they want to pay NOW.

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity duration-300 dark:bg-black/80 ${isClosing ? "opacity-0" : "opacity-100 animate-fadeIn"
                }`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto dark:bg-black dark:shadow-none dark:ring-1 dark:ring-[#333] ${isClosing ? "animate-slideOutRight" : "animate-slideInRight"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <button
                            onClick={handleClose}
                            className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition dark:bg-[#222] dark:hover:bg-[#333] dark:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Hero Amount */}
                    <div className="text-center py-4">
                        <div className="inline-block p-4 bg-gray-50 rounded-2xl mb-4 dark:bg-[#1a1a1a]">
                            <CreditCard className="w-8 h-8 text-black dark:text-white" />
                        </div>
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Montant de l'abonnement</h2>
                        <div className="text-5xl font-light text-black tracking-tight dark:text-white mb-2">
                            {formatCurrency(subscription.amount)}
                        </div>
                        <div className="text-gray-500 font-medium">
                            par {subscription.interval === "month" ? "mois" : subscription.interval === "quarter" ? "trimestre" : "an"}
                        </div>
                    </div>

                    {/* Status Banner */}
                    {/* Status Banner */}
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${subscription.status === "active" ? "bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:border-green-900/50" :
                        (subscription.status === "past_due" || subscription.status === "incomplete") ? "bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-900/20 dark:border-orange-900/50" :
                            "bg-gray-50 text-gray-700 border border-gray-100"
                        }`}>
                        {subscription.status === "active" ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <div>
                            <div className="font-bold text-sm uppercase">Statut : {subscription.status === "incomplete" ? "En attente d'activation" : subscription.status}</div>
                            {subscription.status === "active" && <div className="text-xs opacity-80">Votre abonnement est actif et à jour.</div>}
                            {subscription.status === "past_due" && <div className="text-xs opacity-80">Paiement en retard. Veuillez régulariser.</div>}
                            {subscription.status === "incomplete" && <div className="text-xs opacity-80">Veuillez activer le prélèvement pour démarrer l'abonnement.</div>}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-[#222]">
                        <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-gray-400" />
                            Détails du contrat
                        </h3>

                        <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-2xl dark:bg-[#111]">
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Date de début</div>
                                <div className="font-medium text-gray-900 dark:text-gray-200">{formatDate(subscription.startDate)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Prochaine échéance</div>
                                <div className="font-medium text-gray-900 dark:text-gray-200">{formatDate(subscription.currentPeriodEnd)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Durée</div>
                                <div className="font-medium text-gray-900 dark:text-gray-200">
                                    {subscription.endDate ? `Jusqu'au ${formatDate(subscription.endDate)}` : "Indéterminée"}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Projet lié</div>
                                <div className="font-medium text-gray-900 dark:text-gray-200 truncate">{subscription.project?.name || "Service / Maintenance"}</div>
                            </div>
                        </div>

                        {subscription.commitmentEndDate && (
                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-3 dark:bg-blue-900/10 dark:border-blue-900/30">
                                <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                                <div>
                                    <div className="text-xs font-bold text-blue-700 uppercase tracking-wide dark:text-blue-400">Engagement minimum</div>
                                    <div className="font-bold text-blue-900 dark:text-blue-200 mt-0.5">
                                        Paiements requis jusqu'au {formatDate(subscription.commitmentEndDate)}
                                    </div>
                                    <p className="text-[13px] text-blue-600/70 mt-1 leading-snug dark:text-blue-400/70">
                                        L'abonnement est souscrit pour une durée minimale ferme. Aucun arrêt n'est possible avant cette date.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment History */}
                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-[#222]">
                        <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            Historique des paiements
                        </h3>

                        {subscription.payments && subscription.payments.length > 0 ? (
                            <div className="space-y-3">
                                {subscription.payments.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white dark:bg-[#111] dark:border-[#222]">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className={`w-5 h-5 ${p.status === 'PAID' ? 'text-green-500' : 'text-gray-300'}`} />
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                    Paiement de {formatCurrency(p.amount)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {p.paidAt ? formatDate(p.paidAt) : "En attente"}
                                                </div>
                                            </div>
                                        </div>
                                        {p.invoiceUrl && (
                                            <a href={p.invoiceUrl} target="_blank" className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400">
                                                Facture →
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-gray-50 rounded-2xl dark:bg-[#111]">
                                <p className="text-sm text-gray-400 italic">Aucun historique de paiement disponible.</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="pt-6 mt-6 border-t border-gray-100 dark:border-[#222] space-y-3">
                        {(!subscription.stripeSubscriptionId || subscription.stripeSubscriptionId.startsWith("manual_")) && (
                            <>
                                <button
                                    onClick={handlePay}
                                    disabled={loadingPayment}
                                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                >
                                    {loadingPayment ? "Chargement..." : "Activer le prélèvement auto"}
                                    {!loadingPayment && <ArrowRight className="w-5 h-5" />}
                                </button>
                                <p className="text-center text-xs text-gray-400 max-w-xs mx-auto">
                                    En activant le prélèvement, vos factures seront débitées automatiquement chaque mois.
                                </p>
                            </>
                        )}

                        {subscription.stripeSubscriptionId && subscription.stripeSubscriptionId.startsWith("sub_") && (
                            <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100/50 text-center dark:bg-green-900/10 dark:border-green-900/30">
                                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                    ✓ Cet abonnement est <strong>payé automatiquement</strong> chaque mois via Stripe.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
