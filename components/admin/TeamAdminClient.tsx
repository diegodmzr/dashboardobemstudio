"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import TeamMemberModal, { TeamMemberFormData } from "./TeamMemberModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Disable2FAModal from "./Disable2FAModal";
import { Search, Plus, Shield, User, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "@/components/Toast";

type TeamMember = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    twoFactorEnabled: boolean;
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
    const { toasts, success, error, removeToast } = useToast();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [deleteMember, setDeleteMember] = useState<TeamMember | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [disabling2FAMember, setDisabling2FAMember] = useState<TeamMember | null>(null);
    const [disable2FALoading, setDisable2FALoading] = useState(false);

    const handleDisable2FA = async () => {
        if (!disabling2FAMember) return;
        setDisable2FALoading(true);
        try {
            const res = await fetch(`/api/clients/${disabling2FAMember.id}/disable-2fa`, {
                method: "POST"
            });
            if (res.ok) {
                success("2FA désactivée avec succès !");
                setDisabling2FAMember(null);
                router.refresh();
            } else {
                error("Erreur lors de la désactivation");
            }
        } catch (err) {
            error("Une erreur est survenue");
        } finally {
            setDisable2FALoading(false);
        }
    };

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

            success("Membre ajouté !");
            setShowCreateModal(false);
            router.refresh();
        } catch (err: any) {
            error(err.message || "Erreur de création");
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
                throw new Error(err.error || "Erreur de modification");
            }

            success("Membre mis à jour !");
            setEditingMember(null);
            router.refresh();
        } catch (err: any) {
            error(err.message || "Erreur de modification");
        }
    };

    const handleDelete = async () => {
        if (!deleteMember) return;
        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/admin/team/${deleteMember.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Erreur de suppression");

            success("Membre supprimé !");
            setDeleteMember(null);
            router.refresh();
        } catch (err: any) {
            error(err.message || "Erreur de suppression");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f8f6fb] dark:bg-black min-h-screen">
            <Toast toasts={toasts} onRemove={removeToast} />

            {/* Top Bar Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ece7ef] bg-white px-4 md:px-8 py-4 dark:bg-[#111] dark:border-[#333]">
                <div className="flex w-full md:w-auto items-center gap-4">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                    className="w-full md:w-auto cursor-pointer rounded-full bg-black px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nouveau membre</span>
                </button>
            </div>

            <main className="flex-1 px-4 md:px-8 py-6">
                {/* Filters */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {[{ label: "Tous", val: null }, { label: "Admins", val: "ADMIN" }, { label: "Super Admins", val: "SUPER_ADMIN" }].map((opt) => (
                            <button
                                key={opt.label}
                                onClick={() => setRoleFilter(opt.val)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                                    roleFilter === opt.val
                                        ? "bg-black text-white dark:bg-white dark:text-black"
                                        : "bg-white border border-[#ece7ef] text-[#6a6a6a] hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}

                        {(roleFilter || search) && (
                            <button
                                onClick={() => { setSearch(""); setRoleFilter(null); }}
                                className="ml-2 text-xs font-semibold text-rose-500 hover:text-rose-600 transition"
                            >
                                Réinitialiser
                            </button>
                        )}
                    </div>
                </div>

                {/* Team List */}
                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                        <div className="mt-20 flex flex-col items-center justify-center">
                            <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#f8f6fb] to-[#ece7ef] dark:from-[#333] dark:to-[#222]">
                                <User className="h-16 w-16 text-[#8b7aa8] dark:text-white" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-[#2f2f2f] dark:text-white">Aucun membre trouvé</h3>
                            <p className="text-sm text-[#6a6a6a] dark:text-gray-400">Essayez de modifier vos filtres.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filtered.map((member) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={member.id}
                                    className="group relative flex flex-col md:flex-row cursor-pointer items-start md:items-center justify-between gap-4 rounded-2xl border border-[#ece7ef] bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-[#1a1a1a] dark:border-[#333] dark:hover:bg-[#222]"
                                    onClick={() => setEditingMember(member)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f4f6] dark:bg-[#333] overflow-hidden">
                                            {member.avatar ? (
                                                <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-lg font-bold text-[#6a6a6a] dark:text-gray-400">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-[#2f2f2f] dark:text-white">{member.name}</h3>
                                                {member.id === currentUserId && (
                                                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">Vous</span>
                                                )}
                                                {member.twoFactorEnabled && (
                                                    <Shield size={12} className="text-emerald-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-[#6a6a6a] dark:text-gray-400">{member.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-8">
                                        <div className="text-right">
                                            <p className="text-xs font-bold uppercase tracking-wide text-[#8a8a8a] dark:text-gray-500">Rôle</p>
                                            <span className={cn(
                                                "text-sm font-bold",
                                                member.role === "SUPER_ADMIN" ? "text-indigo-600 dark:text-indigo-400" : "text-blue-600 dark:text-blue-400"
                                            )}>
                                                {member.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-100 md:opacity-0 transition md:group-hover:opacity-100">
                                            {member.twoFactorEnabled && member.id !== currentUserId && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setDisabling2FAMember(member); }}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-600 transition hover:bg-emerald-50 dark:bg-[#333] dark:border-emerald-900/50 dark:text-emerald-400"
                                                    title="Désactiver 2FA"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingMember(member); }}
                                                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[#4a4a4a] transition hover:bg-gray-50 hover:text-black dark:bg-[#333] dark:border-[#444] dark:text-white dark:hover:bg-[#444]"
                                                title="Modifier"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            {member.id !== currentUserId && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setDeleteMember(member); }}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50 hover:text-red-500 hover:border-red-200 dark:bg-[#333] dark:border-[#444] dark:text-white dark:hover:bg-[#444]"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </main>

            <AnimatePresence>
                {showCreateModal && (
                    <TeamMemberModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onSave={handleCreate}
                    />
                )}
                {editingMember && (
                    <TeamMemberModal
                        isOpen={!!editingMember}
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
                {disabling2FAMember && (
                    <Disable2FAModal
                        userName={disabling2FAMember.name}
                        onConfirm={handleDisable2FA}
                        onCancel={() => setDisabling2FAMember(null)}
                        loading={disable2FALoading}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
