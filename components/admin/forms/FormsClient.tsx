"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Archive, FileText, ExternalLink, RefreshCw, X, Download, Send, Users, Check, Edit2, Printer } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { SubmissionPDF } from "./SubmissionPDF";
import { BlankFormPDF } from "./BlankFormPDF";
import FormBuilder from "./FormBuilder";

const PDFDownloadLink = dynamic(() => import("@react-pdf/renderer").then(mod => mod.PDFDownloadLink), {
    ssr: false,
    loading: () => <span className="text-xs opacity-60">...</span>
});

type Form = {
    id: string;
    title: string;
    slug: string;
    description?: string;
    fields: string;
    isActive: boolean;
    _count: { submissions: number };
    createdAt: string;
};

type Submission = {
    id: string;
    formId: string;
    form: Form;
    user?: { id: string, name: string, email: string };
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
    const [view, setView] = useState<"dashboard" | "create" | "edit">("dashboard");
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [editingForm, setEditingForm] = useState<any>(null);

    // Send Form State
    const [isSending, setIsSending] = useState(false);
    const [sendModalOpen, setSendModalOpen] = useState(false);
    const [sendMethod, setSendMethod] = useState<"dashboard" | "email" | "both">("both");
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [selectedFormId, setSelectedFormId] = useState("");
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
            const res = await fetch("/api/admin/users");
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

    const handleSaveForm = async (formData: any) => {
        try {
            const isUpdate = view === "edit";
            const method = isUpdate ? "PATCH" : "POST";
            const res = await fetch("/api/forms", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(isUpdate ? { ...formData, id: editingForm.id } : formData)
            });
            if (res.ok) {
                fetchData();
                setView("dashboard");
                setEditingForm(null);
            } else {
                alert("Erreur lors de l'enregistrement");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditForm = (form: Form) => {
        let phases = [];
        try {
            const fields = JSON.parse(form.fields || "[]");
            if (Array.isArray(fields) && fields.length > 0 && (fields[0].phases || fields[0].fields)) {
                // It's already phases structure or old fields
                if (fields[0].fields) {
                    // It's the phases structure
                    phases = fields;
                } else {
                    // Not phases
                    phases = [{ id: "p1", title: "Phase 1", fields }];
                }
            } else {
                phases = [{ id: "p1", title: "Phase 1", fields }];
            }
        } catch (e) {
            phases = [{ id: "p1", title: "Phase 1", fields: [] }];
        }

        setEditingForm({ ...form, phases });
        setView("edit");
    };

    const handleDeleteForm = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Supprimer ce formulaire et toutes ses réponses ?")) return;
        try {
            const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });
            if (res.ok) {
                setForms(prev => prev.filter(f => f.id !== id));
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteSubmission = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
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
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setEditingForm(null);
                            setView("create");
                        }}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-all dark:bg-[#111] dark:border-[#333] dark:text-white dark:hover:bg-[#1a1a1a]"
                    >
                        <Plus className="h-4 w-4" />
                        Nouveau
                    </button>
                    <button
                        onClick={() => {
                            setSendModalOpen(true);
                            fetchUsers();
                            if (forms.length > 0 && !selectedFormId) setSelectedFormId(forms[0].id);
                        }}
                        className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 hover:bg-gray-800 transition-all dark:bg-white dark:text-black"
                    >
                        <Send className="h-4 w-4" />
                        Envoyer
                    </button>
                </div>
            </div>

            {sendModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl dark:bg-[#111] dark:border dark:border-[#333] overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-[#333] flex justify-between items-center">
                            <h2 className="font-bold text-lg dark:text-white">Envoyer un formulaire</h2>
                            <button onClick={() => setSendModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-end gap-2">
                                <div className="flex-1">
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
                                <button
                                    onClick={() => {
                                        setSendModalOpen(false);
                                        setEditingForm(null);
                                        setView("create");
                                    }}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-[#333] dark:hover:bg-[#1a1a1a]"
                                    title="Créer un nouveau formulaire"
                                >
                                    <Plus className="w-5 h-5 dark:text-white" />
                                </button>
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

            {(view === "create" || view === "edit") && (
                <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-8 dark:bg-[#111] dark:border-[#333]">
                    <FormBuilder
                        initialData={editingForm}
                        onSave={handleSaveForm}
                        onCancel={() => {
                            setView("dashboard");
                            setEditingForm(null);
                        }}
                    />
                </div>
            )}

            {view === "dashboard" && (
                <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
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
                                    Ouvrir
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
                                {forms.filter(f => f.slug !== "demande-de-projet").map(form => {
                                    // Parse phases for BlankFormPDF
                                    let blankPhases: any[] = [];
                                    try {
                                        const parsed = JSON.parse(form.fields || "[]");
                                        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].fields) {
                                            blankPhases = parsed;
                                        } else {
                                            blankPhases = [{ id: "p1", title: "Questions", fields: parsed }];
                                        }
                                    } catch { blankPhases = []; }

                                    return (
                                        <div key={form.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:bg-[#111] dark:border-[#333] hover:border-black transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{form.title}</h3>
                                                    <p className="text-xs text-gray-500">{form._count.submissions} réponse(s)</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleEditForm(form)}
                                                        className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition dark:hover:bg-[#222] dark:hover:text-white"
                                                        title="Modifier"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <a
                                                        href={`/f/${form.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition dark:hover:bg-blue-900/20"
                                                        title="Voir en ligne"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <div className="text-[10px] text-gray-400 font-mono bg-gray-50 p-2 rounded truncate dark:bg-[#1a1a1a]">
                                                    {origin}/f/{form.slug}
                                                </div>
                                            </div>
                                            {/* Blank PDF button */}
                                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#1a1a1a]">
                                                <PDFDownloadLink
                                                    document={<BlankFormPDF title={form.title} description={form.description} phases={blankPhases} />}
                                                    fileName={`formulaire-vierge-${form.slug}.pdf`}
                                                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-gray-600 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-xl transition-all dark:bg-[#1a1a1a] dark:text-gray-400 dark:hover:bg-[#222] dark:hover:text-white"
                                                >
                                                    {/* @ts-ignore */}
                                                    {({ loading }: any) => loading ? (
                                                        <span>Préparation...</span>
                                                    ) : (
                                                        <>
                                                            <Printer className="h-3.5 w-3.5" />
                                                            Exporter formulaire vierge
                                                        </>
                                                    )}
                                                </PDFDownloadLink>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-[#333]" />

                    {/* Submissions Inbox */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:bg-[#111] dark:border-[#333] flex flex-col">
                        <div className="border-b border-gray-200 p-4 dark:border-[#333] flex justify-between items-center">
                            <h2 className="font-semibold">Boîte de réception</h2>
                            <button onClick={fetchData} className="text-gray-400 hover:text-black transition-transform hover:rotate-180 duration-500"><RefreshCw className="h-4 w-4" /></button>
                        </div>

                        <div className="overflow-x-auto">
                            {submissions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-sm">
                                    <FileText className="h-8 w-8 mb-2 opacity-20" />
                                    Aucune réponse pour le moment
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500 dark:bg-[#1a1a1a] dark:text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Formulaire</th>
                                            <th className="px-6 py-3 font-medium">Utilisateur</th>
                                            <th className="px-6 py-3 font-medium">Extraits</th>
                                            <th className="px-6 py-3 font-medium">Date</th>
                                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-[#333]">
                                        {submissions.map(sub => {
                                            let contentPreview = "Données invalides";
                                            try {
                                                const parsed = JSON.parse(sub.content);
                                                contentPreview = Object.values(parsed).slice(0, 2).map(v => String(v)).join(", ");
                                            } catch (e) { }

                                            return (
                                                <tr
                                                    key={sub.id}
                                                    onClick={() => setSelectedSubmission(sub)}
                                                    className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a] ${sub.status === 'ARCHIVED' ? 'opacity-50' : ''}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900 dark:text-white line-clamp-1">{sub.form?.title || "Inconnu"}</div>
                                                        {sub.status === 'ARCHIVED' && <span className="text-[10px] text-gray-400">Archivé</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                        {/* @ts-ignore */}
                                                        {sub.user ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:bg-blue-900/30">
                                                                    {sub.user.name.charAt(0)}
                                                                </div>
                                                                <span className="truncate max-w-[100px]">{sub.user.name}</span>
                                                            </div>
                                                        ) : "Anonyme"}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]">{contentPreview}</td>
                                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(sub.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={(e) => handleArchiveSubmission(sub.id, sub.status, e)}
                                                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition dark:hover:bg-blue-900/20"
                                                                title={sub.status === 'ARCHIVED' ? "Désarchiver" : "Archiver"}
                                                            >
                                                                <Archive className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeleteSubmission(sub.id, e)}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition dark:hover:bg-red-900/20"
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
                </div>
            )}

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
                                <div className="hidden sm:block">
                                    <PDFDownloadLink
                                        document={<SubmissionPDF submission={{ ...selectedSubmission, form: { ...selectedSubmission.form, fields: selectedSubmission.form?.fields } }} formTitle={selectedSubmission.form?.title} />}
                                        fileName={`reponse-${selectedSubmission.id}.pdf`}
                                        className="flex items-center gap-2 rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition dark:bg-white dark:text-black"
                                    >
                                        {/* @ts-ignore */}
                                        {({ loading }: any) => loading
                                            ? <span className="opacity-60">Préparation...</span>
                                            : <><Download className="h-3.5 w-3.5" /> Exporter PDF</>}
                                    </PDFDownloadLink>
                                </div>
                                <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-[#333] text-gray-500"><X className="h-5 w-5" /></button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto bg-gray-50 dark:bg-[#111]">
                            <div className="space-y-4">
                                {(() => {
                                    try {
                                        const parsed = JSON.parse(selectedSubmission.content);
                                        return Object.entries(parsed).map(([k, v]) => (
                                            <div key={k} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm dark:bg-[#1a1a1a] dark:border-[#333]">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">{k}</div>
                                                <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{String(v)}</div>
                                            </div>
                                        ));
                                    } catch (e) { return "Données corrompues"; }
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
