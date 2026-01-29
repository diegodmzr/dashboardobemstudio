"use client";

import { useState, useEffect } from "react";
import { X, CreditCard } from "lucide-react";

type Subscription = {
    id: string;
    status: string;
    amount: number;
    currency: string;
    interval: string;
    currentPeriodEnd: string;
    stripeSubscriptionId: string;
    client: { id: string; name: string; companyName: string | null; email: string };
    projectId?: string | null;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    subscription: Subscription | null;
    onCancel: (id: string) => void;
    clients: any[];
    projects: any[];
};

export default function SubscriptionDrawer({
    isOpen,
    onClose,
    subscription,
    onCancel,
    clients,
    projects,
}: Props) {
    const [isClosing, setIsClosing] = useState(false);
    const [clientId, setClientId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [priceId, setPriceId] = useState("");

    useEffect(() => {
        if (isOpen) setIsClosing(false);
        if (!subscription) {
            setClientId("");
            setProjectId("");
            setPriceId("");
        }
    }, [isOpen, subscription]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);
    const formatDate = (d: string | null) =>
        d ? new Date(d).toLocaleDateString("fr-FR", { dateStyle: "long" }) : "—";

    const handleCreateSubscription = async () => {
        if (!clientId || !priceId) return alert("Veuillez sélectionner un client et un produit.");

        try {
            const res = await fetch("/api/subscriptions/create-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId, priceId, projectId }),
            });

            const data = await res.json();
            if (data.url) {
                await navigator.clipboard.writeText(data.url);
                alert("✅ Lien d'abonnement copié dans le presse-papier !\n\nEnvoyez-le au client.");
            } else {
                alert("❌ Erreur lors de la génération du lien");
            }
        } catch (err) {
            console.error(err);
            alert("❌ Erreur réseau");
        }
    };

    if (!isOpen) return null;

    // View Mode (Details)
    if (subscription) {
        const project = projects.find((p) => p.id === subscription.projectId);

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
                        <div className="flex justify-between items-start">
                            <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
                                Détails de l'Abonnement
                            </h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition dark:hover:text-white dark:hover:bg-[#222]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Amount Hero */}
                        <div className="text-center py-6 border-b border-gray-100 dark:border-[#333]">
                            <div className="text-5xl font-light text-black tracking-tight dark:text-white">
                                {formatCurrency(subscription.amount)}
                            </div>
                            <div className="text-gray-500 text-sm mt-2">
                                par {subscription.interval === "month" ? "mois" : "an"}
                            </div>
                            <div
                                className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-4 uppercase tracking-wide ${subscription.status === "active"
                                    ? "bg-green-100 text-green-600"
                                    : subscription.status === "canceled"
                                        ? "bg-gray-100 text-gray-500"
                                        : "bg-orange-100 text-orange-600"
                                    }`}
                            >
                                {subscription.status}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                                    Client
                                </h3>
                                <div className="font-medium text-lg text-black dark:text-gray-100">{subscription.client.name}</div>
                                <div className="text-gray-500 text-sm">{subscription.client.companyName}</div>
                                <div className="text-gray-400 text-sm">{subscription.client.email}</div>
                            </div>

                            {project && (
                                <div>
                                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                                        Projet lié
                                    </h3>
                                    <div className="font-medium text-blue-600">{project.name}</div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                                        Prochaine Facturation
                                    </h3>
                                    <div className="text-black dark:text-white">
                                        {subscription.status === "active"
                                            ? formatDate(subscription.currentPeriodEnd)
                                            : "—"}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                                        Périodicité
                                    </h3>
                                    <div className="text-black dark:text-white">
                                        {subscription.interval === "month" ? "Mensuel" : "Annuel"}
                                    </div>
                                </div>
                            </div>

                            {/* Stripe Info */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 dark:bg-black dark:border-[#333]">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                                    Stripe
                                </h3>
                                <div className="text-xs text-mono text-gray-600 truncate mb-2">
                                    ID: {subscription.stripeSubscriptionId}
                                </div>
                                <a
                                    href={`https://dashboard.stripe.com/test/subscriptions/${subscription.stripeSubscriptionId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-blue-600 hover:underline"
                                >
                                    Voir dans Stripe Dashboard ↗
                                </a>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 border-t border-gray-100 flex flex-col gap-3 dark:border-[#333]">
                            {subscription.status === "active" && (
                                <button
                                    onClick={() => onCancel(subscription.id)}
                                    className="w-full bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition shadow-lg shadow-red-500/20"
                                >
                                    Annuler l'abonnement
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Create Mode
    return (
        <div
            className={`fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100 animate-fadeIn"
                }`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto dark:bg-black dark:shadow-none dark:ring-1 dark:ring-[#333] ${isClosing ? "animate-slideOutRight" : "animate-slideInRight"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 space-y-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-black dark:text-white">Nouvel abonnement</h2>
                            <p className="text-sm text-gray-400">
                                Créer un lien de paiement récurrent pour un client
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="rounded-full p-2 hover:bg-gray-100 transition dark:hover:bg-[#222]"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                            <select
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-black transition"
                            >
                                <option value="">Sélectionner un client...</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Projet (Optionnel)
                            </label>
                            <select
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                            >
                                <option value="">Aucun projet lié</option>
                                {projects
                                    .filter((p) => !clientId || p.clientId === clientId)
                                    .map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Produit Stripe (Price ID)
                            </label>
                            <input
                                type="text"
                                placeholder="price_xxxxx"
                                value={priceId}
                                onChange={(e) => setPriceId(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm font-mono outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Récupérez le Price ID depuis votre{" "}
                                <a
                                    href="https://dashboard.stripe.com/test/products"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    Stripe Dashboard
                                </a>
                            </p>
                        </div>

                        <button
                            onClick={handleCreateSubscription}
                            className="w-full bg-[#635BFF] text-white py-3.5 rounded-full font-bold hover:bg-[#5145E5] transition shadow-lg shadow-[#635BFF]/20 mt-8 flex items-center justify-center gap-2"
                        >
                            <CreditCard className="w-4 h-4" />
                            <span>Générer le lien d'abonnement</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
