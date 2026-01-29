"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Archive, FileText, ExternalLink, RefreshCw, X, Download, Send, Users, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { SubmissionPDF } from "./SubmissionPDF";

const PDFDownloadLink = dynamic(() => import("@react-pdf/renderer").then(mod => mod.PDFDownloadLink), {
    ssr: false,
    loading: () => <span className="text-xs">Chargement...</span>
});

type Form = {
    id: string;
    title: string;
    slug: string;
    description?: string;
    _count: { submissions: number };
    createdAt: string;
};

type Submission = {
    id: string;
    formId: string;
    form: Form;
    content: string; // JSON string
    status: string; // NEW, ARCHIVED
    createdAt: string;
};

export default function FormsClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [forms, setForms] = useState<Form[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<"dashboard" | "create">("dashboard");
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    // Send Form State
    const [isSending, setIsSending] = useState(false);
    const [sendModalOpen, setSendModalOpen] = useState(false);
    const [sendMethod, setSendMethod] = useState<"dashboard" | "email" | "both">("both");
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [selectedFormId, setSelectedFormId] = useState("");

    // New Form State (Keeping existing logic if needed, but UI replaced)
    const [newFormTitle, setNewFormTitle] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const viewParam = searchParams.get("view");
        const idParam = searchParams.get("id");

        if (viewParam === "submission" && idParam && submissions.length > 0) {
            const sub = submissions.find(s => s.id === idParam);
            if (sub) setSelectedSubmission(sub);
        }
    }, [searchParams, submissions]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [formsRes, subsRes] = await Promise.all([
                fetch("/api/forms"),
                fetch("/api/forms/submissions")
            ]);
            if (formsRes.ok) setForms(await formsRes.json());
            if (subsRes.ok) setSubmissions(await subsRes.json());
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        if (users.length > 0) return;
        setLoadingUsers(true);
        try {
            const res = await fetch("/api/admin/users"); // Reuse existing endpoint
            if (res.ok) setUsers(await res.json());
        } catch (error) { console.error(error); }
        finally { setLoadingUsers(false); }
    };

    const handleSendForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFormId || selectedRecipients.length === 0) return;

        setIsSending(true);
        try {
            const res = await fetch("/api/forms/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    formId: selectedFormId,
                    recipientIds: selectedRecipients,
                    method: sendMethod
                })
            });

            if (res.ok) {
                setSendModalOpen(false);
                setSelectedRecipients([]);
                setSendMethod("both");
                alert("Formulaire envoyé avec succès !");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const toggleRecipient = (userId: string) => {
        if (selectedRecipients.includes(userId)) {
            setSelectedRecipients(prev => prev.filter(id => id !== userId));
        } else {
            setSelectedRecipients(prev => [...prev, userId]);
        }
    };

    // Removed Creation Logic from UI, keeping function if needed internally or removing.
    // Keeping for safety if referenced, but replaced in UI.

    const handleDeleteSubmission = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // prevent modal open
        if (!confirm("Supprimer cette réponse ?")) return;
        try {
            const res = await fetch(`/api/forms/submissions/${id}`, { method: "DELETE" });
            if (res.ok) {
                setSubmissions(prev => prev.filter(s => s.id !== id));
                if (selectedSubmission?.id === id) setSelectedSubmission(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleArchiveSubmission = async (id: string, currentStatus: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newStatus = currentStatus === "ARCHIVED" ? "NEW" : "ARCHIVED";
        try {
            const res = await fetch(`/api/forms/submissions/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
            }
        } catch (error) {
            console.error(error);
        }
    };



    return (
        <div className="flex h-full flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Formulaires</h1>
                    <p className="text-sm text-gray-500">Gérez vos formulaires et les réponses reçues.</p>
                </div>
                <button
                    onClick={() => {
                        setSendModalOpen(true);
                        fetchUsers();
                        if (forms.length > 0 && !selectedFormId) setSelectedFormId(forms[0].id);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 hover:bg-gray-800 transition-all dark:bg-white dark:text-black"
                >
                    <Send className="h-4 w-4" />
                    Envoyer un formulaire
                </button>
            </div>

            {sendModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl dark:bg-[#111] dark:border dark:border-[#333] overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-[#333] flex justify-between items-center">
                            <h2 className="font-bold text-lg dark:text-white">Envoyer un formulaire</h2>
                            <button onClick={() => setSendModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Formulaire</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white outline-none focus:border-black"
                                    value={selectedFormId}
                                    onChange={e => setSelectedFormId(e.target.value)}
                                >
                                    {forms.map(f => (
                                        <option key={f.id} value={f.id}>{f.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Destinataires</label>
                                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 dark:border-[#333]">
                                    {loadingUsers ? <p className="text-xs text-center p-2 text-gray-400">Chargement...</p> :
                                        users.map(u => (
                                            <div
                                                key={u.id}
                                                onClick={() => toggleRecipient(u.id)}
                                                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition ${selectedRecipients.includes(u.id) ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-gray-50 dark:hover:bg-[#222]'}`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedRecipients.includes(u.id) ? 'border-transparent bg-white/20' : 'border-gray-300'}`}>
                                                    {selectedRecipients.includes(u.id) && <Check className="w-3 h-3" />}
                                                </div>
                                                <div className="text-sm font-medium">{u.name}</div>
                                                <div className="text-xs opacity-60 ml-auto">{u.email}</div>
                                            </div>
                                        ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{selectedRecipients.length} sélectionné(s)</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Méthode d'envoi</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: "both", label: "Les deux" },
                                        { id: "email", label: "Email" },
                                        { id: "dashboard", label: "Dashboard" }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setSendMethod(opt.id as any)}
                                            className={`p-2 text-sm font-medium rounded-lg border transition ${sendMethod === opt.id ? 'bg-black text-white border-black dark:bg-white dark:text-black' : 'border-gray-200 hover:bg-gray-50 dark:border-[#333] dark:hover:bg-[#222] dark:text-gray-300'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSendForm}
                                disabled={isSending || !selectedFormId || selectedRecipients.length === 0}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {isSending ? "Envoi..." : "Envoyer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {view === "create" && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:bg-[#111] dark:border-[#333]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Nouveau Formulaire</h2>
                        <button onClick={() => setView("dashboard")}><X className="h-5 w-5" /></button>
                    </div>
                    {/* ... form ... */}
                </div>
            )}

            {/* Permanent Forms Section */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Formulaire Principal</h3>
                <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5 dark:bg-blue-900/10 dark:border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Demande de Projet Public</h3>
                            <p className="text-sm text-gray-500">Formulaire complet qualifié (8 étapes) accessible à tous sans connexion.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-gray-500 select-all dark:bg-[#111] dark:border-[#333]">
                            {origin}/f/demande-de-projet
                        </div>
                        <a
                            href="/f/demande-de-projet"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whitespace-nowrap flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Ouvrir le formulaire
                        </a>
                    </div>
                </div>
            </div>

            {/* My Forms List */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Autres Formulaires</h3>
                {forms.filter(f => f.slug !== "demande-de-projet").length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Aucun autre formulaire créé.</p>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-3">
                        {forms.filter(f => f.slug !== "demande-de-projet").map(form => (
                            <div key={form.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:bg-[#111] dark:border-[#333] hover:border-gray-300 transition-colors">
                                {/* ... card content ... */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{form.title}</h3>
                                        <p className="text-xs text-gray-500">{form._count.submissions} réponse(s)</p>
                                    </div>
                                    <a
                                        href={`/f/${form.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition"
                                        title="Voir le formulaire public"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                                <div className="mt-3">
                                    <div className="text-xs text-gray-400 font-mono bg-gray-50 p-2 rounded truncate dark:bg-[#222]">
                                        /f/{form.slug}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="h-px bg-gray-200 dark:bg-[#333]" />

            {/* Submissions Inbox */}
            <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:bg-[#111] dark:border-[#333] flex flex-col">
                <div className="border-b border-gray-200 p-4 dark:border-[#333] flex justify-between items-center">
                    <h2 className="font-semibold">Boîte de réception</h2>
                    <button onClick={fetchData} className="text-gray-400 hover:text-black"><RefreshCw className="h-4 w-4" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-0">
                    {submissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
                            <FileText className="h-8 w-8 mb-2 opacity-20" />
                            Aucune réponse pour le moment
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-[#222] dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Formulaire</th>
                                    <th className="px-6 py-3 font-medium">Utilisateur</th>
                                    <th className="px-6 py-3 font-medium">Contenu</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[#333]">
                                {submissions.map(sub => {
                                    let contentPreview = "Données invalides";
                                    try {
                                        const parsed = JSON.parse(sub.content);
                                        // Take first 2 values
                                        contentPreview = Object.values(parsed).slice(0, 2).join(", ");
                                    } catch (e) { }

                                    return (
                                        <tr
                                            key={sub.id}
                                            onClick={() => setSelectedSubmission(sub)}
                                            className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-[#222] ${sub.status === 'ARCHIVED' ? 'opacity-50 bg-gray-50/50' : ''}`}
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {sub.form?.title || "Inconnu"}
                                                {sub.status === 'ARCHIVED' && <span className="ml-2 text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">ARCHIVÉ</span>}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                {/* @ts-ignore */}
                                                {sub.user ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                            {/* @ts-ignore */}
                                                            {sub.user.name.charAt(0)}
                                                        </div>
                                                        {/* @ts-ignore */}
                                                        <span className="truncate max-w-[100px]">{sub.user.name}</span>
                                                    </div>
                                                ) : "Anonyme"}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{contentPreview}</td>
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(sub.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => handleArchiveSubmission(sub.id, sub.status, e)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                        title={sub.status === 'ARCHIVED' ? "Désarchiver" : "Archiver"}
                                                    >
                                                        <Archive className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteSubmission(sub.id, e)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] dark:bg-[#1a1a1a]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center dark:border-[#333]">
                            <div>
                                <h3 className="text-xl font-bold dark:text-white">Détail de la réponse</h3>
                                <p className="text-sm text-gray-500">Formulaire: {selectedSubmission.form?.title}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* PDF Button */}
                                <div className="hidden sm:block">
                                    <PDFDownloadLink
                                        document={<SubmissionPDF submission={selectedSubmission} formTitle={selectedSubmission.form?.title} />}
                                        fileName={`reponse-${selectedSubmission.id}.pdf`}
                                        className="flex items-center gap-2 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition"
                                    >
                                        {/* @ts-ignore */}
                                        {({ loading }) => (loading ? 'Chargement...' : <><Download className="h-3 w-3" /> PDF</>)}
                                    </PDFDownloadLink>
                                </div>
                                <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-[#333] text-gray-500"><X className="h-5 w-5" /></button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto bg-gray-50 dark:bg-[#111]">
                            <pre className="text-sm font-sans whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                {(() => {
                                    try {
                                        const parsed = JSON.parse(selectedSubmission.content);
                                        return Object.entries(parsed).map(([k, v]) => (
                                            <div key={k} className="mb-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm dark:bg-[#222] dark:border-[#333]">
                                                <div className="text-xs font-bold text-gray-400 uppercase mb-1">{k}</div>
                                                <div className="text-base text-gray-900 dark:text-gray-100">{String(v)}</div>
                                            </div>
                                        ));
                                    } catch (e) { return "Données corrompues"; }
                                })()}
                            </pre>
                        </div>
                        {/* Mobile PDF Button */}
                        <div className="p-4 border-t border-gray-100 sm:hidden dark:border-[#333]">
                            <PDFDownloadLink
                                document={<SubmissionPDF submission={selectedSubmission} formTitle={selectedSubmission.form?.title} />}
                                fileName={`reponse-${selectedSubmission.id}.pdf`}
                                className="flex w-full justify-center items-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white"
                            >
                                {/* @ts-ignore */}
                                {({ loading }) => (loading ? 'Chargement...' : 'Télécharger PDF')}
                            </PDFDownloadLink>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
