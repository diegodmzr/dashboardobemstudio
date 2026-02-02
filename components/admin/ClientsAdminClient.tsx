"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import FilterPill from "./FilterPill";
import ClientModal, { ClientFormData } from "./ClientModal";
import ClientDetailModal from "./ClientDetailModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

type Client = {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    companyName?: string;
    companyLogo?: string;
    sector?: string;
    siret?: string;
    status: string;
    twoFactorEnabled: boolean;
    createdAt: string;
    projectCount: number;
    totalRevenue: number;
    projects: {
        id: string;
        name: string;
        status: string;
        progress: number;
        amount: number;
        createdAt: string;
    }[];
};

type Props = {
    clients: Client[];
};

export default function ClientsAdminClient({ clients }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { success, error } = useToast();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [sectorFilter, setSectorFilter] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<string>("created_desc");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewingClient, setViewingClient] = useState<Client | null>(null);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [deleteClient, setDeleteClient] = useState<Client | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Handle URL Actions
    useEffect(() => {
        const action = searchParams.get("action");
        if (action === "create") {
            setShowCreateModal(true);
        }
    }, [searchParams]);

    // Derive unique sectors for filter
    const sectorOptions = useMemo(() => {
        const sectors = new Set(clients.map(c => c.sector).filter(Boolean) as string[]);
        return Array.from(sectors);
    }, [clients]);

    const filtered = useMemo(() => {
        const filteredList = clients.filter((c) => {
            const term = search.toLowerCase();
            const matches =
                c.name.toLowerCase().includes(term) ||
                c.email.toLowerCase().includes(term) ||
                (c.companyName?.toLowerCase().includes(term) ?? false);

            const statusOk = !statusFilter || c.status === statusFilter;
            const sectorOk = !sectorFilter || c.sector === sectorFilter;

            return matches && statusOk && sectorOk;
        });

        // Apply Sorting
        return filteredList.sort((a, b) => {
            switch (sortOrder) {
                case "created_desc":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "created_asc":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "revenue_desc":
                    return b.totalRevenue - a.totalRevenue;
                case "revenue_asc":
                    return a.totalRevenue - b.totalRevenue;
                case "projects_desc":
                    return b.projectCount - a.projectCount;
                default:
                    return 0;
            }
        });
    }, [clients, search, statusFilter, sectorFilter, sortOrder]);

    const resetFilters = () => {
        setSearch("");
        setStatusFilter(null);
        setSectorFilter(null);
        setSortOrder("created_desc");
    };

    const handleCreate = async (data: ClientFormData) => {
        try {
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Erreur lors de la création");
            }

            success("Client créé avec succès !");
            setShowCreateModal(false);
            router.refresh();
        } catch (err: any) {
            error(err.message || "Erreur lors de la création du client");
        }
    };

    const handleUpdate = async (data: ClientFormData) => {
        if (!editingClient) return;

        try {
            const res = await fetch(`/api/clients/${editingClient.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Erreur lors de la modification");
            }

            success("Client modifié avec succès !");
            setEditingClient(null);
            router.refresh();
        } catch (err: any) {
            error(err.message || "Erreur lors de la modification du client");
        }
    };

    const handleDelete = async () => {
        if (!deleteClient) return;

        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/clients/${deleteClient.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Erreur lors de la suppression");
            }

            success("Client supprimé avec succès !");
            setDeleteClient(null);
            router.refresh();
        } catch (err: any) {
            error(err.message || "Erreur lors de la suppression du client");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <>
            {/* Top Bar Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ece7ef] bg-white px-4 md:px-8 py-4 dark:bg-[#111] dark:border-[#333]">
                <div className="flex w-full md:w-auto items-center gap-4">
                    <div className="relative w-full md:w-auto">
                        <svg
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder="Rechercher un client..."
                            className="h-10 w-full md:w-64 rounded-full border border-[#ece7ef] bg-[#f8f6fb] pl-10 pr-4 text-sm outline-none transition focus:border-[#2f2f2f] focus:ring-1 focus:ring-[#2f2f2f] dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full md:w-auto cursor-pointer rounded-full bg-black px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                    + Nouveau client
                </button>
            </div>

            <main className="flex-1 px-4 md:px-8 py-6 bg-[#f8f6fb] dark:bg-black min-h-[calc(100vh-80px)]">
                {/* Filters */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <FilterPill
                            label="Statut"
                            value={statusFilter}
                            options={["Active", "Inactive"]}
                            onSelect={setStatusFilter}
                        />
                        <FilterPill
                            label="Secteur"
                            value={sectorFilter}
                            options={sectorOptions}
                            onSelect={setSectorFilter}
                        />

                        {(statusFilter || sectorFilter || search || sortOrder !== "created_desc") && (
                            <button
                                onClick={resetFilters}
                                className="ml-2 text-xs font-semibold text-rose-500 hover:text-rose-600 transition"
                            >
                                Réinitialiser
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#6a6a6a] dark:text-gray-400">Trier par:</span>
                        <div className="relative">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="cursor-pointer appearance-none rounded-xl border border-[#e0e0e0] bg-white pl-4 pr-10 py-2.5 text-sm font-semibold text-[#2f2f2f] outline-none transition focus:border-[#2f2f2f] focus:ring-2 focus:ring-[#2f2f2f]/10 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            >
                                <option value="created_desc">Plus récent</option>
                                <option value="created_asc">Plus ancien</option>
                                <option value="revenue_desc">CA (Décroissant)</option>
                                <option value="revenue_asc">CA (Croissant)</option>
                                <option value="projects_desc">Nombre de projets</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6a6a6a]">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client List */}
                {filtered.length === 0 ? (
                    <div className="mt-20 flex flex-col items-center justify-center">
                        <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#f8f6fb] to-[#ece7ef] dark:from-[#333] dark:to-[#222]">
                            <svg
                                className="h-16 w-16 text-[#8b7aa8] dark:text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-[#2f2f2f] dark:text-white">
                            Aucun client trouvé
                        </h3>
                        <p className="mb-6 text-sm text-[#6a6a6a] dark:text-gray-400">
                            {search || statusFilter || sectorFilter
                                ? "Essayez de modifier vos filtres"
                                : "Commencez par ajouter votre premier client"}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filtered.map((client) => (
                            <div
                                key={client.id}
                                onClick={() => setViewingClient(client)}
                                className="group relative flex flex-col md:flex-row cursor-pointer items-start md:items-center justify-between gap-4 rounded-2xl border border-[#ece7ef] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-[#1a1a1a] dark:border-[#333] dark:hover:bg-[#222]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e0e0e0] text-lg font-bold text-[#6a6a6a] overflow-hidden dark:bg-[#333] dark:text-white">
                                        {client.companyLogo ? (
                                            <img src={client.companyLogo} alt={client.companyName} className="h-full w-full object-cover" />
                                        ) : (
                                            client.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-[#2f2f2f] dark:text-white">{client.name}</h3>
                                            {client.status === "Inactive" && (
                                                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                    Inactif
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[#6a6a6a] dark:text-gray-400">
                                            {client.companyName || "Particulier"} • {client.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-4 md:gap-8 mt-2 md:mt-0">
                                    <div className="text-right">
                                        <p className="text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">
                                            Projets
                                        </p>
                                        <p className="font-bold text-[#2f2f2f] dark:text-white">{client.projectCount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">
                                            CA Total
                                        </p>
                                        <p className="font-bold text-[#2f2f2f] dark:text-white">
                                            {client.totalRevenue.toLocaleString("fr-FR", {
                                                style: "currency",
                                                currency: "EUR",
                                            })}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 transition md:group-hover:opacity-100">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingClient(client);
                                            }}
                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[#4a4a4a] transition hover:bg-gray-50 hover:text-black dark:bg-[#333] dark:border-[#444] dark:text-white dark:hover:bg-[#444]"
                                            title="Modifier"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteClient(client);
                                            }}
                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50 hover:text-red-500 hover:border-red-200 dark:bg-[#333] dark:border-[#444] dark:text-white dark:hover:bg-[#444]"
                                            title="Supprimer"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modals */}
            <ClientModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSave={handleCreate}
            />

            {viewingClient && (
                <ClientDetailModal
                    client={viewingClient}
                    onClose={() => setViewingClient(null)}
                    onEdit={() => {
                        setViewingClient(null);
                        setEditingClient(viewingClient);
                    }}
                />
            )}

            <ClientModal
                isOpen={!!editingClient}
                client={editingClient || undefined}
                onClose={() => setEditingClient(null)}
                onSave={handleUpdate}
            />

            {deleteClient && (
                <DeleteConfirmModal
                    projectName={deleteClient.name} // Using reusable component, prop name mismatch but works for text
                    onConfirm={handleDelete}
                    loading={deleteLoading}
                    onCancel={() => setDeleteClient(null)}
                />
            )}
        </>
    );
}
