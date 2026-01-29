"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

type Goal = {
    id?: string;
    title: string;
    description: string;
    type: string;
    targetValue: number;
    currentValue: number;
    startDate: string;
    endDate: string;
    recurrence: string;
    rollover: boolean;
    scope: string;
    autoTracking: boolean;
    notifications?: {
        email: boolean;
        app: boolean;
        widget: boolean;
    };
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    goal?: Goal | null;
    onSubmit: (data: any) => void;
};

const GOAL_TYPES = [
    { value: "REVENUE", label: "Chiffre d'Affaires (€)" },
    { value: "PROFIT", label: "Bénéfice Net (€)" },
    { value: "MRR", label: "MRR (Revenu Récurrent) (€)" },
    { value: "AVERAGE_DEAL_SIZE", label: "Panier Moyen (€)" },
    { value: "NEW_CLIENTS", label: "Nouveaux Clients" },
    { value: "PROJECTS_CREATED", label: "Projets Créés" },
    { value: "PROJECTS_COMPLETED", label: "Projets Terminés" },
    { value: "QUOTES_SENT", label: "Devis Envoyés" },
    { value: "QUOTES_ACCEPTED", label: "Devis Acceptés" },
    { value: "CONVERSION_RATE", label: "Taux de Conversion (%)" },
];

