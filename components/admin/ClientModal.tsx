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
    onClose: () => void;
    onSave: (data: ClientFormData) => Promise<void>;
};

export default function ClientModal({ client, onClose, onSave }: Props) {
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

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 200); // Match animation duration
    };

    useEffect(() => {
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
        }
    }, [client]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            setError("Le nom et l'email sont requis");
            return;
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

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm dark:bg-black/80 ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl ${isClosing ? "animate-scaleOut" : "animate-scaleIn"} dark:bg-[#111] dark:shadow-none dark:ring-1 dark:ring-[#333]`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#2f2f2f] dark:text-white">
                        {client ? "Modifier le client" : "Nouveau client"}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] text-lg font-semibold text-[#2f2f2f] transition hover:bg-[#e0e0e0] dark:bg-[#333] dark:text-white dark:hover:bg-[#444]"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Main Info */}
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wide text-[#6a6a6a] dark:text-gray-400">
                                Nom
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full rounded-xl border border-[#e0e0e0] bg-[#f8f6fb] px-4 py-3 text-[#2f2f2f] transition focus:border-[#2f2f2f] focus:outline-none dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                                placeholder="Jean Dupont"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wide text-[#6a6a6a] dark:text-gray-400">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className="w-full rounded-xl border border-[#e0e0e0] bg-[#f8f6fb] px-4 py-3 text-[#2f2f2f] transition focus:border-[#2f2f2f] focus:outline-none dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                                placeholder="jean@example.com"
                            />
                        </div>
                    </div>

                    {/* Company Info */}
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wide text-[#6a6a6a] dark:text-gray-400">
                                Entreprise
                            </label>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) =>
                                    setFormData({ ...formData, companyName: e.target.value })
                                }
                                className="w-full rounded-xl border border-[#e0e0e0] bg-[#f8f6fb] px-4 py-3 text-[#2f2f2f] transition focus:border-[#2f2f2f] focus:outline-none dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                                placeholder="Acme Corp"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wide text-[#6a6a6a] dark:text-gray-400">
                                Secteur
                            </label>
                            <select
                                value={formData.sector}
                                onChange={(e) =>
                                    setFormData({ ...formData, sector: e.target.value })
                                }
                                className="w-full rounded-xl border border-[#e0e0e0] bg-[#f8f6fb] px-4 py-3 text-[#2f2f2f] transition focus:border-[#2f2f2f] focus:outline-none dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
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
                        <label className="text-xs font-bold uppercase tracking-wide text-[#6a6a6a] dark:text-gray-400">
                            SIRET
                        </label>
                        <input
                            type="text"
                            value={formData.siret || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, siret: e.target.value })
                            }
                            className="w-full rounded-xl border border-[#e0e0e0] bg-[#f8f6fb] px-4 py-3 text-[#2f2f2f] transition focus:border-[#2f2f2f] focus:outline-none dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            placeholder="123 456 789 00012"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wide text-[#6a6a6a] dark:text-gray-400">
                            Téléphone
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                            className="w-full rounded-xl border border-[#e0e0e0] bg-[#f8f6fb] px-4 py-3 text-[#2f2f2f] transition focus:border-[#2f2f2f] focus:outline-none dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            placeholder="+33 6 12 34 56 78"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wide text-[#6a6a6a] dark:text-gray-400">
                            Logo de l'entreprise
                        </label>
                        <div className="flex items-center gap-5">
                            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#e0e0e0] bg-[#f8f6fb] dark:bg-[#1a1a1a] dark:border-[#333]">
                                {formData.companyLogo ? (
                                    <>
                                        <img
                                            src={formData.companyLogo}
                                            alt="Logo preview"
                                            className="h-full w-full object-cover"
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
                                <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#f5f5f5] px-6 py-2.5 text-sm font-semibold text-[#2f2f2f] transition hover:bg-[#e0e0e0] dark:bg-[#333] dark:text-white dark:hover:bg-[#444]">
                                    <span>{formData.companyLogo ? "Changer le logo" : "Importer un logo"}</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            const uploadData = new FormData();
                                            uploadData.append("file", file);

                                            try {
                                                setLoading(true);
                                                const res = await fetch("/api/upload", {
                                                    method: "POST",
                                                    body: uploadData,
                                                });
                                                if (!res.ok) throw new Error("Erreur upload");
                                                const result = await res.json();
                                                setFormData({ ...formData, companyLogo: result.url });
                                            } catch (err) {
                                                console.error(err);
                                                alert("Erreur lors de l'upload de l'image");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                    />
                                </label>
                                <p className="mt-2 text-xs text-[#6a6a6a] dark:text-gray-500">
                                    PNG, JPG ou SVG. Max 2MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wide text-[#6a6a6a] dark:text-gray-400">
                            {client ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
                        </label>
                        <input
                            type="password"
                            value={formData.password || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            className="w-full rounded-xl border border-[#e0e0e0] bg-[#f8f6fb] px-4 py-3 text-[#2f2f2f] transition focus:border-[#2f2f2f] focus:outline-none dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            placeholder={client ? "••••••••" : "Requis pour la connexion"}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wide text-[#6a6a6a] dark:text-gray-400">
                            Statut
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full rounded-xl border border-[#e0e0e0] bg-[#f8f6fb] px-4 py-3 text-[#2f2f2f] transition focus:border-[#2f2f2f] focus:outline-none dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
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
                            <span className="text-sm text-[#2f2f2f] dark:text-gray-300 font-medium select-none cursor-pointer" onClick={() => setFormData({ ...formData, sendLoginEmail: !formData.sendLoginEmail })}>
                                Envoyer les identifiants par email
                            </span>
                        </div>
                    )}


                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="cursor-pointer rounded-full px-6 py-3 text-sm font-semibold text-[#6a6a6a] transition hover:bg-[#f5f5f5] hover:text-[#2f2f2f] dark:text-gray-400 dark:hover:bg-[#222] dark:hover:text-white"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer rounded-full bg-black px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                            {loading ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
