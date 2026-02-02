"use client";

import { SessionUser } from "@/lib/auth";
import { User, FileText, Clock, CheckCircle, Plus, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

type Props = {
    conversationId: string;
    currentUser: SessionUser | null;
};

type UserData = {
    id: string;
    name: string;
    avatar: string | null;
    email: string;
    role: string;
    companyName: string | null;
};

export default function ConversationDetail({ conversationId, currentUser }: Props) {
    const [data, setData] = useState<any>(null);
    const [showAddParticipant, setShowAddParticipant] = useState(false);
    const [users, setUsers] = useState<UserData[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const isUserAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";

    const addParticipantRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (conversationId) {
            fetchConversation();
        }
    }, [conversationId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addParticipantRef.current && !addParticipantRef.current.contains(event.target as Node)) {
                setShowAddParticipant(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchConversation = async () => {
        try {
            const res = await fetch(`/api/discussions/${conversationId}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUsers = async () => {
        if (users.length > 0) return;
        setLoadingUsers(true);
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const json = await res.json();
                setUsers(json);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const updateStatus = async (status: string) => {
        try {
            const res = await fetch(`/api/discussions/${conversationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setData((prev: any) => ({ ...prev, status }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addParticipant = async (userId: string) => {
        try {
            const res = await fetch(`/api/discussions/${conversationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ addParticipantId: userId })
            });

            if (res.ok) {
                setShowAddParticipant(false);
                fetchConversation();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!data) return null;

    const removeParticipant = async (userId: string) => {
        if (!confirm("Retirer ce participant ?")) return;
        try {
            const res = await fetch(`/api/discussions/${conversationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ removeParticipantId: userId })
            });

            if (res.ok) {
                fetchConversation();
            } else {
                const errorData = await res.text();
                alert("Erreur lors de la suppression : " + errorData);
            }
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue");
        }
    };

    const availableUsers = users.filter(u => !data.participants?.some((p: any) => p.userId === u.id));

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#111]">
            <div className="p-6 border-b border-gray-100 dark:border-[#333]">
                <h3 className="font-bold text-gray-900 mb-4 dark:text-white">Détails</h3>

                <div className="space-y-4">
                    <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Statut</span>
                        <div className="mt-2">
                            <select
                                value={data.status}
                                onChange={(e) => updateStatus(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-black dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white"
                            >
                                <option value="OPEN">Ouvert</option>
                                <option value="IN_PROGRESS">En cours</option>
                                <option value="CLOSED">Clôturé</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Participants</span>
                        <div className="mt-2 space-y-2">
                            {data.participants?.map((p: any) => (
                                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                        {p.user.avatar ? (
                                            <img src={p.user.avatar} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">
                                                {p.user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium dark:text-white truncate">{p.user.name}</p>
                                            {p.role === "OWNER" && (
                                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                    Créateur
                                                </span>
                                            )}
                                        </div>
                                        <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 ${p.user.role === "SUPER_ADMIN"
                                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                                : p.user.role === "ADMIN"
                                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                            }`}>
                                            {p.user.role === "SUPER_ADMIN" ? "Super Admin" : p.user.role === "ADMIN" ? "Admin" : "Client"}
                                        </span>
                                    </div>
                                    {isUserAdmin && p.role !== "OWNER" && (
                                        <button
                                            onClick={() => removeParticipant(p.user.id)}
                                            className="text-gray-400 hover:text-red-500 transition px-2"
                                            title="Retirer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="relative mt-2" ref={addParticipantRef}>
                            <button
                                onClick={() => {
                                    setShowAddParticipant(!showAddParticipant);
                                    if (!showAddParticipant) fetchUsers();
                                }}
                                className="text-xs font-semibold text-black hover:underline flex items-center gap-1 dark:text-gray-300"
                            >
                                <Plus className="w-3 h-3" /> Ajouter
                            </button>

                            {showAddParticipant && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden dark:bg-[#1a1a1a] dark:border-[#333]">
                                    <div className="p-2 max-h-48 overflow-y-auto">
                                        {loadingUsers ? (
                                            <div className="text-xs text-center p-2 text-gray-400">Chargement...</div>
                                        ) : availableUsers.length === 0 ? (
                                            <div className="text-xs text-center p-2 text-gray-400">Aucun utilisateur disponible</div>
                                        ) : (
                                            availableUsers.map(u => (
                                                <button
                                                    key={u.id}
                                                    onClick={() => addParticipant(u.id)}
                                                    className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-left transition dark:hover:bg-[#222]"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                        {u.avatar ? (
                                                            <img src={u.avatar} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                                {u.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm dark:text-white truncate">{u.name}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Pièces Jointes</span>
                <div className="mt-4 space-y-3">
                    {data.messages
                        ?.flatMap((m: any) => m.attachments || [])
                        .map((att: any, i: number) => (
                            <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition dark:hover:bg-[#1a1a1a]">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center dark:bg-[#222]">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate dark:text-white">{att.filename}</p>
                                    <p className="text-xs text-gray-400">{(att.size / 1024).toFixed(0)} KB</p>
                                </div>
                            </a>
                        ))}
                    {!data.messages?.some((m: any) => m.attachments?.length > 0) && (
                        <p className="text-xs text-gray-400 italic">Aucune pièce jointe</p>
                    )}
                </div>
            </div>
        </div>
    );
}
