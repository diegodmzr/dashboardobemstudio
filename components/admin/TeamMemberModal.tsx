"use client";

import { useState } from "react";

export type TeamMemberFormData = {
    name: string;
    email: string;
    role: "ADMIN" | "SUPER_ADMIN" | "CLIENT";
    password?: string;
    status?: string;
};

type Props = {
    member?: {
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
    };
    onClose: () => void;
    onSave: (data: TeamMemberFormData) => Promise<void>;
};

export default function TeamMemberModal({ member, onClose, onSave }: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<TeamMemberFormData>({
        name: member?.name || "",
        email: member?.email || "",
        role: (member?.role as any) || "ADMIN",
        password: "",
        status: member?.status || "Active",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Only send password if it's provided (for update) or always for create
            const dataToSave = { ...formData };
            if (!dataToSave.password && member) {
                delete dataToSave.password;
            }
            await onSave(dataToSave);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-[#1a1a1a]">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#2f2f2f] dark:text-white">
                        {member ? "Modifier le membre" : "Nouveau membre"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white transition"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-300">
                            Nom complet
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-xl border border-[#ece7ef] bg-[#f8f6fb] px-4 py-3 text-sm outline-none transition focus:border-black dark:bg-[#222] dark:border-[#333] dark:text-white dark:focus:border-white"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-300">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full rounded-xl border border-[#ece7ef] bg-[#f8f6fb] px-4 py-3 text-sm outline-none transition focus:border-black dark:bg-[#222] dark:border-[#333] dark:text-white dark:focus:border-white"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-300">
                            Rôle
                        </label>
                        <select
                            className="w-full rounded-xl border border-[#ece7ef] bg-[#f8f6fb] px-4 py-3 text-sm outline-none transition focus:border-black dark:bg-[#222] dark:border-[#333] dark:text-white dark:focus:border-white"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        >
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                            <option value="CLIENT">Client (Passer en client)</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-[#4a4a4a] dark:text-gray-300">
                            Mot de passe {member && "(laisser vide pour ne pas changer)"}
                        </label>
                        <input
                            type="password"
                            required={!member}
                            className="w-full rounded-xl border border-[#ece7ef] bg-[#f8f6fb] px-4 py-3 text-sm outline-none transition focus:border-black dark:bg-[#222] dark:border-[#333] dark:text-white dark:focus:border-white"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-[#ece7ef] py-3 text-sm font-bold text-[#4a4a4a] transition hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#222]"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-xl bg-black py-3 text-sm font-bold text-white shadow-lg transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                            {loading ? "Enregistrement..." : member ? "Modifier" : "Créer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
