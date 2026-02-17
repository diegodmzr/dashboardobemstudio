"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Send, Paperclip, X, FileIcon, Download, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Props = {
    conversationId: string;
    currentUserId: string;
    onBack?: () => void;
};

type Attachment = {
    filename: string;
    url: string;
    mimeType: string;
    size: number;
    file?: File;
    uploading?: boolean;
};

export default function MessageThread({ conversationId, currentUserId, onBack }: Props) {
    const [message, setMessage] = useState("");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [mentionResults, setMentionResults] = useState<any[]>([]);
    const [cursorPosition, setCursorPosition] = useState<number>(0);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, messageId: string } | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    useEffect(() => {
        if (conversationId) {
            fetchConversation();
        }
    }, [conversationId]);

    // Close context menu on click
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [data?.messages]);



    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);

            const newAttachments: Attachment[] = files.map(file => ({
                filename: file.name,
                url: "",
                mimeType: file.type,
                size: file.size,
                file: file,
                uploading: true
            }));

            setAttachments(prev => [...prev, ...newAttachments]);

            for (const att of newAttachments) {
                if (!att.file) continue;
                const formData = new FormData();
                formData.append("file", att.file);

                try {
                    const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formData
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setAttachments(prev => prev.map(p =>
                            p.filename === att.filename && p.size === att.size
                                ? { ...p, url: data.url, uploading: false }
                                : p
                        ));
                    } else {
                        setAttachments(prev => prev.filter(p => p !== att));
                    }
                } catch (error) {
                    setAttachments(prev => prev.filter(p => p !== att));
                }
            }
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        if (!message.trim() && attachments.length === 0) return;
        if (attachments.some(a => a.uploading)) return;

        try {
            const res = await fetch(`/api/discussions/${conversationId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: message,
                    attachments: attachments.map(a => ({
                        filename: a.filename,
                        url: a.url,
                        mimeType: a.mimeType,
                        size: a.size
                    }))
                })
            });

            if (res.ok) {
                setMessage("");
                setAttachments([]);
                fetchConversation();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return;
        try {
            const res = await fetch(`/api/discussions/${conversationId}/messages/${messageId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchConversation();
                setData((prev: any) => ({
                    ...prev,
                    messages: prev.messages.filter((m: any) => m.id !== messageId)
                }));
            }
        } catch (error) { console.error(error); }
    };

    const startEditing = (msg: any) => {
        setEditingMessageId(msg.id);
        setEditContent(msg.content);
        setContextMenu(null);
    };

    const saveEdit = async () => {
        if (!editingMessageId || !editContent.trim()) return;
        try {
            const res = await fetch(`/api/discussions/${conversationId}/messages/${editingMessageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editContent })
            });

            if (res.ok) {
                fetchConversation();
                setEditingMessageId(null);
                setEditContent("");
            }
        } catch (error) { console.error(error); }
    };

    const handleContextMenu = (e: React.MouseEvent, messageId: string, isMe: boolean) => {
        if (!isMe) return;
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, messageId });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showMentions && mentionResults.length > 0) {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
            }
            if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                selectMention(mentionResults[0]);
                return;
            }
            if (e.key === "Escape") {
                setShowMentions(false);
                return;
            }
        }

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTextChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        const cursorPos = e.target.selectionStart;
        setMessage(val);
        setCursorPosition(cursorPos);

        const textBeforeCursor = val.substring(0, cursorPos);
        const lastAt = textBeforeCursor.lastIndexOf("@");

        if (lastAt !== -1) {
            const query = textBeforeCursor.substring(lastAt);
            if (!/\s/.test(query) && query.length > 1) {
                setMentionQuery(query);
                setShowMentions(true);

                try {
                    const res = await fetch(`/api/users/autocomplete?query=${encodeURIComponent(query)}`);
                    if (res.ok) {
                        const json = await res.json();
                        setMentionResults(json);
                    }
                } catch (err) { console.error(err); }
            } else {
                setShowMentions(false);
            }
        } else {
            setShowMentions(false);
        }
    };

    const selectMention = (user: any) => {
        const textBeforeCursor = message.substring(0, cursorPosition);
        const textAfterCursor = message.substring(cursorPosition);
        const lastAt = textBeforeCursor.lastIndexOf("@");
        const prefix = textBeforeCursor.substring(0, lastAt);

        const username = `@${user.username}`;
        const newMessage = prefix + username + " " + textAfterCursor;

        setMessage(newMessage);
        setShowMentions(false);
    };

    if (!data) return <div className="h-full flex items-center justify-center text-gray-400">Chargement...</div>;

    const otherParticipant = data.participants?.find((p: any) => p.role !== "ADMIN" && p.role !== "OWNER")?.user
        || data.participants?.[0]?.user;

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex gap-3 items-center bg-white dark:bg-[#111] dark:border-[#333]">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 md:hidden dark:hover:bg-[#222]"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                )}
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{data.subject}</h3>
                        {data.isArchived && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider dark:bg-amber-900/30 dark:text-amber-400">
                                Archivée
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {otherParticipant?.name} • Démarré le {new Date(data.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-white dark:bg-black/20" ref={scrollRef}>
                {data.messages?.map((msg: any) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                    {msg.sender?.name || "Utilisateur"}
                                </span>
                            </div>
                            <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${isMe
                                ? 'bg-black text-white dark:bg-[#333] dark:text-white'
                                : 'bg-gray-100 text-gray-900 border border-transparent dark:bg-[#222] dark:border-[#333] dark:text-gray-200'
                                }`}>

                                <div className="text-sm leading-relaxed" onContextMenu={(e) => handleContextMenu(e, msg.id, isMe)}>
                                    {editingMessageId === msg.id ? (
                                        <div className="min-w-[200px]" onClick={e => e.stopPropagation()}>
                                            <textarea
                                                className="w-full bg-white/10 p-2 rounded text-white outline-none resize-none border border-white/20"
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                rows={3}
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        saveEdit();
                                                    }
                                                    if (e.key === "Escape") setEditingMessageId(null);
                                                }}
                                            />
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={() => setEditingMessageId(null)} className="text-xs opacity-70 hover:opacity-100">Annuler</button>
                                                <button onClick={saveEdit} className="text-xs bg-white text-black px-2 py-1 rounded font-bold hover:bg-gray-200">Enregistrer</button>
                                            </div>
                                        </div>
                                    ) : (() => {
                                        const parseInline = (text: string) => {
                                            // Split by URL or Markdown style
                                            const parts = text.split(/((?:https?:\/\/[^\s]+)|(?:\*\*.*?\*\*)|(?:\*.*?\*)|(?:__.*?__))/g);
                                            return parts.map((part, idx) => {
                                                if (part.match(/^https?:\/\//)) {
                                                    return (
                                                        <a
                                                            key={idx}
                                                            href={part}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 hover:underline break-all"
                                                            onClick={(e) => e.stopPropagation()} // Prevent bubble click
                                                        >
                                                            {part}
                                                        </a>
                                                    );
                                                }
                                                if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                                                    return <strong key={idx} className="font-bold">{part.slice(2, -2)}</strong>;
                                                }
                                                if (part.startsWith('__') && part.endsWith('__') && part.length >= 4) {
                                                    return <u key={idx} className="underline underline-offset-2">{part.slice(2, -2)}</u>;
                                                }
                                                if (part.startsWith('*') && part.endsWith('*') && part.length >= 3) {
                                                    return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
                                                }
                                                return <span key={idx}>{part}</span>;
                                            });
                                        };

                                        return msg.content.split('\n').map((line: string, i: number) => {
                                            const trimmed = line.trim();
                                            if (line.startsWith('### ')) {
                                                return <h3 key={i} className="text-base font-bold mt-3 mb-1 underline decoration-dotted underline-offset-4 opacity-90">{parseInline(line.slice(4))}</h3>;
                                            }
                                            if (trimmed.startsWith('- ')) {
                                                return (
                                                    <div key={i} className="flex items-start gap-2 ml-1 mb-1">
                                                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" />
                                                        <span className="opacity-90">{parseInline(trimmed.slice(2))}</span>
                                                    </div>
                                                );
                                            }
                                            if (!trimmed) {
                                                return <div key={i} className="h-2" />;
                                            }
                                            return <p key={i} className="mb-0.5 min-h-[1.2em]">{parseInline(line)}</p>;
                                        });
                                    })()}
                                </div>

                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        {msg.attachments.map((att: any) => (
                                            <div key={att.id} className={`rounded-lg overflow-hidden border ${isMe ? 'border-gray-700' : 'border-gray-200'} bg-black/5 dark:bg-white/10`}>
                                                {att.mimeType.startsWith("image/") ? (
                                                    <a href={att.url} target="_blank" rel="noopener noreferrer">
                                                        <img src={att.url} alt={att.filename} className="w-full h-32 object-cover hover:opacity-90 transition" />
                                                    </a>
                                                ) : (
                                                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 hover:bg-black/10 transition">
                                                        <FileIcon className="w-5 h-5 opacity-70" />
                                                        <span className="text-xs truncate flex-1">{att.filename}</span>
                                                        <Download className="w-4 h-4 opacity-70" />
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <span className={`text-[10px] block mt-2 text-right ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                                    {format(new Date(msg.createdAt), "d MMM 'à' HH:mm", { locale: fr })}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 bg-white border-t border-gray-100 dark:bg-[#111] dark:border-[#333]">
                {attachments.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                        {attachments.map((att, i) => (
                            <div key={i} className="relative group flex-shrink-0">
                                <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden dark:bg-[#1a1a1a] dark:border-[#333]">
                                    {att.uploading ? (
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin dark:border-white"></div>
                                    ) : att.mimeType.startsWith("image/") ? (
                                        <img src={att.url} className="w-full h-full object-cover" />
                                    ) : (
                                        <FileIcon className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <button
                                    onClick={() => removeAttachment(i)}
                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="relative flex items-end gap-3 rounded-xl border border-gray-200 bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-black/5 dark:bg-[#1a1a1a] dark:border-[#333] dark:focus-within:ring-white/10">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-gray-600 transition dark:hover:text-gray-200"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={handleFileSelect}
                    />

                    {showMentions && mentionResults.length > 0 && (
                        <div className="absolute bottom-full mb-2 left-2 w-64 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-100 dark:border-[#333] overflow-hidden z-50">
                            {mentionResults.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => selectMention(u)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#222] transition text-left"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-800">
                                        {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-full object-cover" /> : u.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{u.name}</div>
                                        <div className="text-xs text-gray-500 text-lowercase">@{u.username}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleTextChange}
                        onKeyDown={handleKeyDown}
                        placeholder={data.isArchived ? "Cette conversation est archivée" : "Écrivez votre message..."}
                        className="flex-1 max-h-32 min-h-[44px] bg-transparent py-2.5 text-sm outline-none resize-none dark:text-white disabled:opacity-50"
                        rows={1}
                        disabled={data.isArchived}
                    />
                    <button
                        onClick={handleSend}
                        disabled={data.isArchived || (!message.trim() && attachments.length === 0) || attachments.some(a => a.uploading)}
                        className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 dark:bg-white dark:text-black"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>


            {/* Context Menu */}
            {
                contextMenu && (
                    <div
                        className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[150px] animate-scaleIn dark:bg-[#222] dark:border-[#333]"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => {
                                const msg = data.messages.find((m: any) => m.id === contextMenu.messageId);
                                if (msg) startEditing(msg);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 dark:text-white dark:hover:bg-[#333]"
                        >
                            <span>✏️</span> Modifier
                        </button>
                        <button
                            onClick={() => {
                                handleDeleteMessage(contextMenu.messageId);
                                setContextMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 dark:hover:bg-red-900/20"
                        >
                            <span>🗑️</span> Supprimer
                        </button>
                    </div>
                )
            }
        </div >
    );
}
