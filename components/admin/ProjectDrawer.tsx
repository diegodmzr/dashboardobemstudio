"use client";

import { useEffect, useState } from "react";
import { AdminProject } from "./ProjectsAdminClient";
import ProgressBarEditor from "./ProgressBarEditor";
import { ProgressConfig } from "./StepProgressBar";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
};

type Quote = {
    id: string;
    reference: string;
    total: number;
    status: string;
    clientId: string;
    projectId?: string | null;
};

type Submission = {
    id: string;
    content: string;
    createdAt: string;
    form?: { title: string };
};

type Props = {
    isOpen: boolean;
    project?: AdminProject | null;
    onClose: () => void;
    onSave: (data: ProjectFormData) => Promise<void>;
};

export type ProjectFormData = {
    name: string;
    clientId: string | null;
    status: string;
    progress: number;
    amount: number;
    type: string;
    technology: string;
    paymentType: string;
    deadline: string;
    cpp: number | null;
    commission: number | null;
    attributes: string[];
    level: string;
    progressConfig?: ProgressConfig | null;
    formSubmissionId?: string | null;
    assigneeIds: string[];
    sitePrice?: number | null;
    maintenanceAmount?: number | null;
    maintenanceFrequency?: string | null;
    isAmountCustom?: boolean;
    customAmount?: number | null;
    quoteIds?: string[];
};

const statusOptions = ["Brief", "Design", "Dev", "Tests", "Livré"];
const typeOptions = ["E-commerce", "Landing page", "Vitrine"];
const technologyOptions = ["Shopify", "Webflow", "Natif", "Next.js", "React", "WordPress", "Laravel", "Django", "Ruby on Rails", "Vue.js", "Angular", "Flutter", "React Native", "Autre"];
const paymentTypeOptions = ["Étalé", "One shot", "Par étape", "Mensuel"];
const difficultyOptions = ["Facile", "Moyen", "Difficile"];

