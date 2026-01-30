"use client";

import { useState, useEffect } from "react";
import { X, CreditCard, Calendar, Check, Layers } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";

type Subscription = {
    id: string;
    status: string;
    amount: number;
    currency: string;
    interval: string;
    currentPeriodEnd: string | null;
    stripeSubscriptionId: string | null;
    client: { id: string; name: string; companyName: string | null; email: string };
    projectId?: string | null;
    startDate: string;
    endDate?: string | null;
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
    const { toasts, success, error, removeToast } = useToast();

    // Form state
    const [creationMode, setCreationMode] = useState<"MANUAL" | "STRIPE">("MANUAL");
    const [clientId, setClientId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [amount, setAmount] = useState("");
    const [interval, setInterval] = useState("month");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [durationMonths, setDurationMonths] = useState<number | "">(""); // Empty for indefinite
    const [commitmentMonths, setCommitmentMonths] = useState<number | "">(""); // Empty for no commitment
    const [priceId, setPriceId] = useState(""); // For Stripe mode

    useEffect(() => {
        if (isOpen) setIsClosing(false);
        if (!subscription) {
            // Reset form
            setClientId("");
            setProjectId("");
            setAmount("");
            setInterval("month");
            setStartDate(new Date().toISOString().split('T')[0]);
            setDurationMonths("");
            setCommitmentMonths("");
            setPriceId("");
            setCreationMode("MANUAL");
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
        if (!clientId) return error("Veuillez sélectionner un client.");

        try {
            if (creationMode === "STRIPE") {
                if (!priceId) return error("Veuillez entrer un Price ID Stripe.");
                const res = await fetch("/api/subscriptions/create-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ clientId, priceId, projectId }),
                });
                const data = await res.json();
                if (data.url) {
                    await navigator.clipboard.writeText(data.url);
                    success("Lien d'abonnement copié !");
                }
            } else {
                // MANUAL CREATION
                if (!amount) return error("Veuillez entrer un montant.");

                const res = await fetch("/api/subscriptions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        clientId,
                        projectId,
                        amount: parseFloat(amount),
                        interval,
                        startDate,
                        durationMonths: durationMonths === "" ? null : Number(durationMonths),
                        commitmentMonths: commitmentMonths === "" ? null : Number(commitmentMonths)
                    }),
                });

                if (res.ok) {
                    success("Abonnement créé avec succès !");
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    throw new Error("Erreur création");
                }
            }
        } catch (err) {
            console.error(err);
            error("Une erreur est survenue.");
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
                <Toast toasts={toasts} onRemove={removeToast} />
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
                                        Début
                                    </h3>
                                    <div className="text-black dark:text-white">
                                        {formatDate(subscription.startDate)}
                                    </div>
                                </div>
                                {subscription.endDate && (
                                    <div>
                                        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                                            Fin prévue
                                        </h3>
                                        <div className="text-black dark:text-white">
                                            {formatDate(subscription.endDate)}
                                        </div>
                                    </div>
                                )}
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
                            </div>

                            {/* Stripe Info */}
                            {subscription.stripeSubscriptionId && (
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
                            )}
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
            <Toast toasts={toasts} onRemove={removeToast} />
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
                                Créer un contrat ou un abonnement récurrent
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="rounded-full p-2 hover:bg-gray-100 transition dark:hover:bg-[#222]"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl mb-6 dark:bg-[#1a1a1a]">
                        <button
                            onClick={() => setCreationMode("MANUAL")}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${creationMode === "MANUAL"
                                ? "bg-white text-black shadow-sm dark:bg-[#333] dark:text-white"
                                : "text-gray-500 hover:text-black dark:text-gray-400"
                                }`}
                        >
                            Manuel / Dashboard
                        </button>
                        <button
                            onClick={() => setCreationMode("STRIPE")}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${creationMode === "STRIPE"
                                ? "bg-white text-black shadow-sm dark:bg-[#333] dark:text-white"
                                : "text-gray-500 hover:text-black dark:text-gray-400"
                                }`}
                        >
                            Via Stripe Link
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Client</label>
                            <select
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
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

                        {creationMode === "MANUAL" ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                        Montant (€)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="ex: 1000"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                            Récurrence
                                        </label>
                                        <select
                                            value={interval}
                                            onChange={(e) => setInterval(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                        >
                                            <option value="month">Mensuel</option>
                                            <option value="year">Annuel</option>
                                            <option value="quarter">Trimestriel</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                            Date de début
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                        Durée du contrat
                                    </label>
                                    <div className="flex gap-4 items-center">
                                        <select
                                            value={durationMonths === "" ? "indefinite" : "fixed"}
                                            onChange={(e) => setDurationMonths(e.target.value === "indefinite" ? "" : 12)}
                                            className="w-1/2 rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                        >
                                            <option value="indefinite">Indéterminée (Sans fin)</option>
                                            <option value="fixed">Durée fixe</option>
                                        </select>
                                        {durationMonths !== "" && (
                                            <div className="flex-1 flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={durationMonths}
                                                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                                                    className="w-20 rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                                />
                                                <span className="text-sm text-gray-500">mois</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 leading-tight">
                                        Définit quand le service s'arrête automatiquement (ex: 12 mois). Si "Indéterminée", l'abonnement continue tant qu'il n'est pas résilié.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                        Engagement (Optionnel)
                                    </label>
                                    <div className="flex gap-4 items-center">
                                        <select
                                            value={commitmentMonths === "" ? "none" : "months"}
                                            onChange={(e) => setCommitmentMonths(e.target.value === "none" ? "" : 12)}
                                            className="w-1/2 rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                        >
                                            <option value="none">Sans engagement</option>
                                            <option value="months">Avec engagement</option>
                                        </select>
                                        {commitmentMonths !== "" && (
                                            <div className="flex-1 flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={commitmentMonths}
                                                    onChange={(e) => setCommitmentMonths(Number(e.target.value))}
                                                    className="w-20 rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                                />
                                                <span className="text-sm text-gray-500">mois</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 leading-tight">
                                        Période minimale durant laquelle le client ne peut pas résilier. (ex: Engagement 12 mois sur un contrat à durée indéterminée).
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
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
                                    Récupérez le Price ID depuis votre Dashboard Stripe.
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleCreateSubscription}
                            className="w-full bg-black text-white py-3.5 rounded-full font-bold hover:bg-gray-800 transition shadow-lg shadow-black/20 mt-8 flex items-center justify-center gap-2 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                            {creationMode === "STRIPE" ? (
                                <>
                                    <CreditCard className="w-4 h-4" />
                                    <span>Générer le lien Stripe</span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span>Créer l'abonnement</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
