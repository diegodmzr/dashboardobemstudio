"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QuotePDF from "./QuotePDF";

export type QuoteLine = {
    id: string; // internal random id for key
    title: string; // Service/Item title
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    stripeAuto?: boolean;
};

export type QuoteFormData = {
    clientId: string;
    projectId?: string;
    issuedAt: string;
    validUntil?: string;
    items: QuoteLine[];
    notes?: string;
    terms?: string;
    subtotal: number;
    taxRate: number; // 0 or 20 usually
    taxAmount: number;
    total: number;
    status: string;
    termSections: TermSection[];

    // New Fields
    paymentType: string;
    isRecurring: boolean;
    // Manual Client Fields
    isManual?: boolean;
    manualClientInfo?: {
        name: string;
        email: string;
        companyName?: string;
        address?: string;
        phone?: string;
        siret?: string;
    };
};

export type TermSection = {
    id: string;
    title: string;
    content: string;
    enabled: boolean;
};

const TEMPLATES = {
    PROJECT: [
        { id: "delays", title: "DÉLAIS DE RÉALISATION", content: "2 à 3 semaines", enabled: true },
        { id: "payment", title: "MODALITÉS DE PAIEMENT", content: "Règlement du montant total en 4 échéances trimestrielles de 20 % : 20 % à la signature, puis 20 % à chaque trimestre suivant, soit un paiement échelonné sur 12 mois.", enabled: true },
        { id: "validity", title: "VALIDITÉ DU DEVIS", content: "14 jours", enabled: true },
        { id: "cancellation", title: "CONDITIONS D'ANNULATION ET DE MODIFICATION", content: "Une fois signé, toute annulation du devis entrainera des frais correspondant à 30% du montant total.\nEn cas de modification majeure du projet en cours, un avenant au devis sera soumis pour validation.\nTout retard de paiement supérieur à 15 jours entrainera des pénalités de 20% du montant dû.", enabled: true },
    ],
    MAINTENANCE: [
        { id: "intro", title: "", content: "Les demandes de modifications sont traitées sous 2 à 5 jours ouvrés, selon leur complexité et dans la limite du temps mensuel inclus.", enabled: true },
        { id: "details", title: "DETAILS DU FORFAIT", content: "• Le forfait est facturé à raison de 45 € par mois, pour une durée ferme de 12 mois.\n• Le paiement est effectué mensuellement, en début de mois.\n• Ce forfait inclut :\n  ◦ les modifications légères du site web,\n  ◦ l'hébergement et l'abonnement Webflow du site.", enabled: true },
        { id: "validity", title: "VALIDITÉ DU DEVIS", content: "14 jours", enabled: true },
        { id: "engagement", title: "DURÉE & ENGAGEMENT", content: "• Le présent forfait est conclu pour une durée ferme de 12 mois, à compter de la date de signature du devis.\n• Toute résiliation anticipée entraînera le paiement des mensualités restantes dues jusqu'à la fin de la période d'engagement.", enabled: true },
        { id: "cancellation", title: "CONDITIONS D'ANNULATION ET DE MODIFICATION", content: "• Une fois signé, le devis ne peut être annulé sans frais.\n• Toute demande de modification majeure ou hors périmètre du forfait fera l'objet d'un devis complémentaire.\n• Le temps d'intervention manuel non utilisé n'est pas reportable d'un mois sur l'autre.", enabled: true },
        { id: "late_payment", title: "RETARD DE PAIEMENT", content: "Tout retard de paiement supérieur à 15 jours entraînera des pénalités équivalentes à 20 % du montant dû, conformément à la législation en vigueur.", enabled: true },
    ]
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: QuoteFormData) => void;
    initialData?: any;
    clients: any[];
    projects: any[];
};

