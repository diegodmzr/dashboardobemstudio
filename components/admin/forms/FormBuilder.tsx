"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, X, Settings2, Eye } from "lucide-react";

type FieldType = "text" | "email" | "textarea" | "number" | "select" | "radio" | "checkbox" | "date";

type FormField = {
    id: string;
    label: string;
    type: FieldType;
    required: boolean;
    placeholder?: string;
    options?: string[];
};

type FormPhase = {
    id: string;
    title: string;
    fields: FormField[];
};

type Props = {
    initialData?: {
        title: string;
        description: string;
        phases: FormPhase[];
    };
    onSave: (data: any) => void;
    onCancel: () => void;
};

export default function FormBuilder({ initialData, onSave, onCancel }: Props) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [phases, setPhases] = useState<FormPhase[]>(initialData?.phases || [
        { id: "p1", title: "Information Générale", fields: [] }
    ]);
    const [isSaving, setIsSaving] = useState(false);

    const addPhase = () => {
        const id = `p${Date.now()}`;
        setPhases([...phases, { id, title: `Phase ${phases.length + 1}`, fields: [] }]);
    };

    const removePhase = (phaseId: string) => {
        if (phases.length === 1) return;
        setPhases(phases.filter(p => p.id !== phaseId));
    };

    const addField = (phaseId: string) => {
        const fieldId = `f${Date.now()}`;
        setPhases(phases.map(p => {
            if (p.id === phaseId) {
                return {
                    ...p,
                    fields: [...p.fields, { id: fieldId, label: "Nouveau champ", type: "text", required: false }]
                };
            }
            return p;
        }));
    };

    const removeField = (phaseId: string, fieldId: string) => {
        setPhases(phases.map(p => {
            if (p.id === phaseId) {
                return { ...p, fields: p.fields.filter(f => f.id !== fieldId) };
            }
            return p;
        }));
    };

    const updateField = (phaseId: string, fieldId: string, updates: Partial<FormField>) => {
        setPhases(phases.map(p => {
            if (p.id === phaseId) {
                return {
                    ...p,
                    fields: p.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
                };
            }
            return p;
        }));
    };

    const updatePhaseTitle = (phaseId: string, newTitle: string) => {
        setPhases(phases.map(p => p.id === phaseId ? { ...p, title: newTitle } : p));
    };

    const handleSave = async () => {
        if (!title.trim()) return alert("Veuillez donner un titre au formulaire");
        setIsSaving(true);
        try {
            await onSave({ title, description, phases });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 h-full">
            {/* Form Definition */}
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Titre du formulaire</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Ex: Brief Créatif - Logo"
                        className="w-full mt-2 bg-transparent text-3xl font-bold text-gray-900 dark:text-white outline-none placeholder:opacity-30 border-b border-gray-100 dark:border-[#222] pb-2 focus:border-black dark:focus:border-white transition-colors"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description (optionnelle)</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Expliquez l'objectif de ce formulaire..."
                        rows={2}
                        className="w-full mt-2 bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm outline-none focus:border-black dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-300"
                    />
                </div>
            </div>

            {/* Phases / Steps */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Phases du formulaire ({phases.length})</h3>
                    <button
                        onClick={addPhase}
                        className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition dark:bg-white dark:text-black"
                    >
                        <Plus className="w-3 h-3" /> Ajouter une phase
                    </button>
                </div>

                {phases.map((phase, pIdx) => (
                    <div key={phase.id} className="relative group rounded-2xl border border-gray-100 bg-white shadow-sm dark:bg-[#111] dark:border-[#222] overflow-hidden">
                        {/* Phase Header */}
                        <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-[#161616] border-b border-gray-100 dark:border-[#222]">
                            <div className="flex items-center gap-3 flex-1">
                                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black text-[10px] font-bold text-white dark:bg-white dark:text-black">
                                    {pIdx + 1}
                                </span>
                                <input
                                    type="text"
                                    value={phase.title}
                                    onChange={e => updatePhaseTitle(phase.id, e.target.value)}
                                    className="bg-transparent font-bold text-gray-900 dark:text-white outline-none focus:underline"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => removePhase(phase.id)}
                                    className="p-1.5 text-gray-300 hover:text-red-500 transition"
                                    disabled={phases.length === 1}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Phase Fields */}
                        <div className="p-6 space-y-4">
                            {phase.fields.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl dark:border-[#222]">
                                    <p className="text-xs text-gray-400">Aucun champ dans cette phase</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {phase.fields.map((field, fIdx) => (
                                        <div key={field.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 dark:bg-[#1a1a1a] dark:border-[#222] flex flex-col gap-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Libellé de la question</label>
                                                        <input
                                                            type="text"
                                                            value={field.label}
                                                            onChange={e => updateField(phase.id, field.id, { label: e.target.value })}
                                                            className="w-full mt-1 bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-black dark:bg-[#111] dark:border-[#333] dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Type de réponse</label>
                                                        <select
                                                            value={field.type}
                                                            onChange={e => updateField(phase.id, field.id, { type: e.target.value as any })}
                                                            className="w-full mt-1 bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-black dark:bg-[#111] dark:border-[#333] dark:text-white"
                                                        >
                                                            <option value="text">Texte court</option>
                                                            <option value="textarea">Paragraphe</option>
                                                            <option value="number">Nombre</option>
                                                            <option value="email">Email</option>
                                                            <option value="select">Menu déroulant (Unique)</option>
                                                            <option value="radio">Choix unique (Boutons)</option>
                                                            <option value="checkbox">Choix multiples</option>
                                                            <option value="date">Date</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeField(phase.id, field.id)}
                                                    className="ml-4 p-2 text-gray-300 hover:text-red-500 transition"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Options for select/radio/checkbox */}
                                            {["select", "radio", "checkbox"].includes(field.type) && (
                                                <div className="bg-white dark:bg-[#111] p-3 rounded-lg border border-gray-100 dark:border-[#333]">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Options (séparées par une virgule)</label>
                                                    <textarea
                                                        value={field.options?.join(", ") || ""}
                                                        onChange={e => updateField(phase.id, field.id, { options: e.target.value.split(",").map(s => s.trim()).filter(s => s) })}
                                                        placeholder="Option 1, Option 2, Option 3..."
                                                        className="w-full mt-1 bg-transparent text-sm outline-none resize-none dark:text-white"
                                                        rows={2}
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={e => updateField(phase.id, field.id, { required: e.target.checked })}
                                                        className="rounded border-gray-300 text-black focus:ring-black"
                                                    />
                                                    <span className="text-xs text-gray-500 font-medium">Réponse obligatoire</span>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => addField(phase.id)}
                                className="w-full py-3 border-2 border-dashed border-gray-100 text-gray-400 hover:text-black hover:border-black rounded-xl text-xs font-bold transition-all dark:border-[#222] dark:hover:border-white dark:hover:text-white"
                            >
                                <Plus className="w-4 h-4 inline-block mr-2" /> Ajouter une question
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-md p-6 border-t border-gray-100 flex items-center justify-end gap-3 dark:bg-black/80 dark:border-[#222]">
                <button
                    onClick={onCancel}
                    className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-black transition"
                >
                    Annuler
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-2.5 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-800 disabled:opacity-50 transition dark:bg-white dark:text-black"
                >
                    {isSaving ? "Enregistrement..." : "Enregistrer le formulaire"}
                </button>
            </div>
        </div>
    );
}
