"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import TeamMemberModal, { TeamMemberFormData } from "./TeamMemberModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Disable2FAModal from "./Disable2FAModal";
import { Search, Plus, Mail, Shield, User, Edit2, Trash2, ShieldCheck, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
    const { success, error } = useToast();
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
        <div className="flex flex-col h-full bg-[#fcfcfd] dark:bg-black">
            {/* Header Area */}
            <div className="flex flex-col gap-6 p-4 md:p-8 md:pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-[#1f1f1f] dark:text-white">
                            Gestion d&apos;Équipe
                        </h1>
                        <p className="text-sm text-[#8a8a8a] dark:text-gray-400 mt-1">
                            Administrez les accès et rôles des membres de l&apos;agence.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-black text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-zinc-800 transition-all shadow-xl active:scale-95 dark:bg-white dark:text-black flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nouveau membre
                    </button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-white/50 dark:bg-white/5 p-2 rounded-[24px] border border-white/20 backdrop-blur-sm">
                    <div className="relative flex-1 w-full md:w-auto">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-black dark:group-focus-within:text-white" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou email..."
                            className="w-full pl-11 pr-4 py-2.5 bg-transparent border-none text-sm focus:outline-none dark:text-white outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

                    <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-hide w-full md:w-auto">
                        {[{ label: "Tous", val: null }, { label: "Admins", val: "ADMIN" }, { label: "Super Admins", val: "SUPER_ADMIN" }].map((opt) => (
                            <button
                                key={opt.label}
                                onClick={() => setRoleFilter(opt.val)}
                                className={cn(
                                    "whitespace-nowrap px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-300",
                                    roleFilter === opt.val
                                        ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                                        : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content List */}
            <main className="flex-1 p-4 md:p-8 pt-6">
                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-64 flex flex-col items-center justify-center text-zinc-400"
                        >
                            <User className="w-12 h-12 mb-4 opacity-10" />
                            <p className="font-semibold">Aucun membre trouvé</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {filtered.map((member, index) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={member.id}
                                    className={cn(
                                        "group relative flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 rounded-[32px] transition-all duration-300 border",
                                        member.id === currentUserId
                                            ? "bg-white border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:bg-[#1a1a1a] dark:border-white/10"
                                            : "bg-white/50 border-zinc-100 dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800"
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <div className="w-16 h-16 rounded-[22px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden ring-4 ring-zinc-50 dark:ring-white/5 transition-transform group-hover:scale-105 duration-500">
                                            {member.avatar ? (
                                                <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-xl font-semibold text-zinc-400">{member.name.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        {member.role === "SUPER_ADMIN" && (
                                            <div className="absolute -top-2 -right-2 bg-purple-500 text-white p-1 rounded-lg shadow-lg">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white truncate">
                                                {member.name}
                                                {member.id === currentUserId && (
                                                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Vous</span>
                                                )}
                                            </h3>
                                            {member.twoFactorEnabled && (
                                                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                    <Shield size={10} /> 2FA
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-sm text-[#8a8a8a] dark:text-zinc-500">
                                                <Mail className="w-3.5 h-3.5" />
                                                <span className="truncate">{member.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest",
                                                    member.role === "SUPER_ADMIN"
                                                        ? "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                                                        : "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                                                )}>
                                                    {member.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-4 sm:pt-0 sm:absolute sm:top-6 sm:right-6 sm:opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        {member.twoFactorEnabled && member.id !== currentUserId && (
                                            <button
                                                onClick={() => setDisabling2FAMember(member)}
                                                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95 border border-emerald-100 dark:border-emerald-500/20"
                                                title="Désactiver 2FA"
                                            >
                                                <Shield className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setEditingMember(member)}
                                            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm active:scale-95"
                                            title="Modifier"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {member.id !== currentUserId && (
                                            <button
                                                onClick={() => setDeleteMember(member)}
                                                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
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
