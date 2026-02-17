"use client";

import { useState, useMemo } from "react";
import { Check, ChevronRight, ChevronLeft, Send, AlertCircle } from "lucide-react";
import Image from "next/image";

type FieldType = "text" | "email" | "textarea" | "number" | "select" | "radio" | "checkbox" | "date";

type Field = {
    id: string;
    label: string;
    type: FieldType;
    required: boolean;
    placeholder?: string;
    options?: string[];
};

type Phase = {
    id: string;
    title: string;
    fields: Field[];
};

type Props = {
    form: any;
    currentUser?: any;
};

export default function PublicFormClient({ form, currentUser }: Props) {
    const rawFields = useMemo(() => {
        try {
            const parsed = JSON.parse(form.fields || "[]");
            // Check if it's the new phases structure
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].fields) {
                return parsed as Phase[];
            }
            // Old structure or single list
            return [{ id: "p1", title: "Questions", fields: parsed }] as Phase[];
        } catch (e) {
            return [];
        }
    }, [form.fields]);

    const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const initial: Record<string, any> = {};
        // Pre-fill logic
        if (currentUser) {
            // Map common fields by checking label matches (case-insensitive)
            const mapField = (label: string, value: any) => {
                if (value) initial[label] = value;
            };

            const fullName = currentUser.firstName && currentUser.lastName
                ? `${currentUser.firstName} ${currentUser.lastName}`
                : (currentUser.name || "");

            // Initial pre-fill attempt (explicitly checking common labels)
            rawFields.forEach(phase => phase.fields.forEach(field => {
                const l = field.label.toLowerCase();
                if (l.includes("nom") && !l.includes("société") && !l.includes("entreprise")) initial[field.label] = fullName;
                if (l.includes("email") || l.includes("courriel")) initial[field.label] = currentUser.email;
                if (l.includes("téléphone") || l.includes("tel")) initial[field.label] = currentUser.phone || "";
                if (l.includes("société") || l.includes("entreprise") || l.includes("compagnie")) initial[field.label] = currentUser.companyName || "";
                if (l.includes("siret")) initial[field.label] = currentUser.siret || "";
            }));
        }
        return initial;
    });

    const [status, setStatus] = useState<"IDLE" | "SUBMITTING" | "SUCCESS" | "ERROR">("IDLE");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const phases = rawFields;
    const currentPhase = phases[currentPhaseIdx];
    const isLastPhase = currentPhaseIdx === phases.length - 1;

    const handleChange = (label: string, value: any) => {
        setFormData(prev => ({ ...prev, [label]: value }));
        if (errors[label]) {
            const newErrors = { ...errors };
            delete newErrors[label];
            setErrors(newErrors);
        }
    };

    const validatePhase = () => {
        const newErrors: Record<string, string> = {};
        currentPhase.fields.forEach(field => {
            if (field.required && !formData[field.label]) {
                newErrors[field.label] = "Ce champ est obligatoire";
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validatePhase()) {
            if (isLastPhase) {
                handleSubmit();
            } else {
                setCurrentPhaseIdx(prev => prev + 1);
                window.scrollTo(0, 0);
            }
        }
    };

    const prevStep = () => {
        if (currentPhaseIdx > 0) {
            setCurrentPhaseIdx(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async () => {
        setStatus("SUBMITTING");
        try {
            const res = await fetch(`/api/forms/${form.slug}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setStatus("SUCCESS");
                window.scrollTo(0, 0);
            } else {
                setStatus("ERROR");
            }
        } catch (e) {
            setStatus("ERROR");
        }
    };

    if (status === "SUCCESS") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f6fb] p-6 text-center dark:bg-black">
                <div className="w-full max-w-md rounded-3xl bg-white p-12 shadow-2xl dark:bg-[#111] dark:border dark:border-[#222]">
                    <div className="mb-6 flex justify-center">
                        <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center animate-bounce dark:bg-green-900/20">
                            <Check className="h-10 w-10 text-green-500" />
                        </div>
                    </div>
                    <h2 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">Merci !</h2>
                    <p className="text-gray-600 dark:text-gray-400">Votre réponse a bien été enregistrée. Notre équipe va l'étudier attentivement et reviendra vers vous très rapidement.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f6fb] py-12 px-4 sm:px-6 lg:px-8 font-sans dark:bg-black">
            <div className="mx-auto max-w-3xl">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="mx-auto h-16 w-auto relative mb-8 flex justify-center">
                        <img src="/logonoir.png" alt="Logo" className="h-full w-auto object-contain block dark:hidden" />
                        <img src="/logonoir.png" alt="Logo" className="h-full w-auto object-contain hidden dark:block invert" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{form.title}</h1>
                    {form.description && <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">{form.description}</p>}
                </div>

                {/* Progress Bar */}
                {phases.length > 1 && (
                    <div className="mb-10 px-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Étape {currentPhaseIdx + 1} sur {phases.length}</span>
                            <span className="text-xs font-bold text-black dark:text-white">{Math.round(((currentPhaseIdx + 1) / phases.length) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-[#222]">
                            <div
                                className="h-full bg-black dark:bg-white transition-all duration-500 ease-out"
                                style={{ width: `${((currentPhaseIdx + 1) / phases.length) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Form Card */}
                <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl ring-1 ring-black/5 sm:p-12 dark:bg-[#0a0a0a] dark:ring-white/10 transition-all duration-300">
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentPhase?.title}</h2>
                        <div className="h-1 w-12 bg-black mt-2 dark:bg-white" />
                    </div>

                    <div className="space-y-8">
                        {currentPhase?.fields.map((field) => (
                            <div key={field.id} className="group transition-all">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2.5 transition-colors group-focus-within:text-black dark:group-focus-within:text-white">
                                    {field.label} {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                </label>

                                {field.type === "textarea" ? (
                                    <textarea
                                        required={field.required}
                                        rows={4}
                                        className={`block w-full rounded-2xl border ${errors[field.label] ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-[#222]'} bg-gray-50 px-5 py-4 text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all dark:bg-[#111] dark:text-white dark:focus:border-white dark:focus:ring-white`}
                                        onChange={e => handleChange(field.label, e.target.value)}
                                        value={formData[field.label] || ""}
                                        placeholder={field.placeholder || `Votre réponse...`}
                                    />
                                ) : field.type === "select" ? (
                                    <select
                                        required={field.required}
                                        className={`block w-full rounded-2xl border ${errors[field.label] ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-[#222]'} bg-gray-50 h-14 px-5 text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all dark:bg-[#111] dark:text-white dark:focus:border-white dark:focus:ring-white appearance-none`}
                                        onChange={e => handleChange(field.label, e.target.value)}
                                        value={formData[field.label] || ""}
                                    >
                                        <option value="">Sélectionnez une option</option>
                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : field.type === "radio" || field.type === "checkbox" ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {field.options?.map(opt => (
                                            <label
                                                key={opt}
                                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${(field.type === "radio" ? formData[field.label] === opt : formData[field.label]?.includes(opt))
                                                    ? 'border-black bg-black/5 dark:border-white dark:bg-white/5'
                                                    : 'border-gray-100 hover:border-gray-300 dark:border-[#222] dark:hover:border-[#444]'
                                                    }`}
                                            >
                                                <input
                                                    type={field.type}
                                                    name={field.label}
                                                    checked={field.type === "radio" ? formData[field.label] === opt : formData[field.label]?.includes(opt)}
                                                    onChange={e => {
                                                        if (field.type === "radio") {
                                                            handleChange(field.label, opt);
                                                        } else {
                                                            const currentValues = formData[field.label] || [];
                                                            if (e.target.checked) {
                                                                handleChange(field.label, [...currentValues, opt]);
                                                            } else {
                                                                handleChange(field.label, currentValues.filter((v: any) => v !== opt));
                                                            }
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-black border-gray-300 focus:ring-black dark:text-white dark:focus:ring-white"
                                                />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {opt}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        type={field.type}
                                        required={field.required}
                                        className={`block h-14 w-full rounded-2xl border ${errors[field.label] ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-[#222]'} bg-gray-50 px-5 text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all dark:bg-[#111] dark:text-white dark:focus:border-white dark:focus:ring-white`}
                                        onChange={e => handleChange(field.label, e.target.value)}
                                        value={formData[field.label] || ""}
                                        placeholder={field.placeholder || `Votre ${field.label.toLowerCase()}...`}
                                    />
                                )}

                                {errors[field.label] && (
                                    <div className="mt-2 flex items-center gap-1.5 text-red-500 text-xs font-bold animate-pulse">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors[field.label]}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-10 border-t border-gray-100 dark:border-[#222]">
                        {currentPhaseIdx > 0 ? (
                            <button
                                onClick={prevStep}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-gray-500 hover:text-black transition-colors dark:text-gray-400 dark:hover:text-white"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Précédent
                            </button>
                        ) : <div className="hidden sm:block" />}

                        <button
                            onClick={nextStep}
                            disabled={status === "SUBMITTING"}
                            className="w-full sm:w-auto group flex items-center justify-center gap-3 rounded-2xl bg-black px-10 py-5 text-sm font-black text-white shadow-2xl transition-all hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                        >
                            {status === "SUBMITTING" ? (
                                "Envoi en cours..."
                            ) : (
                                <>
                                    {isLastPhase ? "Envoyer le formulaire" : "Continuer"}
                                    {isLastPhase ? <Send className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600 font-medium">
                    Propulsé par Obem Studio • Vos données sont sécurisées
                </p>
            </div>

            {status === "ERROR" && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-bold">Une erreur est survenue lors de l'envoi.</span>
                    <button onClick={() => setStatus("IDLE")} className="ml-4 text-xs underline font-bold uppercase">Réessayer</button>
                </div>
            )}
        </div>
    );
}
