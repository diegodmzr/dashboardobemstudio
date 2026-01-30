"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch("/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: "success", text: "Si cet email existe, un lien de réinitialisation vous a été envoyé." });
                setEmail("");
            } else {
                setMessage({ type: "error", text: data.error || "Une erreur est survenue." });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Erreur de connexion au serveur." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f2eff3] px-4 font-sans">
            <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5">
                <div className="text-center">
                    <div className="mx-auto h-12 relative mb-6 flex justify-center">
                        <img
                            src="/logonoir.png"
                            alt="Logo OBEM"
                            className="h-full w-auto object-contain"
                        />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Mot de passe oublié</h2>
                    <p className="mt-2 text-sm text-gray-600">Entrez votre email pour recevoir un lien de réinitialisation.</p>
                </div>

                {message && (
                    <div className={`rounded-xl p-4 text-sm text-center border ${message.type === "success"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        }`}>
                        {message.text}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1.5">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-black focus:bg-white text-sm outline-none transition-all"
                            placeholder="nom@exemple.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative flex w-full justify-center rounded-xl bg-black px-4 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Envoi..." : "Envoyer le lien"}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
}
