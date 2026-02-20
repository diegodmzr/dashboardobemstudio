"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Users, Plus, TrendingUp, Euro, Clock, CheckCircle, AlertCircle,
    X, Edit2, Trash2, ChevronDown, ChevronUp, ArrowUpRight, Percent,
    Send, RefreshCw, FileText, Building2, Phone, Mail, Search
} from "lucide-react";
import { useRouter } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────
type Commission = {
    id: string;
    label: string;
    commissionRate: number;
    baseAmount: number;
    commissionAmount: number;
    status: "PENDING" | "IN_PROGRESS" | "PAID";
    paidAt?: string;
    notes?: string;
    createdAt: string;
    project?: { id: string; name: string; amount: number; status: string };
    quote?: { id: string; reference: string; total: number; status: string };
};

type Partner = {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    companyName?: string;
    avatar?: string;
    commissionRate: number;
    status: string;
    createdAt: string;
    partnerCommissions: Commission[];
};

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_META = {
    PENDING: {
        label: "Non payé",
        color: "text-amber-600 bg-amber-50 border-amber-200",
        dot: "bg-amber-400",
        icon: AlertCircle
    },
    IN_PROGRESS: {
        label: "En cours d'envoi",
        color: "text-blue-600 bg-blue-50 border-blue-200",
        dot: "bg-blue-400",
        icon: Clock
    },
    PAID: {
        label: "Payé",
        color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        dot: "bg-emerald-400",
        icon: CheckCircle
    }
};

function StatusBadge({ status }: { status: keyof typeof STATUS_META }) {
    const meta = STATUS_META[status] || STATUS_META.PENDING;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    );
}