export default function ProjectDrawer({ isOpen, project, onClose, onSave }: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [availableQuotes, setAvailableQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [progressConfig, setProgressConfig] = useState<ProgressConfig | null>(null);
    const [isClosing, setIsClosing] = useState(false);

    const [formData, setFormData] = useState<ProjectFormData>({
        name: "",
        clientId: null,
        status: "Brief",
        progress: 0,
        amount: 0,
        type: "",
        technology: "",
        paymentType: "",
        deadline: "",
        cpp: null,
        commission: null,
        attributes: [],
        level: "",
        progressConfig: null,
        formSubmissionId: "",
        assigneeIds: [],
        sitePrice: null,
        maintenanceAmount: null,
        maintenanceFrequency: "",
        isAmountCustom: false,
        quoteIds: [],
    });

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            if (project) {
                setFormData({
                    name: project.name || "",
                    clientId: project.clientId || null,
                    status: project.status || "Brief",
                    progress: project.progress || 0,
                    amount: project.amount || 0,
                    type: project.type || "",
                    technology: project.technology || "",
                    paymentType: project.paymentType || "",
                    deadline: project.deadline ? project.deadline.split("T")[0] : "",
                    cpp: project.cpp || null,
                    commission: project.commission || null,
                    attributes: project.attributes || [],
                    level: project.level || "",
                    progressConfig: null,
                    formSubmissionId: project.formSubmissionId || "",
                    // @ts-ignore
                    assigneeIds: project.assignees ? project.assignees.map((a: any) => a.id) : [],
                    sitePrice: project.sitePrice || null,
                    maintenanceAmount: project.maintenanceAmount || null,
                    maintenanceFrequency: project.maintenanceFrequency || "",
                    isAmountCustom: project.isAmountCustom || false,
                    quoteIds: project.quotes ? project.quotes.map((q: any) => q.id) : [],
                });

                if (project.progressConfig) {
                    try {
                        const config = typeof project.progressConfig === 'string'
                            ? JSON.parse(project.progressConfig)
                            : project.progressConfig;
                        setProgressConfig(config);
                    } catch (error) {
                        console.error("Error parsing progressConfig:", error);
                    }
                } else {
                    setProgressConfig(null);
                }
            } else {
                setFormData({
                    name: "",
                    clientId: null,
                    status: "Brief",
                    progress: 0,
                    amount: 0,
                    type: "",
                    technology: "",
                    paymentType: "",
                    deadline: "",
                    cpp: null,
                    commission: null,
                    attributes: [],
                    level: "",
                    progressConfig: null,
                    formSubmissionId: "",
                    assigneeIds: [],
                    sitePrice: null,
                    maintenanceAmount: null,
                    maintenanceFrequency: "",
                    isAmountCustom: false,
                    quoteIds: [],
                });
                setProgressConfig(null);
            }
        }
    }, [isOpen, project]);

    useEffect(() => {
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setUsers(data);
            })
            .catch(console.error);

        fetch("/api/forms/submissions")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setSubmissions(data);
            })
            .catch(console.error);

        fetch("/api/quotes")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setAvailableQuotes(data);
            })
            .catch(console.error);
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = "Le nom du projet est requis";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        console.log("handleSubmit called");
        setError(null);

        if (!validate()) {
            console.log("Validation failed:", errors);
            setError("Veuillez remplir tous les champs requis");
            return;
        }

        setLoading(true);
        console.log("Submitting project data:", { ...formData, progressConfig });

        try {
            await onSave({ ...formData, progressConfig });
            console.log("Project saved successfully");
            handleClose();
        } catch (error: any) {
            console.error("Error saving project:", error);
            setError(error.message || "Une erreur est survenue lors de la création du projet");
        } finally {
            setLoading(false);
        }
    };

    const toggleAssignee = (userId: string) => {
        setFormData(prev => {
            const currentIds = prev.assigneeIds;
            if (currentIds.includes(userId)) {
                return { ...prev, assigneeIds: currentIds.filter(id => id !== userId) };
            } else {
                return { ...prev, assigneeIds: [...currentIds, userId] };
            }
        });
    };

    if (!isOpen && !isClosing) return null;

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
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            {project ? "Modifier le Projet" : "Nouveau Projet"}
                        </h2>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Remplissez les détails du projet</p>
                    </div>
                    <button onClick={handleClose} className="rounded-full p-2 hover:bg-gray-100 transition dark:hover:bg-[#222]">✕</button>
                </div>

                {/* Form Content */}
                <div className="p-8 space-y-8">
                    {/* Error Banner */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/20 dark:border-red-800">
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Basic Info Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Informations de base</h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Nom du projet *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full rounded-xl border ${errors.name ? "border-rose-500" : "border-gray-200"} px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white`}
                                    placeholder="Ex: Site e-commerce"
                                />
                                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Client</label>
                                <select
                                    value={formData.clientId || ""}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value || null })}
                                    className={`w-full rounded-xl border ${errors.clientId ? "border-rose-500" : "border-gray-200"} px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white`}
                                >
                                    <option value="">Aucun client (Temporaire)</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                                {errors.clientId && <p className="mt-1 text-xs text-rose-500">{errors.clientId}</p>}
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                                    Montant Global (€)
                                    <span className="ml-2 text-[10px] text-gray-400 font-normal">
                                        (Automatique si devis liés)
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        disabled={!formData.isAmountCustom && (formData.quoteIds?.length || 0) > 0}
                                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0, customAmount: parseFloat(e.target.value) || 0 })}
                                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition disabled:bg-gray-50 dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white dark:disabled:bg-[#111]"
                                    />
                                    {formData.quoteIds && formData.quoteIds.length > 0 && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="isAmountCustom"
                                                checked={formData.isAmountCustom}
                                                onChange={(e) => {
                                                    const isCustom = e.target.checked;
                                                    let amount = formData.amount;
                                                    if (!isCustom) {
                                                        const sum = availableQuotes
                                                            .filter(q => formData.quoteIds?.includes(q.id))
                                                            .reduce((acc, q) => acc + q.total, 0);
                                                        amount = sum;
                                                    }
                                                    setFormData({ ...formData, isAmountCustom: isCustom, amount });
                                                }}
                                                className="rounded border-gray-300 dark:border-[#333]"
                                            />
                                            <label htmlFor="isAmountCustom" className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                                                Utiliser un montant personnalisé
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Details Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Détails Financiers</h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">Devis liés</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {(formData.clientId
                                        ? availableQuotes.filter(q => q.clientId === formData.clientId || q.projectId === project?.id)
                                        : availableQuotes
                                    ).map(quote => {
                                        const isSelected = formData.quoteIds?.includes(quote.id);
                                        return (
                                            <button
                                                type="button"
                                                key={quote.id}
                                                onClick={() => {
                                                    const current = formData.quoteIds || [];
                                                    const next = isSelected
                                                        ? current.filter(id => id !== quote.id)
                                                        : [...current, quote.id];

                                                    let amount = formData.amount;
                                                    if (!formData.isAmountCustom) {
                                                        amount = availableQuotes
                                                            .filter(q => next.includes(q.id))
                                                            .reduce((acc, q) => acc + q.total, 0);
                                                    }

                                                    setFormData({ ...formData, quoteIds: next, amount });
                                                }}
                                                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-left transition ${isSelected
                                                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-[#111] dark:text-gray-300 dark:border-[#333]"
                                                    }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold">{quote.reference}</span>
                                                    <span className="text-[10px] opacity-70">
                                                        {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(quote.total)}
                                                    </span>
                                                </div>
                                                {isSelected && <span className="text-xs">✓</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                                {availableQuotes.length === 0 && (
                                    <p className="text-xs text-gray-400 italic">Aucun devis disponible pour ce client</p>
                                )}
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Prix du site (€)</label>
                                <input
                                    type="number"
                                    value={formData.sitePrice || ""}
                                    onChange={(e) => setFormData({ ...formData, sitePrice: e.target.value ? parseFloat(e.target.value) : null })}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                    placeholder="Ex: 1500"
                                />
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Montant Maintenance (€)</label>
                                <input
                                    type="number"
                                    value={formData.maintenanceAmount || ""}
                                    onChange={(e) => setFormData({ ...formData, maintenanceAmount: e.target.value ? parseFloat(e.target.value) : null })}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                    placeholder="Ex: 50"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Fréquence Maintenance</label>
                                <select
                                    value={formData.maintenanceFrequency || ""}
                                    onChange={(e) => setFormData({ ...formData, maintenanceFrequency: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="MONTHLY">Mensuel</option>
                                    <option value="QUARTERLY">Trimestriel</option>
                                    <option value="YEARLY">Annuel</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Attribution Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Attribution & Suivi</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">Équipe assignée</label>
                            <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50/50 dark:bg-black dark:border-[#333]">
                                {users.filter(u => u.role !== 'CLIENT').map(user => {
                                    const isSelected = formData.assigneeIds.includes(user.id);
                                    return (
                                        <button
                                            type="button"
                                            key={user.id}
                                            onClick={() => toggleAssignee(user.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${isSelected
                                                ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white text-white"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-[#111] dark:text-gray-300 dark:border-[#333]"
                                                }`}
                                        >
                                            <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-[9px] text-gray-500 dark:bg-gray-800">
                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                            </div>
                                            {user.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Lier un brief</label>
                            <select
                                value={formData.formSubmissionId || ""}
                                onChange={(e) => setFormData({ ...formData, formSubmissionId: e.target.value || null })}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                            >
                                <option value="">Aucun brief lié</option>
                                {submissions.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.form?.title || "Formulaire"} - {new Date(sub.createdAt).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Détails techniques</h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                >
                                    <option value="">Sélectionner...</option>
                                    {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Technologie</label>
                                <select
                                    value={formData.technology}
                                    onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                >
                                    <option value="">Sélectionner...</option>
                                    {technologyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Paiement</label>
                                <select
                                    value={formData.paymentType}
                                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                >
                                    <option value="">Sélectionner...</option>
                                    {paymentTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">Échéance</label>
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">Attributs (Tags)</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.attributes.map((attr, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200 dark:bg-[#111] dark:border-[#333] dark:text-gray-300">
                                        {attr}
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, attributes: prev.attributes.filter((_, idx) => idx !== i) }))} className="hover:text-red-500 font-bold">×</button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="tagInput"
                                    placeholder="Ajouter un tag..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = e.currentTarget.value.trim();
                                            if (val && !formData.attributes.includes(val)) {
                                                setFormData(prev => ({ ...prev, attributes: [...prev.attributes, val] }));
                                                e.currentTarget.value = '';
                                            }
                                        }
                                    }}
                                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const input = document.getElementById('tagInput') as HTMLInputElement;
                                        const val = input.value.trim();
                                        if (val && !formData.attributes.includes(val)) {
                                            setFormData(prev => ({ ...prev, attributes: [...prev.attributes, val] }));
                                            input.value = '';
                                        }
                                    }}
                                    className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition dark:bg-[#111] dark:text-white dark:hover:bg-[#222]"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Advanced & Progression */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Étapes & Progression</h3>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-3 sm:col-span-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Difficulté</label>
                                <select
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white"
                                >
                                    <option value="">-</option>
                                    {difficultyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="col-span-3 sm:col-span-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Commission (%)</label>
                                <input
                                    type="number"
                                    value={formData.commission || ""}
                                    onChange={(e) => setFormData({ ...formData, commission: e.target.value ? parseFloat(e.target.value) : null })}
                                    className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white"
                                />
                            </div>
                            <div className="col-span-3 sm:col-span-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Statut actuel</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white"
                                >
                                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 dark:bg-black dark:border-[#333]">
                            <ProgressBarEditor
                                initialConfig={progressConfig || undefined}
                                onChange={(config) => setProgressConfig(config)}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-end gap-3 dark:bg-black dark:border-[#333]">
                    <button
                        onClick={handleClose}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#222]"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-800 transition shadow-lg shadow-black/20 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        {loading ? "Chargement..." : project ? "Mettre à jour" : "Créer le projet"}
                    </button>
                </div>
            </div>
        </div>
    );
}
