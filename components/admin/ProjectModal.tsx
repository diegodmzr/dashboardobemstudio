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
};

type Props = {
    project?: AdminProject | null;
    onClose: () => void;
    onSave: (data: ProjectFormData) => Promise<void>;
};

export type ProjectFormData = {
    name: string;
    clientId: string;
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
};

const statusOptions = ["Brief", "Design", "Dev", "Tests", "Livré"];
const typeOptions = ["E-commerce", "Landing page", "Vitrine"];
const technologyOptions = ["Shopify", "Webflow", "Natif", "Next.js", "React", "WordPress", "Laravel", "Django", "Ruby on Rails", "Vue.js", "Angular", "Flutter", "React Native", "Autre"];
const paymentTypeOptions = ["Étalé", "One shot", "Par étape", "Mensuel"];
const difficultyOptions = ["Facile", "Moyen", "Difficile"];

export default function ProjectModal({ project, onClose, onSave }: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [progressConfig, setProgressConfig] = useState<ProgressConfig | null>(null);
    const [formData, setFormData] = useState<ProjectFormData>({
        name: project?.name || "",
        clientId: project?.clientId || "",
        status: project?.status || "Brief",
        progress: project?.progress || 0,
        amount: project?.amount || 0,
        type: project?.type || "",
        technology: project?.technology || "",
        paymentType: project?.paymentType || "",
        deadline: project?.deadline ? project.deadline.split("T")[0] : "",
        cpp: project?.cpp || null,
        commission: project?.commission || null,
        attributes: project?.attributes || [],
        level: project?.level || "", // Keep as 'level' for DB compatibility
        progressConfig: null,
        formSubmissionId: project?.formSubmissionId || "",
        // @ts-ignore
        assigneeIds: project?.assignees ? project.assignees.map((a: any) => a.id) : [],
    });

    useEffect(() => {
        // Fetch users
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch((err) => console.error("Error fetching users:", err));

        // Fetch submissions
        fetch("/api/forms/submissions")
            .then((res) => res.json())
            .then((data) => setSubmissions(data))
            .catch((err) => console.error("Error fetching submissions:", err));

        // Load existing progressConfig if editing
        if (project?.progressConfig) {
            try {
                const config = typeof project.progressConfig === 'string'
                    ? JSON.parse(project.progressConfig)
                    : project.progressConfig;
                setProgressConfig(config);
            } catch (error) {
                console.error("Error parsing progressConfig:", error);
            }
        }
    }, [project]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Le nom du projet est requis";
        }
        if (!formData.clientId) {
            newErrors.clientId = "Veuillez sélectionner un client";
        }
        if (formData.amount < 0) {
            newErrors.amount = "Le montant doit être positif";
        }
        if (formData.progress < 0 || formData.progress > 100) {
            newErrors.progress = "La progression doit être entre 0 et 100";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            // Include progressConfig in formData
            const dataToSave = {
                ...formData,
                progressConfig,
            };
            await onSave(dataToSave);
            onClose();
        } catch (error) {
            console.error("Error saving project:", error);
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

    // Filter potential admins (exclude the selected client if possible, or just show all except pure 'CLIENT' maybe? 
    // Usually admin role check is better but since roles are loose, I'll show all users but highlight roles)
    // For now, list all users as potential assignees.

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl animate-scaleIn dark:bg-[#111]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#2f2f2f] dark:text-white">
                        {project ? "Modifier le projet" : "Nouveau projet"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 rounded-full bg-[#f5f5f5] text-lg font-semibold text-[#2f2f2f] transition hover:bg-[#e0e0e0] dark:bg-[#1a1a1a] dark:text-gray-400 dark:hover:bg-[#222]"
                        aria-label="Fermer"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-400">
                                Nom du projet <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full rounded-xl border ${errors.name ? "border-rose-500" : "border-[#e0e0e0] dark:border-[#333]"
                                    } bg-[#f5f5f5] px-4 py-3 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-[#1a1a1a] dark:text-white dark:focus:border-white dark:focus:ring-white/20`}
                                placeholder="Ex: Site e-commerce"
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-400">
                                Client <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                className={`w-full rounded-xl border ${errors.clientId ? "border-rose-500" : "border-[#e0e0e0] dark:border-[#333]"
                                    } bg-[#f5f5f5] px-4 py-3 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-[#1a1a1a] dark:text-white dark:focus:border-white dark:focus:ring-white/20`}
                            >
                                <option value="">Sélectionner un client</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                            {errors.clientId && (
                                <p className="mt-1 text-xs text-rose-500">{errors.clientId}</p>
                            )}
                        </div>

                        {/* Assignees Selection */}
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-400">
                                Attribué à (Admins / Staff)
                            </label>
                            <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-[#e0e0e0] bg-[#f5f5f5] dark:bg-[#1a1a1a] dark:border-[#333]">
                                {users.filter(u => u.role !== 'CLIENT').length === 0 && <p className="text-xs text-gray-400">Aucun admin disponible.</p>}
                                {users.filter(u => u.role !== 'CLIENT').map(user => {
                                    const isSelected = formData.assigneeIds.includes(user.id);
                                    return (
                                        <button
                                            type="button"
                                            key={user.id}
                                            onClick={() => toggleAssignee(user.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${isSelected
                                                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-[#222] dark:text-gray-300 dark:border-[#444]"
                                                }`}
                                        >
                                            {/* Avatar if available else Initials */}
                                            {/* We don't have avatar URL here easily unless we fetch it, assuming users has it */}
                                            <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-[9px] text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                                                {/* @ts-ignore */}
                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                            </div>
                                            {user.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Link to Brief/Form */}
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-400">
                                Lier à un brief (Formulaire)
                            </label>
                            <select
                                value={formData.formSubmissionId || ""}
                                onChange={(e) => setFormData({ ...formData, formSubmissionId: e.target.value || null })}
                                className="w-full rounded-xl border border-[#e0e0e0] bg-[#f5f5f5] px-4 py-3 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white/20"
                            >
                                <option value="">Aucun brief lié</option>
                                {submissions.map((sub) => {
                                    let preview = "";
                                    try {
                                        const parsed = JSON.parse(sub.content);
                                        preview = Object.values(parsed).slice(0, 1).join(" - ");
                                    } catch (e) { }
                                    return (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.form?.title || "Formulaire"} - {preview || sub.id} - {new Date(sub.createdAt).toLocaleDateString()}
                                        </option>
                                    );
                                })}
                            </select>
                            <p className="mt-1 text-xs text-gray-400">Optionnel : relier ce projet à une réponse de formulaire reçue.</p>
                        </div>
                    </div>

                    {/* Status and Amount */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-400">
                                Statut (Étape actuelle)
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full rounded-xl border border-[#e0e0e0] bg-[#f5f5f5] px-4 py-3 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white/20"
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-400">
                                Montant (€)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) =>
                                    setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                                }
                                className={`w-full rounded-xl border ${errors.amount ? "border-rose-500" : "border-[#e0e0e0] dark:border-[#333]"
                                    } bg-[#f5f5f5] px-4 py-3 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-[#1a1a1a] dark:text-white dark:focus:border-white dark:focus:ring-white/20`}
                            />
                            {errors.amount && (
                                <p className="mt-1 text-xs text-rose-500">{errors.amount}</p>
                            )}
                        </div>
                    </div>

                    {/* Project Details */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-400">
                                Type de projet
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full rounded-xl border border-[#e0e0e0] bg-[#f5f5f5] px-4 py-3 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white/20"
                            >
                                <option value="">Sélectionner un type</option>
                                {typeOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-400">
                                Technologie
                            </label>
                            <select
                                value={formData.technology}
                                onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                                className="w-full rounded-xl border border-[#e0e0e0] bg-[#f5f5f5] px-4 py-3 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white/20"
                            >
                                <option value="">Sélectionner une technologie</option>
                                {technologyOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Payment and Deadline */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-400">
                                Type de paiement
                            </label>
                            <select
                                value={formData.paymentType}
                                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                                className="w-full rounded-xl border border-[#e0e0e0] bg-[#f5f5f5] px-4 py-3 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white/20"
                            >
                                <option value="">Sélectionner un type</option>
                                {paymentTypeOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-400">
                                Échéance
                            </label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className="w-full rounded-xl border border-[#e0e0e0] bg-[#f5f5f5] px-4 py-3 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white/20"
                            />
                        </div>
                    </div>

                    {/* Advanced Fields */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-400">
                                Coût par projet (€)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.cpp || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        cpp: e.target.value ? parseFloat(e.target.value) : null,
                                    })
                                }
                                className="w-full rounded-xl border border-[#e0e0e0] bg-[#f5f5f5] px-4 py-3 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white/20"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-400">
                                Commission (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={formData.commission || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        commission: e.target.value ? parseFloat(e.target.value) : null,
                                    })
                                }
                                className="w-full rounded-xl border border-[#e0e0e0] bg-[#f5f5f5] px-4 py-3 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white/20"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-400">
                                Difficulté
                            </label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className="w-full rounded-xl border border-[#e0e0e0] bg-[#f5f5f5] px-4 py-3 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/20 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white/20"
                            >
                                <option value="">Sélectionner une difficulté</option>
                                {difficultyOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Progress Bar Configuration */}
                    <div className="dark:text-white">
                        <ProgressBarEditor
                            initialConfig={progressConfig || undefined}
                            onChange={(config) => setProgressConfig(config)}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border-2 border-[#e0e0e0] px-6 py-3 text-sm font-semibold text-[#4a4a4a] transition hover:bg-[#f5f5f5] dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#1a1a1a]"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                            {loading ? "Enregistrement..." : project ? "Mettre à jour" : "Créer le projet"}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
