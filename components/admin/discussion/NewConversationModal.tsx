"use client";

import { useState, useEffect, useRef } from "react";
import { X, Check, Search, User as UserIcon, Paperclip, FileIcon } from "lucide-react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
};

type UserData = {
    id: string;
    name: string;
    avatar: string | null;
    email: string;
    role: string;
    companyName: string | null;
};

type Attachment = {
    filename: string;
    url: string;
    mimeType: string;
    size: number;
    file?: File; // For preview/management before upload
    uploading?: boolean;
};

export default function NewConversationModal({ isOpen, onClose, onCreated }: Props) {
    // Form state
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("PROJET");
    const [type, setType] = useState("Question");
    const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    // UI state
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Categories
    const CATEGORIES = ["PROJET", "SUPPORT", "FACTURATION", "AUTRE"];
    const TYPES = ["Question", "Problème", "Demande", "Information", "Autre"];

    // Click outside listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch users (Clients) on mount
    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (user: UserData) => {
        if (selectedUsers.some(u => u.id === user.id)) {
            setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
            setSearchQuery(""); // Clear search
        }
    };

    const removeUser = (userId: string) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);

            // Start upload process for new files
            const newAttachments: Attachment[] = files.map(file => ({
                filename: file.name,
                url: "", // Temporary
                mimeType: file.type,
                size: file.size,
                file: file,
                uploading: true
            }));

            setAttachments(prev => [...prev, ...newAttachments]);

            // Perform uploads sequentially (or parallel)
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
                        console.error("Upload failed for", att.filename);
                        // Remove failed upload
                        setAttachments(prev => prev.filter(p => p !== att));
                    }
                } catch (error) {
                    console.error("Upload error", error);
                    setAttachments(prev => prev.filter(p => p !== att));
                }
            }
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!subject || !content || selectedUsers.length === 0) return;
        // Block if uploading
        if (attachments.some(a => a.uploading)) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/discussions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject,
                    content,
                    recipientIds: selectedUsers.map(u => u.id),
                    category,
                    type,
                    attachments: attachments.map(a => ({
                        filename: a.filename,
                        url: a.url,
                        mimeType: a.mimeType,
                        size: a.size
                    }))
                })
            });

            if (res.ok) {
                onCreated();
                // Reset form
                setSubject("");
                setContent("");
                setSelectedUsers([]);
                setAttachments([]);
                setCategory("PROJET");
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    // Filter users for dropdown
    const filteredUsers = users.filter(u =>
        !selectedUsers.some(selected => selected.id === u.id) &&
        (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.companyName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-scaleIn flex flex-col max-h-[90vh] dark:bg-[#111] dark:ring-1 dark:ring-[#333]">
                {/* Header */}
                <div className="px-4 py-4 md:px-6 border-b border-gray-100 flex justify-between items-center bg-white z-10 dark:bg-[#111] dark:border-[#333]">
                    <h3 className="font-bold text-lg dark:text-white">Nouvelle discussion</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-[#222]">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6 space-y-6 overflow-y-auto">

                    {/* Recipients Multi-Select */}
                    <div className="relative" ref={dropdownRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">Participants</label>
                        <div
                            className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-xl min-h-[48px] focus-within:ring-2 focus-within:ring-black/5 bg-white transition hover:border-gray-300 dark:bg-[#1a1a1a] dark:border-[#333] dark:focus-within:ring-white/10"
                            onClick={() => setShowUserDropdown(true)}
                        >
                            {selectedUsers.map(user => (
                                <div key={user.id} className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium border border-gray-200 dark:bg-[#222] dark:border-[#333] dark:text-gray-200">
                                    <div className="w-4 h-4 rounded-full bg-gray-300 overflow-hidden">
                                        {user.avatar ? (
                                            <img src={user.avatar} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-gray-600">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    {user.name}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeUser(user.id); }}
                                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5 dark:hover:bg-[#333]"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <input
                                className="flex-1 min-w-[120px] outline-none bg-transparent text-sm py-1 dark:text-white"
                                placeholder={selectedUsers.length === 0 ? "Rechercher un client..." : ""}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowUserDropdown(true);
                                }}
                                onFocus={() => setShowUserDropdown(true)}
                            />
                        </div>

                        {/* Dropdown Menu */}
                        {showUserDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto z-20 dark:bg-[#1a1a1a] dark:border-[#333]">
                                {loading ? (
                                    <div className="p-4 text-center text-xs text-gray-400">Chargement...</div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-gray-400">Aucun utilisateur trouvé</div>
                                ) : (
                                    filteredUsers.map(user => (
                                        <div
                                            key={user.id}
                                            onClick={() => toggleUser(user)}
                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition dark:hover:bg-[#222]"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200 dark:bg-[#333] dark:border-[#444]">
                                                {user.avatar ? (
                                                    <img src={user.avatar} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                                                    {user.companyName ? `${user.companyName} • ` : ""}{user.email}
                                                </p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-transparent hover:text-gray-300 dark:border-[#444]">
                                                <PlusIcon className="w-4 h-4" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Metadata Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">Catégorie</label>
                            <CustomSelect
                                options={CATEGORIES}
                                value={category}
                                onChange={setCategory}
                                placeholder="Sélectionner une catégorie"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">Type</label>
                            <CustomSelect
                                options={TYPES}
                                value={type}
                                onChange={setType}
                                placeholder="Sélectionner un type"
                            />
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">Sujet</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            placeholder="Ex: Refonte de la page contact"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">Message</label>
                        <textarea
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition min-h-[150px] resize-none dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            placeholder="Décrivez votre demande..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* Attachments */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">Pièces jointes</label>
                        <div className="flex flex-wrap gap-3">
                            {attachments.map((att, i) => (
                                <div key={i} className="relative group">
                                    <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-2 text-center dark:bg-[#1a1a1a] dark:border-[#333]">
                                        {att.uploading ? (
                                            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin dark:border-white dark:border-t-transparent"></div>
                                        ) : att.mimeType.startsWith("image/") ? (
                                            <img src={att.url} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <FileIcon className="w-8 h-8 text-gray-400" />
                                        )}
                                        {!att.mimeType.startsWith("image/") && (
                                            <span className="text-[9px] text-gray-500 mt-1 truncate w-full">{att.filename}</span>
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

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-20 h-20 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-black hover:border-black hover:bg-gray-50 transition cursor-pointer dark:border-[#444] dark:hover:text-white dark:hover:bg-[#1a1a1a] dark:hover:border-[#666]"
                            >
                                <Paperclip className="w-6 h-6 mb-1" />
                                <span className="text-[10px]">Ajouter</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                onChange={handleFileSelect}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-4 md:px-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-100 dark:bg-[#1a1a1a] dark:border-[#333]">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition dark:text-gray-400 dark:hover:bg-[#333]">
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !subject || !content || selectedUsers.length === 0 || attachments.some(a => a.uploading)}
                        className="px-6 py-2 text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        {submitting ? "Envoi..." : (
                            <>
                                <Check className="w-4 h-4" />
                                Créer la discussion
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
    );
}

function CustomSelect({ options, value, onChange, placeholder }: { options: string[], value: string, onChange: (val: string) => void, placeholder: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition text-sm text-left dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
            >
                <span className={value ? "text-gray-900 dark:text-white" : "text-gray-400"}>
                    {value || placeholder}
                </span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto animate-scaleIn dark:bg-[#1a1a1a] dark:border-[#333]">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => {
                                onChange(opt);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition dark:hover:bg-[#222] ${value === opt ? "bg-black/5 font-semibold dark:bg-white/10" : "text-gray-700 dark:text-gray-300"}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
