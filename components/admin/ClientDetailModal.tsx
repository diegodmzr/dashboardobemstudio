"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Props = {
    client: any;
    onClose: () => void;
    onEdit: () => void;
};

export default function ClientDetailModal({ client, onClose, onEdit }: Props) {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);

    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 200); // Match animation duration
    };

    // Calculate active projects (optional logic if we had status in project list, but we have metrics)
    // For now we just use the aggregations

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md dark:bg-black/80 ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] ring-1 ring-black/5 ${isClosing ? "animate-scaleOut" : "animate-scaleIn"} dark:bg-[#111] dark:shadow-none dark:ring-1 dark:ring-[#333]`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 p-6 md:p-8 dark:border-[#333]">
                    <div className="flex items-center gap-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-xl font-light text-gray-500 overflow-hidden ring-1 ring-gray-100 dark:bg-[#222] dark:ring-[#333] dark:text-gray-400">
                            {client.companyLogo ? (
                                <img src={client.companyLogo} alt={client.companyName} className="h-full w-full object-cover" />
                            ) : (
                                client.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h2 className="text-3xl font-light tracking-tight text-black dark:text-white">{client.name}</h2>
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                {client.companyName && <span className="font-medium text-black dark:text-white">{client.companyName}</span>}
                                {client.companyName && <span>•</span>}
                                <span>{client.email}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-black hover:border-black hover:text-white dark:border-[#333] dark:hover:bg-white dark:hover:border-white dark:hover:text-black"
                    >
                        ✕
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-6 md:p-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 dark:bg-[#1a1a1a] dark:border-[#333]">
                            <span className="block text-xs font-medium uppercase tracking-widest text-gray-400 mb-2 dark:text-gray-500">Chiffre d'affaires</span>
                            <span className="text-2xl font-light text-black block dark:text-white">{formatCurrency(client.totalRevenue)}</span>
                        </div>
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 dark:bg-[#1a1a1a] dark:border-[#333]">
                            <span className="block text-xs font-medium uppercase tracking-widest text-gray-400 mb-2 dark:text-gray-500">Projets</span>
                            <span className="text-2xl font-light text-black block dark:text-white">{client.projectCount}</span>
                        </div>
                    </div>

                    {/* Projects Section */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-black uppercase tracking-wide dark:text-white">Projets ({client.projects?.length || 0})</h3>
                            {/* <button className="text-xs font-semibold text-gray-500 hover:text-black transition">+ Ajouter</button> */}
                        </div>

                        {client.projects && client.projects.length > 0 ? (
                            <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50/50 dark:bg-[#1a1a1a] dark:border-[#333]">
                                {client.projects.map((project: any, index: number) => (
                                    <div
                                        key={project.id}
                                        className={`flex items-center justify-between p-4 transition hover:bg-white dark:hover:bg-[#222] ${index !== client.projects.length - 1 ? "border-b border-gray-100 dark:border-[#333]" : ""}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Status Dot */}
                                            <div className="flex flex-col items-center gap-1">
                                                <div className={`h-2 w-2 rounded-full ${getStatusColor(project.status)}`} />
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-sm text-[#2f2f2f] dark:text-white">{project.name}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(project.createdAt).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            {/* Step Progress Mini */}
                                            <div className="hidden flex-col gap-1.5 sm:flex">
                                                <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
                                                    <span>Progression</span>
                                                    {/* <span>{project.progress}%</span> */}
                                                </div>
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={`h-1.5 w-6 rounded-full ${(project.progress / 20) >= i + 1
                                                                ? "bg-black dark:bg-white"
                                                                : "bg-gray-100 dark:bg-[#333]"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="block text-sm font-bold text-[#2f2f2f] dark:text-white">
                                                    {formatCurrency(project.amount)}
                                                </span>
                                                <span className="block text-xs text-gray-400 uppercase tracking-wider dark:text-gray-500">{project.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-400 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-500">
                                Aucun projet associé à ce client.
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                        {/* Coordonnées */}
                        <div>
                            <h3 className="mb-6 text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">Coordonnées</h3>
                            <div className="space-y-4">
                                <DetailRow label="Email" value={client.email} />
                                <DetailRow label="Téléphone" value={client.phone} />
                                <DetailRow label="Secteur" value={client.sector} />
                                <DetailRow label="Adresse" value="Non renseignée" /> {/* Placeholder */}
                            </div>
                        </div>

                        {/* Méta-données */}
                        <div>
                            <h3 className="mb-6 text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">Informations</h3>
                            <div className="space-y-4">
                                <DetailRow label="Statut" value={client.status === "Active" ? "Actif" : "Inactif"} isValueBold />
                                <DetailRow label="Client depuis le" value={new Date(client.createdAt).toLocaleDateString("fr-FR", { dateStyle: "long" })} />
                                <DetailRow label="Dernière modification" value={new Date(client.updatedAt).toLocaleDateString("fr-FR", { dateStyle: "medium" })} />
                            </div>
                        </div>
                    </div>

                    {/* Sécurité Section */}
                    <div className="mt-10 pt-10 border-t border-gray-100 dark:border-[#333]">
                        <h3 className="mb-6 text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">Sécurité</h3>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 dark:bg-[#1a1a1a] dark:border-[#333]">
                            <div className="flex items-center gap-3">
                                <div className={`h-2.5 w-2.5 rounded-full ${client.twoFactorEnabled ? "bg-emerald-500 animate-pulse" : "bg-gray-300 dark:bg-gray-600"}`} />
                                <div>
                                    <p className="text-sm font-semibold text-black dark:text-white">Double Authentification (2FA)</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {client.twoFactorEnabled
                                            ? "Activée pour ce compte."
                                            : "Désactivée pour ce compte."}
                                    </p>
                                </div>
                            </div>

                            {client.twoFactorEnabled && (
                                <button
                                    onClick={async () => {
                                        if (confirm("Êtes-vous sûr de vouloir désactiver la 2FA pour ce client ?")) {
                                            try {
                                                const res = await fetch(`/api/clients/${client.id}/disable-2fa`, {
                                                    method: "POST"
                                                });
                                                if (res.ok) {
                                                    alert("La 2FA a été désactivée.");
                                                    onClose();
                                                    window.location.reload(); // Quick way to refresh parent data
                                                } else {
                                                    alert("Erreur lors de la désactivation.");
                                                }
                                            } catch (err) {
                                                alert("Une erreur est survenue.");
                                            }
                                        }
                                    }}
                                    className="px-4 py-2 text-xs font-bold text-rose-500 border border-rose-200 rounded-xl hover:bg-rose-50 transition dark:border-rose-900/30 dark:hover:bg-rose-950/20"
                                >
                                    Désactiver la 2FA
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-gray-100 bg-gray-50/30 p-6 flex justify-end gap-3 dark:bg-[#1a1a1a] dark:border-[#333]">
                    <button
                        onClick={onEdit}
                        className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium transition hover:border-black hover:bg-gray-50 text-[#2f2f2f] dark:text-white dark:bg-[#222] dark:border-[#333] dark:hover:border-white dark:hover:bg-[#333]"
                    >
                        Modifier
                    </button>
                </div>
            </div>
        </div>
    );
}

const DetailRow = ({ label, value, isValueBold = false }: { label: string, value: string | null, isValueBold?: boolean }) => (
    <div className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0 dark:border-[#333]">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        {value ? (
            <span className={`text-sm text-right ${isValueBold ? "font-semibold text-black dark:text-white" : "text-gray-800 dark:text-gray-200"}`}>{value}</span>
        ) : (
            <span className="text-sm text-gray-300 italic dark:text-gray-600">—</span>
        )}
    </div>
);

function getStatusColor(status: string) {
    switch (status) {
        case "En cours": return "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]";
        case "Terminé": return "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]";
        case "En attente": return "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
        case "Annulé": return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
        default: return "bg-gray-400";
    }
}
