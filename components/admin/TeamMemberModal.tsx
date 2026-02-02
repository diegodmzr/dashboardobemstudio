"use client";

import { useState, useEffect } from "react";
import { X, User } from "lucide-react";

export type TeamMemberFormData = {
    name: string;
    email: string;
    role: "ADMIN" | "SUPER_ADMIN" | "CLIENT";
    password?: string;
    status?: string;
    avatar?: string | null;
};

type Props = {
    isOpen: boolean;
    member?: {
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        avatar?: string | null;
    };
    onClose: () => void;
    onSave: (data: TeamMemberFormData) => Promise<void>;
};

export default function TeamMemberModal({ isOpen, member, onClose, onSave }: Props) {
    const [loading, setLoading] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [formData, setFormData] = useState<TeamMemberFormData>({
        name: "",
        email: "",
        role: "ADMIN",
        password: "",
        status: "Active",
        avatar: null,
    });
    const [uploadLoading, setUploadLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            if (member) {
                setFormData({
                    name: member.name || "",
                    email: member.email || "",
                    role: (member.role as any) || "ADMIN",
                    password: "",
                    status: member.status || "Active",
                    avatar: member.avatar || null,
                });
            } else {
                setFormData({
                    name: "",
                    email: "",
                    role: "ADMIN",
                    password: "",
                    status: "Active",
                    avatar: null,
                });
            }
        }
    }, [isOpen, member]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const generatePassword = () => {
        const length = 16;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";

        password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
        password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
        password += "0123456789"[Math.floor(Math.random() * 10)];
        password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

        for (let i = password.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        password = password.split('').sort(() => Math.random() - 0.5).join('');
        setFormData({ ...formData, password });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSave = { ...formData };
            if (!dataToSave.password && member) {
                delete dataToSave.password;
            }
            await onSave(dataToSave);
            handleClose();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-xl h-full bg-white dark:bg-[#0a0a0a] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-500 ease-out ${isClosing ? "translate-x-full" : "translate-x-0"}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-[#1a1a1a]">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {member ? "Éditer le profil" : "Nouveau collaborateur"}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {member ? "Mise à jour des accès et informations" : "Invitation d'un nouveau membre dans l'équipe"}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">
                    {/* Profile Section */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">Informations Personnelles</h3>

                        {/* Avatar */}
                        <div className="flex items-center gap-6">
                            <div className="relative h-24 w-24 overflow-hidden rounded-3xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-[#222] group">
                                {formData.avatar ? (
                                    <>
                                        <img src={formData.avatar} alt="Avatar" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, avatar: null })}
                                                className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-[#333]">
                                        <User className="w-10 h-10" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="team-avatar-upload"
                                    className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-black dark:bg-white px-5 py-2.5 text-xs font-bold text-white dark:text-black transition hover:opacity-80 border border-transparent"
                                >
                                    {uploadLoading ? "Chargement..." : "Changer la photo"}
                                </label>
                                <input
                                    type="file"
                                    id="team-avatar-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const localPreview = URL.createObjectURL(file);
                                        setFormData(prev => ({ ...prev, avatar: localPreview }));
                                        const uploadData = new FormData();
                                        uploadData.append("file", file);
                                        try {
                                            setUploadLoading(true);
                                            const res = await fetch("/api/upload", { method: "POST", body: uploadData });
                                            if (res.ok) {
                                                const result = await res.json();
                                                setFormData(prev => ({ ...prev, avatar: result.url }));
                                                URL.revokeObjectURL(localPreview);
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            setFormData(prev => ({ ...prev, avatar: member?.avatar || null }));
                                        } finally {
                                            setUploadLoading(false);
                                        }
                                    }}
                                />
                                <p className="text-[10px] text-gray-400 dark:text-gray-500">SVG, PNG, JPG (max. 800x800px)</p>
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Nom complet</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-2xl border border-gray-100 dark:border-[#1a1a1a] bg-gray-50/50 dark:bg-[#111] px-5 py-3.5 text-sm outline-none focus:border-black dark:focus:border-white transition-all dark:text-white"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="ex: Alexandre Martin"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Adresse email pro</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full rounded-2xl border border-gray-100 dark:border-[#1a1a1a] bg-gray-50/50 dark:bg-[#111] px-5 py-3.5 text-sm outline-none focus:border-black dark:focus:border-white transition-all dark:text-white"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="a.martin@obemstudio.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-[#1a1a1a]">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">Sécurité & Rôles</h3>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Rôle au sein de l'agence</label>
                                <select
                                    className="w-full rounded-2xl border border-gray-100 dark:border-[#1a1a1a] bg-gray-50/50 dark:bg-[#111] px-5 py-3.5 text-sm outline-none focus:border-black dark:focus:border-white transition-all dark:text-white cursor-pointer appearance-none"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                >
                                    <option value="ADMIN">Administrateur</option>
                                    <option value="SUPER_ADMIN">Super Administrateur</option>
                                    <option value="CLIENT">Client</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">
                                    {member ? "Modifier le mot de passe (optionnel)" : "Mot de passe initial"}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        required={!member}
                                        className="flex-1 rounded-2xl border border-gray-100 dark:border-[#1a1a1a] bg-gray-50/50 dark:bg-[#111] px-5 py-3.5 text-sm outline-none focus:border-black dark:focus:border-white transition-all dark:text-white"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={member ? "••••••••••••" : "Min. 12 caractères"}
                                    />
                                    {!member && (
                                        <button
                                            type="button"
                                            onClick={generatePassword}
                                            className="px-5 py-3.5 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-[#222] text-xs font-bold transition-all"
                                        >
                                            Générer
                                        </button>
                                    )}
                                </div>
                                {formData.password && !member && (
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl mt-2">
                                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400">Pensez à bien copier ce mot de passe avant de sauvegarder.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-8 border-t border-gray-100 dark:border-[#1a1a1a] flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 px-6 py-3.5 rounded-2xl border border-gray-200 dark:border-[#222] text-gray-600 dark:text-gray-400 text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#111] transition-all"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-[1.5] px-6 py-3.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xl shadow-black/5 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            member ? "Enregistrer les modifications" : "Créer le compte"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