function fmt(n: number) {
    return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PartnersAdminClient() {
    const router = useRouter();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [quotes, setQuotes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Modal states
    const [showPartnerModal, setShowPartnerModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [showCommissionModal, setShowCommissionModal] = useState<Partner | null>(null);
    const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);
    const [deletingCommission, setDeletingCommission] = useState<Commission | null>(null);

    // Forms
    const [partnerForm, setPartnerForm] = useState({
        name: "", firstName: "", lastName: "", email: "", phone: "",
        companyName: "", commissionRate: "10", password: ""
    });
    const [commissionForm, setCommissionForm] = useState({
        label: "", projectId: "", quoteId: "", commissionRate: "", baseAmount: "", notes: ""
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const [pRes, projRes, qRes] = await Promise.all([
                fetch("/api/partners"),
                fetch("/api/projects"),
                fetch("/api/quotes"),
            ]);
            if (pRes.ok) setPartners(await pRes.json());
            if (projRes.ok) setProjects(await projRes.json());
            if (qRes.ok) setQuotes(await qRes.json());
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const filtered = useMemo(() =>
        partners.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.email.toLowerCase().includes(search.toLowerCase()) ||
            (p.companyName?.toLowerCase().includes(search.toLowerCase()) ?? false)
        ), [partners, search]);

    // ── Stats ─────────────────────────────────────────────────────────────────
    const totalCommissions = partners.reduce((s, p) =>
        s + p.partnerCommissions.reduce((cs, c) => cs + c.commissionAmount, 0), 0);
    const paidCommissions = partners.reduce((s, p) =>
        s + p.partnerCommissions.filter(c => c.status === "PAID").reduce((cs, c) => cs + c.commissionAmount, 0), 0);
    const pendingCommissions = partners.reduce((s, p) =>
        s + p.partnerCommissions.filter(c => c.status !== "PAID").reduce((cs, c) => cs + c.commissionAmount, 0), 0);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const openCreatePartner = () => {
        setEditingPartner(null);
        setPartnerForm({ name: "", firstName: "", lastName: "", email: "", phone: "", companyName: "", commissionRate: "10", password: "" });
        setShowPartnerModal(true);
    };

    const openEditPartner = (p: Partner, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingPartner(p);
        setPartnerForm({
            name: p.name, firstName: p.firstName || "", lastName: p.lastName || "",
            email: p.email, phone: p.phone || "", companyName: p.companyName || "",
            commissionRate: String(p.commissionRate || 10), password: ""
        });
        setShowPartnerModal(true);
    };

    const handleSavePartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingPartner ? `/api/partners/${editingPartner.id}` : "/api/partners";
            const method = editingPartner ? "PATCH" : "POST";
            const res = await fetch(url, {
                method, headers: { "Content-Type": "application/json" },
                body: JSON.stringify(partnerForm)
            });
            if (res.ok) {
                setShowPartnerModal(false);
                fetchAll();
            } else {
                const err = await res.json();
                alert(err.error || "Erreur");
            }
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDeletePartner = async () => {
        if (!deletingPartner) return;
        setSaving(true);
        try {
            await fetch(`/api/partners/${deletingPartner.id}`, { method: "DELETE" });
            setDeletingPartner(null);
            fetchAll();
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const openAddCommission = (p: Partner, e: React.MouseEvent) => {
        e.stopPropagation();
        setShowCommissionModal(p);
        setCommissionForm({
            label: "", projectId: "", quoteId: "",
            commissionRate: String(p.commissionRate || 10),
            baseAmount: "", notes: ""
        });
    };

    const handleSaveCommission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showCommissionModal) return;
        setSaving(true);
        try {
            // auto-fill label if project/quote selected
            let label = commissionForm.label;
            if (!label && commissionForm.projectId) {
                const proj = projects.find(p => p.id === commissionForm.projectId);
                if (proj) label = `Commission — ${proj.name}`;
            }
            if (!label && commissionForm.quoteId) {
                const q = quotes.find(q => q.id === commissionForm.quoteId);
                if (q) label = `Commission — Devis ${q.reference}`;
            }
            if (!label) label = "Commission manuelle";

            const res = await fetch("/api/partners/commissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...commissionForm, partnerId: showCommissionModal.id, label })
            });
            if (res.ok) {
                setShowCommissionModal(null);
                fetchAll();
            }
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleUpdateCommissionStatus = async (commissionId: string, newStatus: string) => {
        try {
            await fetch(`/api/partners/commissions/${commissionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            fetchAll();
        } catch (e) { console.error(e); }
    };

    const handleDeleteCommission = async () => {
        if (!deletingCommission) return;
        await fetch(`/api/partners/commissions/${deletingCommission.id}`, { method: "DELETE" });
        setDeletingCommission(null);
        fetchAll();
    };

    // ── Auto-fill baseAmount from project/quote ───────────────────────────────
    useEffect(() => {
        if (commissionForm.projectId) {
            const proj = projects.find(p => p.id === commissionForm.projectId);
            if (proj) setCommissionForm(f => ({ ...f, baseAmount: String(proj.amount || ""), quoteId: "" }));
        }
    }, [commissionForm.projectId]);

    useEffect(() => {
        if (commissionForm.quoteId) {
            const q = quotes.find(q => q.id === commissionForm.quoteId);
            if (q) setCommissionForm(f => ({ ...f, baseAmount: String(q.total || ""), projectId: "" }));
        }
    }, [commissionForm.quoteId]);

    const previewCommission = commissionForm.baseAmount && commissionForm.commissionRate
        ? (parseFloat(commissionForm.baseAmount) * parseFloat(commissionForm.commissionRate)) / 100
        : 0;

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin dark:border-white" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Partenaires</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Gérez vos comptes partenaires et leurs commissions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchAll} className="p-2 text-gray-400 hover:text-black transition-transform hover:rotate-180 duration-500 dark:hover:text-white">
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                        onClick={openCreatePartner}
                        className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 hover:bg-gray-800 transition dark:bg-white dark:text-black"
                    >
                        <Plus className="h-4 w-4" />
                        Nouveau partenaire
                    </button>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Partenaires", value: partners.length, icon: Users, color: "text-violet-600" },
                    { label: "Total commissions", value: fmt(totalCommissions), icon: Euro, color: "text-blue-600" },
                    { label: "Commissions payées", value: fmt(paidCommissions), icon: CheckCircle, color: "text-emerald-600" },
                    { label: "En attente de paiement", value: fmt(pendingCommissions), icon: Clock, color: "text-amber-600" },
                ].map(kpi => (
                    <div key={kpi.label} className="rounded-2xl border border-gray-200 bg-white p-5 dark:bg-[#111] dark:border-[#333]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] ${kpi.color}`}>
                                <kpi.icon className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.label}</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Search ── */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Rechercher un partenaire..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-black transition dark:bg-[#111] dark:border-[#333] dark:text-white dark:focus:border-white"
                />
            </div>

            {/* ── Partners list ── */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Users className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-medium">{search ? "Aucun résultat" : "Aucun partenaire créé"}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(partner => {
                        const totalEarned = partner.partnerCommissions.reduce((s, c) => s + c.commissionAmount, 0);
                        const paidEarned = partner.partnerCommissions.filter(c => c.status === "PAID").reduce((s, c) => s + c.commissionAmount, 0);
                        const isExpanded = expandedId === partner.id;

                        return (
                            <div key={partner.id} className="rounded-2xl border border-gray-200 bg-white dark:bg-[#111] dark:border-[#333] overflow-hidden transition-all">
                                {/* ── Partner row ── */}
                                <div
                                    className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#161616] transition"
                                    onClick={() => setExpandedId(isExpanded ? null : partner.id)}
                                >
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-violet-100 to-purple-200 flex items-center justify-center text-lg font-black text-violet-700 dark:from-violet-900/40 dark:to-purple-900/40 dark:text-violet-300">
                                        {partner.name.charAt(0)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-gray-900 dark:text-white">{partner.name}</h3>
                                            <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold uppercase tracking-wider dark:bg-violet-900/30 dark:text-violet-300">
                                                Partenaire
                                            </span>
                                            {partner.status !== "Active" && (
                                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                                    Inactif
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">
                                            {partner.companyName && <><Building2 className="inline h-3 w-3 mr-1" />{partner.companyName} · </>}
                                            <Mail className="inline h-3 w-3 mr-1" />{partner.email}
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="hidden md:flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Commission</p>
                                            <p className="font-black text-gray-900 dark:text-white">{partner.commissionRate}%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total généré</p>
                                            <p className="font-black text-gray-900 dark:text-white">{fmt(totalEarned)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Payé</p>
                                            <p className="font-black text-emerald-600">{fmt(paidEarned)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Commissions</p>
                                            <p className="font-black text-gray-900 dark:text-white">{partner.partnerCommissions.length}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 ml-2">
                                        <button
                                            onClick={e => openAddCommission(partner, e)}
                                            className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition dark:hover:bg-violet-900/20"
                                            title="Ajouter une commission"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={e => openEditPartner(partner, e)}
                                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition dark:hover:bg-[#222] dark:hover:text-white"
                                            title="Modifier"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={e => { e.stopPropagation(); setDeletingPartner(partner); }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition dark:hover:bg-red-900/20"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                        <div className="text-gray-300 dark:text-[#555]">
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </div>
                                </div>

                                {/* ── Expanded: Commissions table ── */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 dark:border-[#222]">
                                        <div className="p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                    Commissions ({partner.partnerCommissions.length})
                                                </h4>
                                                <button
                                                    onClick={e => openAddCommission(partner, e)}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 transition"
                                                >
                                                    <Plus className="h-3.5 w-3.5" /> Ajouter
                                                </button>
                                            </div>

                                            {partner.partnerCommissions.length === 0 ? (
                                                <p className="text-sm text-gray-400 italic text-center py-6">
                                                    Aucune commission enregistrée pour ce partenaire.
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {partner.partnerCommissions.map(comm => (
                                                        <div key={comm.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] group">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{comm.label}</p>
                                                                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                                                                    <span>Base: {fmt(comm.baseAmount)}</span>
                                                                    <span className="text-gray-200 dark:text-[#444]">·</span>
                                                                    <span>{comm.commissionRate}%</span>
                                                                    {comm.paidAt && (
                                                                        <>
                                                                            <span className="text-gray-200 dark:text-[#444]">·</span>
                                                                            <span>Payé le {new Date(comm.paidAt).toLocaleDateString("fr-FR")}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <p className="font-black text-gray-900 dark:text-white text-sm">{fmt(comm.commissionAmount)}</p>

                                                            {/* Status dropdown */}
                                                            <select
                                                                value={comm.status}
                                                                onClick={e => e.stopPropagation()}
                                                                onChange={e => handleUpdateCommissionStatus(comm.id, e.target.value)}
                                                                className={`text-xs font-bold rounded-full px-3 py-1.5 border outline-none cursor-pointer transition ${STATUS_META[comm.status as keyof typeof STATUS_META]?.color || ""}`}
                                                            >
                                                                <option value="PENDING">Non payé</option>
                                                                <option value="IN_PROGRESS">En cours d'envoi</option>
                                                                <option value="PAID">Payé</option>
                                                            </select>

                                                            <button
                                                                onClick={e => { e.stopPropagation(); setDeletingCommission(comm); }}
                                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                MODAL — Partner create/edit
            ══════════════════════════════════════════════════════════════════ */}
            {showPartnerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl dark:bg-[#111] dark:border dark:border-[#333] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#222]">
                            <h2 className="font-bold text-lg dark:text-white">
                                {editingPartner ? "Modifier le partenaire" : "Nouveau partenaire"}
                            </h2>
                            <button onClick={() => setShowPartnerModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition dark:hover:bg-[#222]">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSavePartner} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prénom</label>
                                    <input type="text" value={partnerForm.firstName} onChange={e => setPartnerForm(f => ({ ...f, firstName: e.target.value, name: `${e.target.value} ${f.lastName}`.trim() }))}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nom *</label>
                                    <input type="text" required value={partnerForm.lastName} onChange={e => setPartnerForm(f => ({ ...f, lastName: e.target.value, name: `${f.firstName} ${e.target.value}`.trim() }))}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email *</label>
                                <input type="email" required value={partnerForm.email} onChange={e => setPartnerForm(f => ({ ...f, email: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Téléphone</label>
                                    <input type="tel" value={partnerForm.phone} onChange={e => setPartnerForm(f => ({ ...f, phone: e.target.value }))}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Société</label>
                                    <input type="text" value={partnerForm.companyName} onChange={e => setPartnerForm(f => ({ ...f, companyName: e.target.value }))}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                    <Percent className="h-3 w-3" /> Taux de commission (%)
                                </label>
                                <div className="relative mt-1">
                                    <input type="number" min="0" max="100" step="0.5" required value={partnerForm.commissionRate}
                                        onChange={e => setPartnerForm(f => ({ ...f, commissionRate: e.target.value }))}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {editingPartner ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe *"}
                                </label>
                                <input type="password" required={!editingPartner} value={partnerForm.password}
                                    onChange={e => setPartnerForm(f => ({ ...f, password: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white" />
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowPartnerModal(false)}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-black transition">
                                    Annuler
                                </button>
                                <button type="submit" disabled={saving}
                                    className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-800 disabled:opacity-50 transition dark:bg-white dark:text-black">
                                    {saving ? "Enregistrement..." : (editingPartner ? "Modifier" : "Créer le partenaire")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                MODAL — Add commission
            ══════════════════════════════════════════════════════════════════ */}
            {showCommissionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl dark:bg-[#111] dark:border dark:border-[#333] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#222]">
                            <div>
                                <h2 className="font-bold text-lg dark:text-white">Ajouter une commission</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Pour {showCommissionModal.name} · {showCommissionModal.commissionRate}% par défaut</p>
                            </div>
                            <button onClick={() => setShowCommissionModal(null)} className="p-2 hover:bg-gray-100 rounded-xl transition dark:hover:bg-[#222]">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveCommission} className="p-6 space-y-4">
                            {/* Link to project or quote */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Projet lié (optionnel)</label>
                                    <select value={commissionForm.projectId} onChange={e => setCommissionForm(f => ({ ...f, projectId: e.target.value }))}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white">
                                        <option value="">— Aucun —</option>
                                        {projects.map((p: any) => (
                                            <option key={p.id} value={p.id}>{p.name} ({fmt(p.amount || 0)})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Devis lié (optionnel)</label>
                                    <select value={commissionForm.quoteId} onChange={e => setCommissionForm(f => ({ ...f, quoteId: e.target.value }))}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white">
                                        <option value="">— Aucun —</option>
                                        {quotes.map((q: any) => (
                                            <option key={q.id} value={q.id}>Devis {q.reference} ({fmt(q.total || 0)})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                                <input type="text" placeholder="Commission — Projet X" value={commissionForm.label}
                                    onChange={e => setCommissionForm(f => ({ ...f, label: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Montant de base (€) *</label>
                                    <input type="number" required min="0" step="0.01" value={commissionForm.baseAmount}
                                        onChange={e => setCommissionForm(f => ({ ...f, baseAmount: e.target.value }))}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Taux (%) *</label>
                                    <input type="number" required min="0" max="100" step="0.5" value={commissionForm.commissionRate}
                                        onChange={e => setCommissionForm(f => ({ ...f, commissionRate: e.target.value }))}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white" />
                                </div>
                            </div>

                            {/* Preview */}
                            {previewCommission > 0 && (
                                <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 flex items-center justify-between dark:bg-violet-900/10 dark:border-violet-900/30">
                                    <span className="text-sm font-medium text-violet-700 dark:text-violet-300">Commission calculée</span>
                                    <span className="text-lg font-black text-violet-700 dark:text-violet-300">{fmt(previewCommission)}</span>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notes (optionnel)</label>
                                <textarea rows={2} value={commissionForm.notes}
                                    onChange={e => setCommissionForm(f => ({ ...f, notes: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-black transition resize-none dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white" />
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowCommissionModal(null)}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-black transition">
                                    Annuler
                                </button>
                                <button type="submit" disabled={saving}
                                    className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-800 disabled:opacity-50 transition dark:bg-white dark:text-black">
                                    {saving ? "Enregistrement..." : "Ajouter la commission"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Partner confirm ── */}
            {deletingPartner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 dark:bg-[#111] dark:border dark:border-[#333]">
                        <h3 className="font-bold text-lg mb-2 dark:text-white">Supprimer {deletingPartner.name} ?</h3>
                        <p className="text-sm text-gray-500 mb-6">Toutes les commissions de ce partenaire seront supprimées. Cette action est irréversible.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingPartner(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold transition hover:bg-gray-50 dark:border-[#333] dark:text-white dark:hover:bg-[#1a1a1a]">
                                Annuler
                            </button>
                            <button onClick={handleDeletePartner} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition">
                                {saving ? "Suppression..." : "Supprimer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Commission confirm ── */}
            {deletingCommission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 dark:bg-[#111] dark:border dark:border-[#333]">
                        <h3 className="font-bold text-lg mb-2 dark:text-white">Supprimer cette commission ?</h3>
                        <p className="text-sm text-gray-500 mb-6">"{deletingCommission.label}" sera définitivement supprimée.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingCommission(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold transition hover:bg-gray-50 dark:border-[#333] dark:text-white dark:hover:bg-[#1a1a1a]">
                                Annuler
                            </button>
                            <button onClick={handleDeleteCommission} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
