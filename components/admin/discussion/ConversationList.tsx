"use client";

import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import NewConversationModal from "./NewConversationModal";

type Props = {
    selectedId: string | null;
    onSelect: (id: string) => void;
};

export default function ConversationList({ selectedId, onSelect }: Props) {
    const [search, setSearch] = useState("");
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await fetch("/api/discussions");
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = conversations.filter(c =>
        c.subject?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            <NewConversationModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                onCreated={() => {
                    fetchConversations();
                    setShowNewModal(false);
                }}
            />

            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-[#333]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg dark:text-white">Messages</h2>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition dark:bg-white dark:text-black"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-gray-400 text-sm">Chargement...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">Aucune conversation</div>
                ) : (
                    filtered.map((conv) => {
                        // Find the "other" participant (Client usually) to show avatar
                        // For now we just take the first one
                        const otherParticipant = conv.participants?.[0]?.user;
                        const lastMessage = conv.messages?.[0];

                        return (
                            <div
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                className={`p-4 border-b border-gray-50 cursor-pointer transition hover:bg-gray-50 dark:border-[#222] dark:hover:bg-[#1a1a1a] ${selectedId === conv.id ? "bg-gray-50 dark:bg-[#1a1a1a]" : ""}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold overflow-hidden">
                                            {otherParticipant?.avatar ? (
                                                <img src={otherParticipant.avatar} className="w-full h-full object-cover" />
                                            ) : (
                                                otherParticipant?.name?.charAt(0) || "?"
                                            )}
                                        </div>
                                        <span className="font-semibold text-sm text-gray-900 truncate max-w-[120px] dark:text-white">
                                            {otherParticipant?.name || "Inconnu"}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true, locale: fr }).replace("environ ", "")}
                                    </span>
                                </div>
                                <h3 className="font-medium text-sm text-gray-800 mb-1 truncate dark:text-gray-200">{conv.subject || "Sans sujet"}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 dark:text-gray-400">
                                    {lastMessage?.content || "Aucun message"}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${conv.status === 'OPEN' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        conv.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                        {conv.status === 'OPEN' ? 'Ouvert' : conv.status === 'IN_PROGRESS' ? 'En cours' : 'Clôturé'}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
