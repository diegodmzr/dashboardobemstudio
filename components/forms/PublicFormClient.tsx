"use client";

import { useState } from "react";
import Image from "next/image";

type Field = {
    label: string;
    type: "text" | "email" | "textarea";
    required?: boolean;
};

export default function PublicFormClient({ form }: { form: any }) {
    const fields: Field[] = JSON.parse(form.fields || "[]");
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<"IDLE" | "SUBMITTING" | "SUCCESS" | "ERROR">("IDLE");

    const handleChange = (label: string, value: string) => {
        setFormData(prev => ({ ...prev, [label]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("SUBMITTING");
        try {
            const res = await fetch(`/api/forms/${form.slug}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setStatus("SUCCESS");
            } else {
                setStatus("ERROR");
            }
        } catch (e) {
            setStatus("ERROR");
        }
    };

    if (status === "SUCCESS") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f6fb] p-4 text-center">
                <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl">
                    <div className="mb-4 flex justify-center text-green-500">
                        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">Merci !</h2>
                    <p className="text-gray-600">Votre réponse a bien été envoyée. Nous reviendrons vers vous très vite.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f6fb] py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8 text-center">
                    {/* Placeholder for Logo if needed */}
                    <div className="mx-auto h-16 w-auto relative mb-6 flex justify-center">
                        <img src="/logonoir.png" alt="Logo" className="h-full w-auto object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
                    {form.description && <p className="mt-2 text-gray-600">{form.description}</p>}
                </div>

                <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5 sm:p-12">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {fields.map((field, idx) => (
                            <div key={idx}>
                                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                {field.type === "textarea" ? (
                                    <textarea
                                        required={field.required}
                                        rows={4}
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                        onChange={e => handleChange(field.label, e.target.value)}
                                        value={formData[field.label] || ""}
                                        placeholder={`Votre ${field.label.toLowerCase()}...`}
                                    />
                                ) : (
                                    <input
                                        type={field.type}
                                        required={field.required}
                                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                        onChange={e => handleChange(field.label, e.target.value)}
                                        value={formData[field.label] || ""}
                                        placeholder={`Votre ${field.label.toLowerCase()}...`}
                                    />
                                )}
                            </div>
                        ))}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={status === "SUBMITTING"}
                                className="w-full rounded-xl bg-black py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
                            >
                                {status === "SUBMITTING" ? "Envoi en cours..." : "Envoyer"}
                            </button>
                        </div>

                        {status === "ERROR" && (
                            <p className="text-center text-sm text-red-600 mt-4">Une erreur est survenue. Veuillez réessayer.</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
