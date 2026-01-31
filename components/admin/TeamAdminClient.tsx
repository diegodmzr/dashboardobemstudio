"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import TeamMemberModal, { TeamMemberFormData } from "./TeamMemberModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

type TeamMember = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatar?: string | null;
    createdAt: string;
    lastLoginAt?: string | null;
};

type Props = {
    team: TeamMember[];
    currentUserId: string;
};

export default function TeamAdminClient({ team, currentUserId }: Props) {
    const router = useRouter();
    const { success, error } = useToast();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [deleteMember, setDeleteMember] = useState<TeamMember | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const filtered = useMemo(() => {
        return team.filter((m) => {
            const term = search.toLowerCase();
            const matches =
                m.name.toLowerCase().includes(term) ||
                m.email.toLowerCase().includes(term);

            const roleOk = !roleFilter || m.role === roleFilter;

            return matches && roleOk;
        });
    }, [team, search, roleFilter]);

    const handleCreate = async (data: TeamMemberFormData) => {
        try {
            const res = await fetch("/api/admin/team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Erreur lors de la création");
            }

            success("Membre de l'équipe ajouté avec succès !");
            setShowCreateModal(false);
            router.refresh();
        } catch (err: any) {
            error(err.message || "Erreur lors de la création du membre");
        }
    };

    const handleUpdate = async (data: TeamMemberFormData) => {
        if (!editingMember) return;

        try {
            const res = await fetch(`/api/admin/team/${editingMember.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Erreur lors de la modification");
            }

            success("Membre de l'équipe modifié avec succès !");
            setEditingMember(null);
            router.refresh();
        } catch (err: any) {
            error(err.message || "Erreur lors de la modification du membre");
        }
    };

    const handleDelete = async () => {
        if (!deleteMember) return;

        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/admin/team/${deleteMember.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Erreur lors de la suppression");
            }

            success("Membre supprimé avec succès !");
            setDeleteMember(null);
            router.refresh();
        } catch (err: any) {
            error(err.message || "Erreur lors de la suppression du membre");
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
                            placeholder="Rechercher un membre..."
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
                    + Nouveau membre
                </button>
            </div>

            <main className="flex-1 px-4 md:px-8 py-6 bg-[#f8f6fb] dark:bg-black min-h-[calc(100vh-80px)]">
                {/* Filters */}
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setRoleFilter(null)}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${!roleFilter
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-white text-gray-500 hover:bg-gray-50 dark:bg-[#1a1a1a] dark:text-gray-400 dark:hover:bg-[#222]"
                            }`}
                    >
                        Tous
                    </button>
                    <button
                        onClick={() => setRoleFilter("ADMIN")}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${roleFilter === "ADMIN"
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-white text-gray-500 hover:bg-gray-50 dark:bg-[#1a1a1a] dark:text-gray-400 dark:hover:bg-[#222]"
                            }`}
                    >
                        Admins
                    </button>
                    <button
                        onClick={() => setRoleFilter("SUPER_ADMIN")}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${roleFilter === "SUPER_ADMIN"
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-white text-gray-500 hover:bg-gray-50 dark:bg-[#1a1a1a] dark:text-gray-400 dark:hover:bg-[#222]"
                            }`}
                    >
                        Super Admins
                    </button>
                </div>

                {/* Team List */}
                {filtered.length === 0 ? (
                    <div className="mt-20 flex flex-col items-center justify-center">
                        <h3 className="mb-2 text-xl font-bold text-[#2f2f2f] dark:text-white">
                            Aucun membre trouvé
                        </h3>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filtered.map((member) => (
                            <div
                                key={member.id}
                                className="group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-[#ece7ef] bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-[#1a1a1a] dark:border-[#333] dark:hover:bg-[#222]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e0e0e0] text-lg font-bold text-[#6a6a6a] overflow-hidden dark:bg-[#333] dark:text-white">
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                                        ) : (
                                            member.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-[#2f2f2f] dark:text-white">
                                                {member.name}
                                                {member.id === currentUserId && <span className="ml-2 text-xs font-normal text-gray-400">(Vous)</span>}
                                            </h3>
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${member.role === "SUPER_ADMIN"
                                                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                                                    : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                                }`}>
                                                {member.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#6a6a6a] dark:text-gray-400">
                                            {member.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-100 md:opacity-0 transition md:group-hover:opacity-100">
                                    <button
                                        onClick={() => setEditingMember(member)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[#4a4a4a] transition hover:bg-gray-50 hover:text-black dark:bg-[#333] dark:border-[#444] dark:text-white dark:hover:bg-[#444]"
                                        title="Modifier"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                        </svg>
                                    </button>
                                    {member.id !== currentUserId && (
                                        <button
                                            onClick={() => setDeleteMember(member)}
                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50 hover:text-red-500 hover:border-red-200 dark:bg-[#333] dark:border-[#444] dark:text-white dark:hover:bg-[#444]"
                                            title="Supprimer"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modals */}
            {showCreateModal && (
                <TeamMemberModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleCreate}
                />
            )}

            {editingMember && (
                <TeamMemberModal
                    member={editingMember}
                    onClose={() => setEditingMember(null)}
                    onSave={handleUpdate}
                />
            )}

            {deleteMember && (
                <DeleteConfirmModal
                    projectName={deleteMember.name}
                    onConfirm={handleDelete}
                    loading={deleteLoading}
                    onCancel={() => setDeleteMember(null)}
                />
            )}
        </>
    );
}
