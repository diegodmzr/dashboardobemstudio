"use client";

import { useState, useEffect } from "react";
import { X, CreditCard } from "lucide-react";

type Payment = {
    id: string;
    amount: number;
    description?: string | null;
    status: string;
    method: string | null;
    client: { id: string, name: string; companyName: string | null; email: string };
    createdAt: string;
    dueDate: string | null;
    paidAt: string | null;
    stripePaymentId: string | null;
    invoiceUrl: string | null;
    projectId?: string | null;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    payment: Payment | null;
    onSave: (data: any) => void;
    onRemind: (id: string) => void;
    clients: any[];
    projects: any[];
};

export default function PaymentDrawer({ isOpen, onClose, payment, onSave, onRemind, clients, projects }: Props) {
    const [isClosing, setIsClosing] = useState(false);

    // Form State (for creation)
    const [clientId, setClientId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState<number>(0);
    const [dueDate, setDueDate] = useState("");
    const [method, setMethod] = useState("MANUAL");

    useEffect(() => {
        if (isOpen) setIsClosing(false);
        // Reset form
        if (!payment) {
            setClientId("");
            setProjectId("");
            setDescription("");
            setAmount(0);
            setDueDate(new Date().toISOString().split("T")[0]);
            setMethod("MANUAL");
        }
    }, [isOpen, payment]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);
    const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("fr-FR", { dateStyle: 'long' }) : "—";


    const handleSubmit = () => {
        if (!clientId) return alert("Veuillez sélectionner un client.");
        if (amount <= 0) return alert("Montant invalide.");

        onSave({
            clientId,
            projectId: projectId || undefined,
            description: description || undefined,
            amount,
            dueDate,
            method,
            status: "PENDING"
        });
    };

    if (!isOpen) return null;

    // View Mode (Details)
    if (payment) {
        const project = projects.find(p => p.id === payment.projectId);

        return (
            <div
                className={`fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity duration-300 dark:bg-black/80 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fadeIn'}`}
                onClick={handleClose}
            >
                <div
                    className={`w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto ${isClosing ? "animate-slideOutRight" : "animate-slideInRight"} dark:bg-[#111] dark:shadow-none dark:ring-1 dark:ring-[#333]`}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-8 space-y-8">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider dark:text-gray-500">Détails du Paiement</h2>
                            <button onClick={handleClose} className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition dark:hover:text-white dark:hover:bg-[#222]">✕</button>
                        </div>

                        {/* Amount Hero */}
                        <div className="text-center py-6 border-b border-gray-100 dark:border-[#333]">
                            <div className="text-5xl font-light text-black tracking-tight dark:text-white">{formatCurrency(payment.amount)}</div>
                            {payment.description && <div className="text-sm text-gray-500 mt-2 dark:text-gray-400">{payment.description}</div>}
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-4 uppercase tracking-wide
                                ${payment.status === 'PAID' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : ''}
                                ${payment.status === 'PENDING' ? 'bg-gray-100 text-gray-500 dark:bg-[#222] dark:text-gray-400' : ''}
                                ${payment.status === 'LATE' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : ''}
                             `}>
                                {payment.status}
                            </div>
                        </div>

                        {/* Details List */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 dark:text-gray-500">Client</h3>
                                <div className="font-medium text-lg text-black dark:text-white">{payment.client.name}</div>
                                <div className="text-gray-500 text-sm dark:text-gray-400">{payment.client.companyName}</div>
                                <div className="text-gray-400 text-sm dark:text-gray-500">{payment.client.email}</div>
                            </div>

                            {project && (
                                <div>
                                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 dark:text-gray-500">Projet lié</h3>
                                    <div className="font-medium text-blue-600 dark:text-blue-400">{project.name}</div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1 dark:text-gray-500">Date</h3>
                                    <div className="text-black dark:text-white">{formatDate(payment.status === 'PAID' ? payment.paidAt : payment.dueDate)}</div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1 dark:text-gray-500">Méthode</h3>
                                    <div className="text-black dark:text-white">{payment.method || 'Inconnue'}</div>
                                </div>
                            </div>

                            {/* Stripe Info */}
                            {payment.stripePaymentId && (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 dark:bg-[#1a1a1a] dark:border-[#333]">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2 dark:text-gray-400">
                                        Stripe
                                    </h3>
                                    <div className="text-xs text-mono text-gray-600 truncate mb-2 dark:text-gray-400">ID: {payment.stripePaymentId}</div>
                                    {payment.invoiceUrl && (
                                        <a href={payment.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400">
                                            Voir la facture Stripe ↗
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Actions Footer */}
                        <div className="pt-6 border-t border-gray-100 flex flex-col gap-3 dark:border-[#333]">
                            {/* Generate Stripe Link Button */}
                            {payment.status === 'PENDING' && (
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch('/api/payments/create-session', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ paymentId: payment.id })
                                            });
                                            const data = await res.json();
                                            if (data.url) {
                                                await navigator.clipboard.writeText(data.url);
                                                alert('✅ Lien de paiement copié dans le presse-papier !\n\nVous pouvez l\'envoyer au client.');
                                            } else {
                                                alert('❌ Erreur lors de la génération du lien');
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            alert('❌ Erreur réseau');
                                        }
                                    }}
                                    className="w-full bg-[#635BFF] text-white py-3 rounded-xl font-medium hover:bg-[#5145E5] transition shadow-lg shadow-[#635BFF]/20 flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    <span>Générer un lien de paiement Stripe</span>
                                </button>
                            )}

                            {(payment.status === 'LATE' || payment.status === 'PENDING') && (
                                <button
                                    onClick={() => onRemind(payment.id)}
                                    className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition shadow-lg shadow-black/10 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                >
                                    Envoyer une relance par email
                                </button>
                            )}
                            {/* Placeholder for Mark as Paid if Manual */}
                            {payment.method === 'MANUAL' && payment.status === 'PENDING' && (
                                <button className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition shadow-lg shadow-green-500/20">
                                    Marquer comme payé
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
            className={`fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity duration-300 dark:bg-black/80 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fadeIn'}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto ${isClosing ? "animate-slideOutRight" : "animate-slideInRight"} dark:bg-[#111] dark:shadow-none dark:ring-1 dark:ring-[#333]`}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-8 space-y-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-black dark:text-white">Nouveau paiement</h2>
                            <p className="text-sm text-gray-400 dark:text-gray-500">Enregistrer un paiement manuel</p>
                        </div>
                        <button onClick={handleClose} className="rounded-full p-2 hover:bg-gray-100 transition dark:hover:bg-[#222] dark:text-gray-400">✕</button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Client</label>
                            <select
                                value={clientId}
                                onChange={e => setClientId(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            >
                                <option value="">Sélectionner un client...</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Projet (Optionnel)</label>
                            <select
                                value={projectId}
                                onChange={e => setProjectId(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            >
                                <option value="">Aucun projet lié</option>
                                {projects.filter(p => !clientId || p.clientId === clientId).map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Ex: Acompte 30% Site Web"
                                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Montant (€)</label>
                            <input
                                type="number"
                                min="0"
                                value={amount}
                                onChange={e => setAmount(parseFloat(e.target.value))}
                                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-lg font-mono outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Date d'échéance</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Méthode</label>
                            <select
                                value={method}
                                onChange={e => setMethod(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            >
                                <option value="MANUAL">Espèces / Chèque</option>
                                <option value="TRANSFER">Virement Bancaire</option>
                            </select>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-black text-white py-3.5 rounded-full font-bold hover:bg-gray-800 transition shadow-lg shadow-black/20 mt-8 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                            Enregistrer le paiement
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
