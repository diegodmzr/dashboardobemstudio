"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnimatedLoginBackground } from "@/components/login/AnimatedLoginBackground";

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
        <div className="relative flex min-h-screen items-center justify-center px-4 font-sans overflow-hidden">
            <AnimatedLoginBackground />

            <div className="w-full max-w-md space-y-8 rounded-[2.5rem] bg-white/5 border border-white/10 p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5 animate-fadeIn">
                <div className="text-center">
                    <div className="mb-8 flex justify-center">
                        <img
                            src="/logoblanc.png?v=2"
                            alt="Logo OBEM"
                            className="h-12 w-auto object-contain"
                        />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Mot de passe oublié</h2>
                    <p className="mt-2 text-sm text-gray-400">Entrez votre email pour recevoir un lien de réinitialisation.</p>
                </div>

                {message && (
                    <div className={`rounded-xl p-4 text-sm text-center border backdrop-blur-md ${message.type === "success"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>
                        {message.text}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3.5 !text-white placeholder-gray-500 focus:border-white focus:ring-white focus:bg-black/70 text-sm outline-none transition-all autofill:shadow-[0_0_0_30px_#000000_inset] [selectionColor:white]"
                            style={{ WebkitTextFillColor: 'white' }}
                            placeholder="nom@exemple.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative flex w-full justify-center rounded-2xl bg-white px-4 py-3.5 text-sm font-bold text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all shadow-xl shadow-white/5 hover:shadow-white/10 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Envoi..." : "Envoyer le lien"}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link
                        href="/login"
                        className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-white transition-colors duration-300"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        <span>Retour à la connexion</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

