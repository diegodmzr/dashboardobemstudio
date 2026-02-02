"use client";

import { useState, useEffect } from "react";

export type ClientFormData = {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    companyName?: string;
    companyLogo?: string;
    sector?: string;
    siret?: string;
    status?: string;
    sendLoginEmail?: boolean;
};

type Props = {
    client?: any; // Using any for now to avoid complex User type duplications
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ClientFormData) => Promise<void>;
};

export default function ClientModal({ client, isOpen, onClose, onSave }: Props) {
    const [formData, setFormData] = useState<ClientFormData>({
        name: "",
        email: "",
        phone: "",
        companyName: "",
        companyLogo: "",
        sector: "",
        siret: "",
        status: "Active",
        sendLoginEmail: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            if (client) {
                setFormData({
                    name: client.name || "",
                    email: client.email || "",
                    phone: client.phone || "",
                    companyName: client.companyName || "",
                    companyLogo: client.companyLogo || "",
                    sector: client.sector || "",
                    siret: client.siret || "",
                    status: client.status || "Active",
                });
            } else {
                // Reset for new client
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    companyName: "",
                    companyLogo: "",
                    sector: "",
                    siret: "",
                    status: "Active",
                    sendLoginEmail: true,
                });
            }
            setError(null);
        }
    }, [isOpen, client]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300); // Match animation duration
    };

    const generatePassword = () => {
        const length = 16;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";

        // Ensure at least one of each type
        password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
        password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
        password += "0123456789"[Math.floor(Math.random() * 10)];
        password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        // Shuffle the password
        password = password.split('').sort(() => Math.random() - 0.5).join('');

        setFormData({ ...formData, password });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            setError("Le nom et l'email sont requis");
            return;
        }

        // Check for duplicate email only when creating new client
        if (!client) {
            try {
                const checkRes = await fetch(`/api/clients/check-email?email=${encodeURIComponent(formData.email)}`);
                const checkData = await checkRes.json();

                if (checkData.exists) {
                    setError("⚠️ Attention : Cet email est déjà utilisé par un autre client.");
                    return;
                }
            } catch (err) {
                console.error("Error checking email:", err);
            }
        }

        setLoading(true);
        setError(null);
        try {
            await onSave(formData);
            handleClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
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
                        <h2 className="text-xl font-bold text-black dark:text-white">{client ? "Modifier le client" : "Nouveau client"}</h2>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Remplissez les informations ci-dessous</p>
                    </div>
                    <button onClick={handleClose} className="rounded-full p-2 hover:bg-gray-100 transition dark:hover:bg-[#222]">✕</button>
                </div>

                {/* Form Content */}
                <div className="p-8 space-y-6">
                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Main Info */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                                    Nom <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                    placeholder="Jean Dupont"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                    placeholder="jean@example.com"
                                />
                            </div>
                        </div>

                        {/* Company Info */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                                    Entreprise
                                </label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, companyName: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                    placeholder="Acme Corp"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                                    Secteur
                                </label>
                                <select
                                    value={formData.sector}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sector: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                >
                                    <option value="">Choisir un secteur...</option>
                                    <option value="Restauration">Restauration</option>
                                    <option value="Immobilier">Immobilier</option>
                                    <option value="E-commerce">E-commerce</option>
                                    <option value="Santé / Bien-être">Santé / Bien-être</option>
                                    <option value="Technologie / Informatique">Technologie / Informatique</option>
                                    <option value="BTP / Construction">BTP / Construction</option>
                                    <option value="Finance / Assurance">Finance / Assurance</option>
                                    <option value="Éducation / Formation">Éducation / Formation</option>
                                    <option value="Art / Culture">Art / Culture</option>
                                    <option value="Mode / Luxe">Mode / Luxe</option>
                                    <option value="Transport / Logistique">Transport / Logistique</option>
                                    <option value="Marketing / Communication">Marketing / Communication</option>
                                    <option value="Juridique">Juridique</option>
                                    <option value="Tourisme / Hôtellerie">Tourisme / Hôtellerie</option>
                                    <option value="Sport">Sport</option>
                                    <option value="Services à la personne">Services à la personne</option>
                                    <option value="Automobile">Automobile</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                                SIRET
                            </label>
                            <input
                                type="text"
                                value={formData.siret || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, siret: e.target.value })
                                }
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                placeholder="123 456 789 00012"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                placeholder="+33 6 12 34 56 78"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                                Logo de l'entreprise
                            </label>
                            <div className="flex items-center gap-5">
                                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333]">
                                    {formData.companyLogo ? (
                                        <>
                                            <img
                                                src={formData.companyLogo}
                                                alt="Logo preview"
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.opacity = '0.3';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, companyLogo: "" })}
                                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition hover:bg-rose-600"
                                            >
                                                ✕
                                            </button>
                                        </>
                                    ) : (
                                        <svg
                                            className="h-8 w-8 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-gray-50 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 border border-gray-200 dark:bg-[#222] dark:text-white dark:hover:bg-[#333] dark:border-[#444]">
                                        <span>{formData.companyLogo ? "Changer le logo" : "Importer un logo"}</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                // Immediate preview using blob URL
                                                const localPreview = URL.createObjectURL(file);
                                                setFormData(prev => ({ ...prev, companyLogo: localPreview }));

                                                const uploadData = new FormData();
                                                uploadData.append("file", file);

                                                try {
                                                    setLoading(true);
                                                    const res = await fetch("/api/upload", {
                                                        method: "POST",
                                                        body: uploadData,
                                                    });

                                                    if (!res.ok) {
                                                        throw new Error("Erreur lors de l'envoi du fichier");
                                                    }

                                                    const result = await res.json();

                                                    // Replace local preview with server URL
                                                    setFormData(prev => ({ ...prev, companyLogo: result.url }));

                                                    // Clean up the blob URL to avoid memory leaks
                                                    URL.revokeObjectURL(localPreview);
                                                } catch (err: any) {
                                                    console.error(err);
                                                    setError("Erreur lors de l'upload de l'image. Veuillez réessayer.");
                                                    // Revert to empty if it was a new upload
                                                    setFormData(prev => ({ ...prev, companyLogo: client?.companyLogo || "" }));
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                        />
                                    </label>
                                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                                        PNG, JPG ou SVG. Max 2MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                                {client ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={formData.password || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                                    placeholder={client ? "••••••••" : "Requis pour la connexion"}
                                />
                                {!client && (
                                    <button
                                        type="button"
                                        onClick={generatePassword}
                                        className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition flex items-center gap-2 dark:bg-[#222] dark:hover:bg-[#333] dark:text-white"
                                        title="Générer un mot de passe sécurisé"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Générer
                                    </button>
                                )}
                            </div>
                            {formData.password && formData.password.length > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Mot de passe actuel : <span className="font-mono font-semibold">{formData.password}</span>
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
                                Statut
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-black dark:border-[#333] dark:text-white dark:focus:border-white"
                            >
                                <option value="Active">Actif</option>
                                <option value="Inactive">Inactif</option>
                            </select>
                        </div>

                        {!client && (
                            <div className="flex items-center gap-3 pt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.sendLoginEmail}
                                        onChange={(e) => setFormData({ ...formData, sendLoginEmail: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium select-none cursor-pointer" onClick={() => setFormData({ ...formData, sendLoginEmail: !formData.sendLoginEmail })}>
                                    Envoyer les identifiants par email
                                </span>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex items-center justify-end gap-3 dark:bg-black dark:border-[#333]">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-6 py-2.5 rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#222]"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-800 transition shadow-lg shadow-black/20 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        {loading ? "Enregistrement..." : "Enregistrer"}
                    </button>
                </div>
            </div>
        </div>
    );
}