export default function GoalModal({ isOpen, onClose, goal, onSubmit }: Props) {
    const [formData, setFormData] = useState<any>({
        title: "",
        description: "",
        type: "REVENUE",
        targetValue: "",
        currentValue: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0], // End of year default
        recurrence: "NONE",
        rollover: false,
        scope: "GLOBAL",
        autoTracking: true,
        notifications: {
            email: false,
            app: true,
            widget: true,
        },
    });

    useEffect(() => {
        if (goal) {
            setFormData({
                ...goal,
                startDate: goal.startDate ? new Date(goal.startDate).toISOString().split("T")[0] : "",
                endDate: goal.endDate ? new Date(goal.endDate).toISOString().split("T")[0] : "",
                // Ensure notifications object exists
                notifications: goal.notifications || { email: false, app: true, widget: true }
            });
        }
    }, [goal]);

    const handleSubmit = () => {
        if (!formData.title || !formData.targetValue || !formData.startDate || !formData.endDate) {
            alert("Veuillez remplir les champs obligatoires");
            return;
        }
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scaleIn dark:bg-[#111]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 dark:bg-[#111] dark:border-[#333]">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {goal ? "Modifier l'objectif" : "Nouvel Objectif"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition dark:hover:bg-[#222]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">Titre *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="ex: 100k€ CA 2026"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">Type *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition bg-white dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            >
                                {GOAL_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Target & Period */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">Cible *</label>
                            <input
                                type="number"
                                value={formData.targetValue}
                                onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                                placeholder="50000"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">Date Début *</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">Date Fin *</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            />
                        </div>
                    </div>

                    {/* Behavior (Recurrence & Rollover) */}
                    <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-100 dark:bg-[#1a1a1a] dark:border-[#333]">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Comportement</h3>

                        <div className="flex flex-wrap gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Périodicité</label>
                                <select
                                    value={formData.recurrence}
                                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[150px] dark:bg-[#111] dark:border-[#333] dark:text-white"
                                >
                                    <option value="NONE">Une seule fois</option>
                                    <option value="MONTHLY">Mensuel</option>
                                    <option value="QUARTERLY">Trimestriel</option>
                                    <option value="YEARLY">Annuel</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="rollover"
                                    checked={formData.rollover}
                                    onChange={(e) => setFormData({ ...formData, rollover: e.target.checked })}
                                    className="w-4 h-4 rounded text-black focus:ring-black dark:bg-[#111] dark:border-[#333]"
                                />
                                <label htmlFor="rollover" className="text-sm text-gray-700 cursor-pointer select-none dark:text-gray-300">
                                    <span className="font-medium block">Report automatique</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-500">Si non atteint, ajouter le reste à la période suivante</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Scope & Notifications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 dark:text-gray-500">Portée</h3>
                            <div className="flex gap-4">
                                <label className={`flex-1 p-3 border rounded-xl cursor-pointer transition text-center text-sm font-medium ${formData.scope === 'GLOBAL' ? 'border-black bg-black text-white dark:bg-white dark:text-black dark:border-white' : 'border-gray-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#1a1a1a]'}`}>
                                    <input type="radio" className="hidden"
                                        checked={formData.scope === 'GLOBAL'}
                                        onChange={() => setFormData({ ...formData, scope: 'GLOBAL' })}
                                    />
                                    Global
                                </label>
                                <label className={`flex-1 p-3 border rounded-xl cursor-pointer transition text-center text-sm font-medium ${formData.scope === 'PERSONAL' ? 'border-black bg-black text-white dark:bg-white dark:text-black dark:border-white' : 'border-gray-200 hover:bg-gray-50 dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#1a1a1a]'}`}>
                                    <input type="radio" className="hidden"
                                        checked={formData.scope === 'PERSONAL'}
                                        onChange={() => setFormData({ ...formData, scope: 'PERSONAL' })}
                                    />
                                    Personnel
                                </label>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 dark:text-gray-500">Notifications</h3>
                            <div className="flex flex-wrap gap-2">
                                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 dark:border-[#333] dark:hover:bg-[#1a1a1a]">
                                    <input
                                        type="checkbox"
                                        checked={formData.notifications.email}
                                        onChange={(e) => setFormData({ ...formData, notifications: { ...formData.notifications, email: e.target.checked } })}
                                        className="rounded text-black focus:ring-black dark:bg-[#111] dark:border-[#333]"
                                    />
                                    <span className="text-sm dark:text-gray-300">Email</span>
                                </label>
                                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 dark:border-[#333] dark:hover:bg-[#1a1a1a]">
                                    <input
                                        type="checkbox"
                                        checked={formData.notifications.app}
                                        onChange={(e) => setFormData({ ...formData, notifications: { ...formData.notifications, app: e.target.checked } })}
                                        className="rounded text-black focus:ring-black dark:bg-[#111] dark:border-[#333]"
                                    />
                                    <span className="text-sm dark:text-gray-300">App (Toast)</span>
                                </label>
                                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 dark:border-[#333] dark:hover:bg-[#1a1a1a]">
                                    <input
                                        type="checkbox"
                                        checked={formData.notifications.widget}
                                        onChange={(e) => setFormData({ ...formData, notifications: { ...formData.notifications, widget: e.target.checked } })}
                                        className="rounded text-black focus:ring-black dark:bg-[#111] dark:border-[#333]"
                                    />
                                    <span className="text-sm dark:text-gray-300">Widget</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Auto Tracking Toggle */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl dark:bg-blue-900/10 dark:border-blue-900/20">
                        <div>
                            <h4 className="font-semibold text-blue-900 text-sm dark:text-blue-400">Tracking Automatique</h4>
                            <p className="text-xs text-blue-700 mt-1 dark:text-blue-500">Calculer automatiquement la progression depuis les données.</p>
                        </div>
                        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input
                                type="checkbox"
                                name="toggle"
                                id="toggle"
                                checked={formData.autoTracking}
                                onChange={(e) => setFormData({ ...formData, autoTracking: e.target.checked })}
                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-blue-200 checked:right-0 checked:border-blue-600 transition-all duration-300 transform translate-x-0 checked:translate-x-full dark:border-blue-900/50 dark:bg-gray-200"
                            />
                            <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${formData.autoTracking ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></label>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 dark:bg-[#111] dark:border-[#333]">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200 transition dark:text-gray-400 dark:hover:bg-[#222]"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-black hover:bg-gray-800 transition shadow-lg shadow-black/10 flex items-center gap-2 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        <Check className="w-4 h-4" />
                        {goal ? "Enregistrer" : "Créer l'Objectif"}
                    </button>
                </div>
            </div>
        </div>
    );
}