export default function QuoteDrawer({ isOpen, onClose, onSave, initialData, clients, projects }: Props) {
    const createDefaultLines = (): QuoteLine[] => [{ id: Math.random().toString(), title: "", description: "", quantity: 1, unitPrice: 0, total: 0, stripeAuto: false }];

    // State
    const [clientId, setClientId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [issuedAt, setIssuedAt] = useState(new Date().toISOString().split("T")[0]);
    const [validUntil, setValidUntil] = useState("");
    const [lines, setLines] = useState<QuoteLine[]>(createDefaultLines);

    // NEW: Discount state
    const [hasDiscount, setHasDiscount] = useState(false);
    const [discount, setDiscount] = useState(0);

    // Dynamic Terms
    const [termSections, setTermSections] = useState<TermSection[]>([]);

    // Legacy Fields
    const [notes, setNotes] = useState("");
    const [terms, setTerms] = useState("");

    const [taxRate, setTaxRate] = useState(0); // Default 0 (Auto-entrepreneur often) or 20
    const [status, setStatus] = useState("DRAFT");

    // Payment Config State
    const [paymentType, setPaymentType] = useState("ONESHOT");
    const [isRecurring, setIsRecurring] = useState(false);
    const [stripeAutoSend, setStripeAutoSend] = useState(false);

    // Manual Client State
    const [isManualClient, setIsManualClient] = useState(false);
    const [manualClientData, setManualClientData] = useState({
        name: "",
        email: "",
        companyName: "",
        address: "",
        phone: "",
        siret: ""
    });

    // Derived Calculations
    const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
    const discountAmount = hasDiscount ? subtotal * (discount / 100) : 0;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * (taxRate / 100);
    const total = subtotalAfterDiscount + taxAmount;

    // Reset or Load Data
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setClientId(initialData.clientId);
                setProjectId(initialData.projectId || "");
                setIssuedAt(initialData.issuedAt ? new Date(initialData.issuedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
                setValidUntil(initialData.validUntil ? new Date(initialData.validUntil).toISOString().split("T")[0] : "");

                try {
                    const parsedItems = JSON.parse(initialData.items || "[]");
                    if (Array.isArray(parsedItems) && parsedItems.length > 0) {
                        setLines(parsedItems.map((i: any) => ({ ...i, id: Math.random().toString() })));
                    } else {
                        setLines(createDefaultLines());
                    }
                } catch (e) { setLines(createDefaultLines()); }

                setNotes(initialData.notes || "");
                setTerms(initialData.terms || "");

                // Load Term Sections
                try {
                    if (initialData.termsConfig && initialData.termsConfig !== "[]") {
                        setTermSections(JSON.parse(initialData.termsConfig));
                    } else {
                        // Default fallback
                        setTermSections(JSON.parse(JSON.stringify(TEMPLATES.PROJECT)));
                    }
                } catch (e) {
                    setTermSections(JSON.parse(JSON.stringify(TEMPLATES.PROJECT)));
                }

                setTaxRate(initialData.taxRate || 0);
                setStatus(initialData.status);

                // Load Discount
                const savedDiscount = initialData.discount || 0;
                setDiscount(savedDiscount);
                setHasDiscount(savedDiscount > 0);

                setPaymentType(initialData.paymentType || "ONESHOT");
                setIsRecurring(initialData.isRecurring || false);
                setStripeAutoSend(initialData.stripeAutoSend || false);
            } else {
                // Reset for Create (With Defaults)
                setClientId("");
                setProjectId("");
                setIssuedAt(new Date().toISOString().split("T")[0]);
                setValidUntil("");
                setLines([{ id: Math.random().toString(), title: "", description: "", quantity: 1, unitPrice: 0, total: 0 }]);

                // Reset Discount
                setDiscount(0);
                setHasDiscount(false);

                // Default to Project Template for new quote
                setTermSections(JSON.parse(JSON.stringify(TEMPLATES.PROJECT)));

                setNotes("");
                setTerms("");

                setTaxRate(0);
                setStatus("DRAFT");

                setPaymentType("ONESHOT");
                setIsRecurring(false);
                setStripeAutoSend(false);
                setIsManualClient(false);
                setManualClientData({
                    name: "",
                    email: "",
                    companyName: "",
                    address: "",
                    phone: "",
                    siret: ""
                });
            }
        }
    }, [isOpen, initialData]);

    const handleLineChange = (id: string, field: keyof QuoteLine, value: any) => {
        setLines(prev => prev.map(line => {
            if (line.id !== id) return line;

            const updated = { ...line, [field]: value };
            // Auto calc total
            if (field === "quantity" || field === "unitPrice") {
                updated.total = Number(updated.quantity) * Number(updated.unitPrice);
            }
            return updated;
        }));
    };

    const addLine = () => {
        setLines([...lines, { id: Math.random().toString(), title: "", description: "", quantity: 1, unitPrice: 0, total: 0, stripeAuto: false }]);
    };

    const removeLine = (id: string) => {
        if (lines.length > 1) {
            setLines(lines.filter(l => l.id !== id));
        }
    };

    const handleSubmit = () => {
        if (!isManualClient && !clientId) return alert("Veuillez sélectionner un client.");
        if (isManualClient && (!manualClientData.email || !manualClientData.name)) return alert("Veuillez remplir au moins le nom et l'email du client.");

        onSave({
            clientId: isManualClient ? "" : clientId,
            isManual: isManualClient,
            manualClientInfo: isManualClient ? manualClientData : undefined,
            projectId: projectId || undefined,
            issuedAt,
            validUntil: validUntil || undefined,
            items: lines,
            notes,
            terms,
            subtotal,
            // SAVE DISCOUNT
            // @ts-ignore
            discount: hasDiscount ? discount : 0,
            taxRate,
            taxAmount,
            total,
            status,
            paymentType,
            isRecurring,
            stripeAutoSend,
            termSections: termSections.filter(s => s.enabled) // Send only enable? No send all so we can toggle later
        });
    };

    // Filter projects by client if selected
    const filteredProjects = clientId
        ? projects.filter(p => p.clientId === clientId)
        : projects;

    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) setIsClosing(false);
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300); // 300ms matches typical slide animation
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity duration-300 dark:bg-black/80 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fadeIn'}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto ${isClosing ? "animate-slideOutRight" : "animate-slideInRight"} dark:bg-black dark:shadow-none dark:ring-1 dark:ring-[#333]`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-6 flex items-center justify-between dark:bg-black dark:border-[#333]">
                    <div>
                        <h2 className="text-xl font-bold text-black dark:text-white">{initialData ? `Modifier ${initialData.reference}` : "Nouveau Devis"}</h2>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Remplissez les informations ci-dessous</p>
                    </div>
                    <button onClick={handleClose} className="rounded-full p-2 hover:bg-gray-100 transition dark:hover:bg-[#222]">✕</button>
                </div>

                {/* Form Content */}
                <div className="p-8 space-y-8">

                    {/* 1. Client & Dates */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Client</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsManualClient(!isManualClient);
                                        if (!isManualClient) setClientId("");
                                    }}
                                    className="text-xs font-semibold text-black underline dark:text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                >
                                    {isManualClient ? "Choisir un client existant" : "+ Créer / Saisie manuelle"}
                                </button>
                            </div>

                            {!isManualClient ? (
                                <select
                                    value={clientId}
                                    onChange={e => setClientId(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                >
                                    <option value="">Sélectionner un client...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} {c.companyName ? `(${c.companyName})` : ""}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="space-y-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 dark:bg-black dark:border-[#333]">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 sm:col-span-1">
                                            <input
                                                placeholder="Nom complet / Contact"
                                                value={manualClientData.name}
                                                onChange={e => setManualClientData({ ...manualClientData, name: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm outline-none focus:border-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                            />
                                            <span className="text-[10px] text-gray-400">Nom du contact</span>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <input
                                                placeholder="Email"
                                                value={manualClientData.email}
                                                onChange={e => setManualClientData({ ...manualClientData, email: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm outline-none focus:border-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                            />
                                            <span className="text-[10px] text-gray-400">Email (unique)</span>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <input
                                                placeholder="Nom de l'entreprise"
                                                value={manualClientData.companyName}
                                                onChange={e => setManualClientData({ ...manualClientData, companyName: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm outline-none focus:border-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                            />
                                            <span className="text-[10px] text-gray-400">Entreprise (Optionnel)</span>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <input
                                                placeholder="SIRET"
                                                value={manualClientData.siret}
                                                onChange={e => setManualClientData({ ...manualClientData, siret: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm outline-none focus:border-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                            />
                                            <span className="text-[10px] text-gray-400">SIRET (Optionnel)</span>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <input
                                                placeholder="Adresse"
                                                value={manualClientData.address}
                                                onChange={e => setManualClientData({ ...manualClientData, address: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm outline-none focus:border-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                            />
                                            <span className="text-[10px] text-gray-400">Adresse (Optionnel)</span>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <input
                                                placeholder="Téléphone"
                                                value={manualClientData.phone}
                                                onChange={e => setManualClientData({ ...manualClientData, phone: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm outline-none focus:border-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                            />
                                            <span className="text-[10px] text-gray-400">Téléphone (Optionnel)</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Projet (Optionnel)</label>
                            <select
                                value={projectId}
                                disabled={isManualClient}
                                onChange={e => setProjectId(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white disabled:opacity-50"
                            >
                                <option value="">Ne pas lier à un projet</option>
                                {!isManualClient && filteredProjects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Date d'émission</label>
                            <input
                                type="date"
                                value={issuedAt}
                                onChange={e => setIssuedAt(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Valide jusqu'au</label>
                            <input
                                type="date"
                                value={validUntil}
                                onChange={e => setValidUntil(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                            />
                        </div>
                    </div>

                    {/* 2. Items */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Prestations</h3>
                        </div>
                        <div className="space-y-3">
                            {lines.map((line, index) => (
                                <div key={line.id} className="flex gap-3 items-start p-3 rounded-xl border border-gray-100 bg-gray-50/50 group dark:bg-black dark:border-[#333]">
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <input
                                                placeholder="Titre de la prestation"
                                                value={line.title}
                                                onChange={e => handleLineChange(line.id, "title", e.target.value)}
                                                className="w-full bg-transparent border-0 border-b border-gray-100 px-0 py-1 text-sm font-bold focus:ring-0 focus:border-black placeholder:text-gray-300 dark:border-[#222] dark:text-white dark:placeholder:text-gray-600 dark:focus:border-white transition-colors"
                                            />
                                            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium dark:text-gray-600">Titre de la ligne</span>
                                        </div>
                                        <div>
                                            <textarea
                                                placeholder="Détails et description précise de la prestation..."
                                                value={line.description}
                                                onChange={e => handleLineChange(line.id, "description", e.target.value)}
                                                className="w-full bg-transparent border-0 border-b border-gray-100 px-0 py-1 text-xs text-gray-500 focus:ring-0 focus:border-black placeholder:text-gray-300 dark:border-[#222] dark:text-gray-400 dark:placeholder:text-gray-600 dark:focus:border-white resize-none transition-colors"
                                                rows={2}
                                            />
                                            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium dark:text-gray-600">Description détaillée (apparaîtra en plus fin)</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <input
                                                type="checkbox"
                                                id={`stripe-${line.id}`}
                                                checked={line.stripeAuto || false}
                                                onChange={e => handleLineChange(line.id, "stripeAuto", e.target.checked)}
                                                className="h-3 w-3 rounded border-gray-300 text-black focus:ring-black dark:bg-[#222] dark:border-[#444]"
                                            />
                                            <label htmlFor={`stripe-${line.id}`} className="text-[10px] text-gray-400 cursor-pointer select-none hover:text-black dark:hover:text-white transition-colors">Lier à un paiement Stripe automatique</label>
                                        </div>
                                    </div>
                                    <div className="w-20">
                                        <input
                                            type="number"
                                            min="0"
                                            value={line.quantity}
                                            onChange={e => handleLineChange(line.id, "quantity", parseFloat(e.target.value) || 0)}
                                            className="w-full bg-transparent border-0 border-b border-gray-200 px-0 py-1 text-sm text-center focus:ring-0 focus:border-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                        />
                                        <span className="text-[10px] text-gray-400 block text-center dark:text-gray-500">Qté</span>
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            min="0"
                                            value={line.unitPrice}
                                            onChange={e => handleLineChange(line.id, "unitPrice", parseFloat(e.target.value) || 0)}
                                            className="w-full bg-transparent border-0 border-b border-gray-200 px-0 py-1 text-sm text-right focus:ring-0 focus:border-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                        />
                                        <span className="text-[10px] text-gray-400 block text-right dark:text-gray-500">Prix.U HP</span>
                                    </div>
                                    <div className="w-24 pt-1 text-right font-medium text-sm dark:text-white">
                                        {(line.total).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                                    </div>
                                    <button
                                        onClick={() => removeLine(line.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition px-1 dark:text-gray-600 dark:hover:text-red-400"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addLine}
                                className="w-full py-2 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:text-black hover:border-black transition dark:border-[#333] dark:text-gray-500 dark:hover:text-white dark:hover:border-white"
                            >
                                + Ajouter une ligne
                            </button>
                        </div>
                    </div>

                    {/* 2.5 Payment Configuration */}
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 dark:bg-black dark:border-[#333]">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 dark:text-gray-500">Configuration Paiement</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type de Paiement</label>
                                <select
                                    value={paymentType}
                                    onChange={e => {
                                        setPaymentType(e.target.value);
                                        if (e.target.value === "RECURRING") setIsRecurring(true);
                                        else setIsRecurring(false);
                                    }}
                                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white"
                                >
                                    <option value="ONESHOT">Paiement Unique (One-Shot)</option>
                                    <option value="RECURRING">Récurrent (Abonnement)</option>
                                    <option value="SPLIT">Paiement Échelonné</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="stripeAuto"
                                    checked={stripeAutoSend}
                                    onChange={e => setStripeAutoSend(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black dark:bg-[#1a1a1a] dark:border-[#333]"
                                />
                                <label htmlFor="stripeAuto" className="text-sm text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                                    Envoi lien Stripe auto (par prestation)
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* 3. Totals */}
                    <div className="flex flex-col items-end space-y-2 border-t border-gray-100 pt-6 dark:border-[#333]">
                        <div className="flex justify-between w-48 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Sous-total HT</span>
                            <span className="font-medium dark:text-white">{subtotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
                        </div>

                        {/* DISCOUNT UI */}
                        <div className="flex justify-between w-48 text-sm items-center">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="hasDiscount"
                                    checked={hasDiscount}
                                    onChange={e => {
                                        setHasDiscount(e.target.checked);
                                        if (!e.target.checked) setDiscount(0);
                                    }}
                                    className="h-3 w-3 rounded border-gray-300 text-black focus:ring-black dark:bg-[#222] dark:border-[#444]"
                                />
                                <label htmlFor="hasDiscount" className="text-gray-500 dark:text-gray-400 select-none cursor-pointer">Réduction (%)</label>
                            </div>
                            {hasDiscount && (
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                                    className="w-16 bg-gray-50 rounded px-2 py-1 text-right text-xs border border-gray-200 dark:bg-black dark:border-[#333] dark:text-white"
                                    min="0"
                                    max="100"
                                />
                            )}
                        </div>
                        {hasDiscount && discount > 0 && (
                            <div className="flex justify-between w-48 text-sm text-green-600 dark:text-green-500">
                                <span>- Réduction</span>
                                <span>{discountAmount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
                            </div>
                        )}

                        <div className="flex justify-between w-48 text-sm items-center">
                            <span className="text-gray-500 dark:text-gray-400">TVA (%)</span>
                            <input
                                type="number"
                                value={taxRate}
                                onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                                className="w-16 bg-gray-50 rounded px-2 py-1 text-right text-xs border border-gray-200 dark:bg-black dark:border-[#333] dark:text-white"
                            />
                        </div>
                        <div className="flex justify-between w-48 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Montant TVA</span>
                            <span className="font-medium dark:text-white">{taxAmount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
                        </div>
                        <div className="flex justify-between w-48 text-base font-bold text-black pt-2 border-t border-gray-100 dark:border-[#333] dark:text-white">
                            <span>Total TTC</span>
                            <span>{total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
                        </div>
                    </div>

                    {/* 4. Dynamic Conditions & Templates */}
                    <div className="space-y-6 border-t border-gray-100 pt-6 dark:border-[#333]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Conditions Générales</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTermSections(JSON.parse(JSON.stringify(TEMPLATES.PROJECT)))}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-[#333] dark:hover:bg-[#222] transition dark:text-gray-300"
                                >
                                    Modèle Projet
                                </button>
                                <button
                                    onClick={() => setTermSections(JSON.parse(JSON.stringify(TEMPLATES.MAINTENANCE)))}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-[#333] dark:hover:bg-[#222] transition dark:text-gray-300"
                                >
                                    Modèle Maintenance
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {termSections.map((section, idx) => {
                                // Smart Input Renderers based on section ID
                                const renderContentInput = () => {
                                    // 1. VALIDITY (Number + "jours")
                                    if (section.id === "validity") {
                                        const daysMatch = section.content.match(/^(\d+)/);
                                        const days = daysMatch ? daysMatch[1] : "14";
                                        return (
                                            <div className="flex items-center gap-2 mt-1">
                                                <input
                                                    type="number"
                                                    value={days}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        const newSections = [...termSections];
                                                        newSections[idx].content = `${val} jours`;
                                                        setTermSections(newSections);
                                                    }}
                                                    className="w-20 bg-gray-50 border border-gray-200 rounded p-1 text-sm text-center dark:bg-[#222] dark:border-[#333] dark:text-white"
                                                />
                                                <span className="text-sm text-gray-500">jours</span>
                                            </div>
                                        );
                                    }

                                    // 2. DELAYS (Text input for value)
                                    if (section.id === "delays") {
                                        return (
                                            <div className="mt-1">
                                                <input
                                                    type="text"
                                                    value={section.content}
                                                    onChange={e => {
                                                        const newSections = [...termSections];
                                                        newSections[idx].content = e.target.value;
                                                        setTermSections(newSections);
                                                    }}
                                                    placeholder="ex: 2 à 3 semaines"
                                                    className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 text-sm dark:bg-[#222] dark:border-[#333] dark:text-white"
                                                />
                                            </div>
                                        );
                                    }

                                    // 3. MAINTENANCE DETAILS (Price & Duration)
                                    if (section.id === "details") {
                                        // Extract existing values or default
                                        const priceMatch = section.content.match(/(\d+)\s*€/);
                                        const durMatch = section.content.match(/durée ferme de\s*(\d+)/);

                                        const price = priceMatch ? priceMatch[1] : "45";
                                        const duration = durMatch ? durMatch[1] : "12";

                                        const updateDetails = (p: string, d: string) => {
                                            const newContent = `• Le forfait est facturé à raison de ${p} € par mois, pour une durée ferme de ${d} mois.\n• Le paiement est effectué mensuellement, en début de mois.\n• Ce forfait inclut :\n  ◦ les modifications légères du site web,\n  ◦ l'hébergement et l'abonnement Webflow du site.`;
                                            const newSections = [...termSections];
                                            newSections[idx].content = newContent;
                                            setTermSections(newSections);
                                        };

                                        return (
                                            <div className="flex gap-4 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 dark:bg-[#1a1a1a] dark:border-[#333]">
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">Prix mensuel (€)</label>
                                                    <input
                                                        type="number"
                                                        value={price}
                                                        onChange={e => updateDetails(e.target.value, duration)}
                                                        className="w-24 bg-white border border-gray-200 rounded p-1 text-sm dark:bg-[#222] dark:border-[#444] dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">Engagement (mois)</label>
                                                    <input
                                                        type="number"
                                                        value={duration}
                                                        onChange={e => updateDetails(price, e.target.value)}
                                                        className="w-24 bg-white border border-gray-200 rounded p-1 text-sm dark:bg-[#222] dark:border-[#444] dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }

                                    // 4. MAINTENANCE ENGAGEMENT (Updates duration in text)
                                    if (section.id === "engagement") {
                                        const durMatch = section.content.match(/durée ferme de\s*(\d+)/);
                                        const duration = durMatch ? durMatch[1] : "12";

                                        return (
                                            <div className="mt-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Durée ferme de</span>
                                                    <input
                                                        type="number"
                                                        value={duration}
                                                        onChange={e => {
                                                            const d = e.target.value;
                                                            const newContent = `• Le présent forfait est conclu pour une durée ferme de ${d} mois, à compter de la date de signature du devis.\n• Toute résiliation anticipée entraînera le paiement des mensualités restantes dues jusqu'à la fin de la période d'engagement.`;
                                                            const newSections = [...termSections];
                                                            newSections[idx].content = newContent;
                                                            setTermSections(newSections);
                                                        }}
                                                        className="w-16 bg-gray-50 border border-gray-200 rounded p-1 text-sm text-center dark:bg-[#222] dark:border-[#333] dark:text-white"
                                                    />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">mois.</span>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // DEFAULT: Textarea
                                    return (
                                        <textarea
                                            value={section.content}
                                            onChange={e => {
                                                const newSections = [...termSections];
                                                newSections[idx].content = e.target.value;
                                                setTermSections(newSections);
                                            }}
                                            className="w-full bg-transparent text-sm text-gray-600 outline-none resize-none h-auto min-h-[40px] mt-1 p-1 border border-transparent focus:border-gray-200 focus:bg-gray-50 rounded transition dark:text-gray-300 dark:focus:border-[#444] dark:focus:bg-[#222]"
                                            rows={(section.content.match(/\n/g) || []).length + 2}
                                        />
                                    );
                                };

                                return (
                                    <div key={idx} className={`relative p-4 rounded-xl border transition-all ${section.enabled ? 'border-gray-300 bg-white dark:border-[#444] dark:bg-[#111]' : 'border-gray-100 bg-gray-50 opacity-60 dark:border-[#222] dark:bg-[#0a0a0a]'}`}>
                                        <div className="flex items-start gap-3">
                                            <div className="pt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={section.enabled}
                                                    onChange={e => {
                                                        const newSections = [...termSections];
                                                        newSections[idx].enabled = e.target.checked;
                                                        setTermSections(newSections);
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black dark:border-gray-600 dark:bg-gray-700"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={section.title}
                                                    onChange={e => {
                                                        const newSections = [...termSections];
                                                        newSections[idx].title = e.target.value;
                                                        setTermSections(newSections);
                                                    }}
                                                    placeholder="Titre de la section"
                                                    className="w-full bg-transparent text-sm font-bold uppercase outline-none placeholder:text-gray-400 focus:text-black dark:text-white dark:focus:text-white"
                                                />
                                                {/* Render specific input based on type */}
                                                {renderContentInput()}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newSections = termSections.filter((_, i) => i !== idx);
                                                    setTermSections(newSections);
                                                }}
                                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            <button
                                onClick={() => setTermSections([...termSections, { id: Math.random().toString(), title: "NOUVELLE SECTION", content: "", enabled: true }])}
                                className="w-full py-2 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:text-black hover:border-black transition dark:border-[#333] dark:text-gray-500 dark:hover:text-white dark:hover:border-white"
                            >
                                + Ajouter une section
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Notes (Pied de page)</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition h-20 dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                placeholder="Conditions de livraison, pré-requis, etc."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex items-center justify-between dark:bg-black dark:border-[#333]">
                    <div className="flex items-center gap-2">
                        {status === "ACCEPTED" && initialData && (
                            <PDFDownloadLink
                                document={<QuotePDF quote={initialData} />}
                                fileName={`DEVIS-${initialData.reference}-SIGNE.pdf`}
                                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold uppercase hover:bg-green-100 transition border border-green-200"
                            >
                                {/* @ts-ignore */}
                                {({ loading }) => (loading ? "Chargement..." : <><Download size={14} /> Télécharger le PDF Signé</>)}
                            </PDFDownloadLink>
                        )}
                        {initialData && status !== "ACCEPTED" && (
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="bg-gray-50 border border-gray-200 rounded-lg text-sm px-3 py-2 dark:bg-black dark:border-[#333] dark:text-white"
                            >
                                <option value="DRAFT">Brouillon</option>
                                <option value="SENT">Envoyé</option>
                                <option value="ACCEPTED">Accepté</option>
                                <option value="REJECTED">Refusé</option>
                            </select>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleClose} className="px-6 py-2.5 rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#222]">
                            Annuler
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-800 transition shadow-lg shadow-black/20 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                            Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}
