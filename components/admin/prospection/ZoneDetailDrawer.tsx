"use client";

import { useState } from "react";
import { X, Plus, User, Phone, Mail, MapPin, Briefcase, FileText, CheckCircle2, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Props = {
    zone: any;
    onClose: () => void;
    onUpdate: () => void;
};

export default function ZoneDetailDrawer({ zone, onClose, onUpdate }: Props) {
    const [isAddingProspect, setIsAddingProspect] = useState(false);
    const [editingProspect, setEditingProspect] = useState<any>(null); // State for editing
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        company: "",
        status: "NOT_APPROACHED",
        notes: "",
        latitude: 0,
        longitude: 0,
        color: "#3b82f6"
    });

    const geocodeAddress = async (address: string) => {
        if (!address) return;
        // Clean address: remove newlines
        const cleanAddress = address.replace(/\n/g, ", ");

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanAddress)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                }));
            } else {
                alert("Impossible de localiser cette adresse. Essayez d'être plus précis ou vérifiez l'orthographe.");
            }
        } catch (error) {
            console.error("Geocoding failed", error);
        }
    };

    const handleSaveProspect = async () => {
        if (!formData.name) return;
        setLoading(true);

        const url = editingProspect
            ? `/api/prospection/prospects/${editingProspect.id}`
            : "/api/prospection/prospects";

        const method = editingProspect ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    zoneId: zone.id
                })
            });

            if (res.ok) {
                onUpdate();
                handleCancel();
            } else {
                alert("Erreur lors de l'enregistrement. Le serveur a retourné une erreur " + res.status);
            }
        } catch (error) {
            console.error("Save Error", error);
            alert("Erreur technique lors de l'enregistrement. Veuillez redémarrer votre serveur (npm run dev).");
        } finally {
            setLoading(false);
        }
    };

    const handleEditProspect = (prospect: any) => {
        setEditingProspect(prospect);
        setFormData({
            name: prospect.name || "",
            email: prospect.email || "",
            phone: prospect.phone || "",
            address: prospect.address || "",
            company: prospect.company || "",
            status: prospect.status || "NOT_APPROACHED",
            notes: prospect.notes || "",
            latitude: prospect.latitude || 0,
            longitude: prospect.longitude || 0,
            color: prospect.color || "#3b82f6"
        });
        setIsAddingProspect(true);
    };

    const handleCancel = () => {
        setIsAddingProspect(false);
        setEditingProspect(null);
        setFormData({
            name: "",
            email: "",
            phone: "",
            address: "",
            company: "",
            status: "NOT_APPROACHED",
            notes: "",
            latitude: 0,
            longitude: 0,
            color: "#3b82f6"
        });
    };

    const handleConvert = async (prospect: any) => {
        if (!confirm("Voulez-vous convertir ce prospect en client ?")) return;
        // Logic to convert
        // For now just alert or log
        alert("Fonctionnalité de conversion bientôt disponible !");
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white dark:bg-[#111] shadow-2xl border-l border-gray-100 dark:border-[#333] transform transition-transform duration-300 z-50 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-[#333] flex items-center justify-between bg-gray-50/50 dark:bg-[#1a1a1a]/50 backdrop-blur-sm">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: zone.color }} />
                        <h2 className="text-xl font-bold dark:text-white">{zone.name}</h2>
                    </div>
                    <div className="text-sm text-gray-500">
                        {zone.status === 'TODO' && 'À prospecter'}
                        {zone.status === 'IN_PROGRESS' && 'En cours de prospection'}
                        {zone.status === 'DONE' && 'Prospection terminée'}
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Zone Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a]">
                        <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Date prévue</div>
                        <div className="font-medium dark:text-white">
                            {zone.prospectionDate ? format(new Date(zone.prospectionDate), "d MMMM yyyy", { locale: fr }) : "Non définie"}
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a]">
                        <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Assigné à</div>
                        <div className="font-medium dark:text-white pb-2 flex flex-wrap gap-1">
                            {zone.assignedTo?.length > 0 ? zone.assignedTo.join(", ") : "Personne"}
                        </div>
                    </div>
                </div>

                {/* Prospects Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2 dark:text-white">
                            <Users className="w-5 h-5" />
                            Prospects ({zone.prospects?.length || 0})
                        </h3>
                        <button
                            onClick={() => {
                                setEditingProspect(null);
                                setIsAddingProspect(true);
                                setFormData({
                                    name: "",
                                    email: "",
                                    phone: "",
                                    address: "",
                                    company: "",
                                    status: "NOT_APPROACHED",
                                    notes: "",
                                    latitude: 0,
                                    longitude: 0,
                                    color: "#3b82f6"
                                });
                            }}
                            className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-800 dark:bg-white dark:text-black"
                        >
                            <Plus className="w-4 h-4" />
                            Ajouter
                        </button>
                    </div>


                    {isAddingProspect && (
                        <div className="mb-6 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#333] animate-in slide-in-from-top-4">
                            <h4 className="font-bold mb-4">{editingProspect ? "Modifier Prospect" : "Nouveau Prospect"}</h4>
                            <div className="space-y-3">
                                <input
                                    placeholder="Nom / Entreprise"
                                    className="w-full p-2.5 rounded-xl border bg-transparent text-sm dark:border-[#444]"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        placeholder="Email"
                                        className="w-full p-2.5 rounded-xl border bg-transparent text-sm dark:border-[#444]"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <input
                                        placeholder="Téléphone"
                                        className="w-full p-2.5 rounded-xl border bg-transparent text-sm dark:border-[#444]"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        placeholder="Adresse"
                                        className="flex-1 p-2.5 rounded-xl border bg-transparent text-sm dark:border-[#444]"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        onBlur={(e) => geocodeAddress(e.target.value)}
                                    />
                                    <button
                                        onClick={() => geocodeAddress(formData.address)}
                                        className="p-2.5 bg-gray-100 dark:bg-[#333] rounded-xl hover:bg-gray-200"
                                        title="Localiser sur la carte"
                                    >
                                        <MapPin className="w-5 h-5" />
                                    </button>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Statut</label>
                                    <select
                                        className="w-full p-2.5 rounded-xl border bg-transparent text-sm dark:border-[#444] dark:bg-[#222]"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="NOT_APPROACHED">À faire</option>
                                        <option value="APPROACHED">Approché</option>
                                        <option value="R1">R1</option>
                                        <option value="R2">R2</option>
                                        <option value="R3">R3</option>
                                        <option value="QUOTE_SENT">Devis envoyé</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Couleur</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'].map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color: c })}
                                                className={cn(
                                                    "w-6 h-6 rounded-full border-2",
                                                    formData.color === c ? "border-black dark:border-white scale-110" : "border-transparent"
                                                )}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                        {/* Custom Color Picker */}
                                        <div
                                            className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-300"
                                            style={{ background: 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FF8A00 51.43deg, #FFE500 102.86deg, #00FF1E 154.29deg, #00A3FF 205.71deg, #9E00FF 257.14deg, #FF004C 308.57deg, #FF0000 360deg)' }}
                                        >
                                            <input
                                                type="color"
                                                value={formData.color}
                                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0 opacity-0"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <textarea
                                    placeholder="Notes..."
                                    className="w-full p-2.5 rounded-xl border bg-transparent text-sm dark:border-[#444]"
                                    rows={2}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                                <div className="flex gap-2 justify-end mt-2">
                                    <button onClick={handleCancel} className="px-3 py-2 text-sm text-gray-500">Annuler</button>
                                    <button onClick={handleSaveProspect} disabled={loading} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold dark:bg-white dark:text-black">
                                        {loading ? "..." : "Enregistrer"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {zone.prospects?.map((prospect: any) => (
                            <div key={prospect.id} className="p-4 rounded-xl border border-gray-100 bg-white dark:bg-[#1a1a1a] dark:border-[#333] hover:shadow-sm transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-[#1f1f1f] dark:text-white flex items-center gap-2">
                                        {prospect.name}
                                        {prospect.company && <span className="text-gray-400 text-xs font-normal">({prospect.company})</span>}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-gray-100 dark:bg-[#333] text-gray-500">
                                        {prospect.status}
                                    </span>
                                </div>

                                <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                    {prospect.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {prospect.email}</div>}
                                    {prospect.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {prospect.phone}</div>}
                                    {prospect.address && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {prospect.address}</div>}
                                </div>

                                {prospect.notes && (
                                    <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200 text-xs rounded-lg">
                                        {prospect.notes}
                                    </div>
                                )}

                                <div className="mt-4 flex gap-2 pt-2 border-t border-gray-50 dark:border-[#222]">
                                    <button
                                        onClick={() => handleEditProspect(prospect)}
                                        className="flex-1 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-[#333] dark:hover:bg-[#444] rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        Éditer
                                    </button>
                                    <button
                                        onClick={() => handleConvert(prospect)}
                                        className="flex-1 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <UserPlus className="w-3.5 h-3.5" />
                                        Créer Client
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(!zone.prospects || zone.prospects.length === 0) && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                Aucun prospect dans cette zone.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
