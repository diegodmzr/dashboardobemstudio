"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [requires2FA, setRequires2FA] = useState(false);
    const [userId, setUserId] = useState("");
    const [twoFactorCode, setTwoFactorCode] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                if (data.requires2FA) {
                    setRequires2FA(true);
                    setUserId(data.userId);
                    setIsLoading(false);
                } else if (data.redirect) {
                    window.location.href = data.redirect;
                }
            } else {
                setError(data.error || "Une erreur est survenue");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Erreur de connexion au serveur");
            setIsLoading(false);
        }
    };

    const handle2FAVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/login/2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, token: twoFactorCode }),
            });

            const data = await response.json();

            if (response.ok && data.redirect) {
                window.location.href = data.redirect;
            } else {
                setError(data.error || "Code invalide");
                setIsLoading(false);
            }
        } catch (error) {
            setError("Erreur de connexion au serveur");
            setIsLoading(false);
        }
    };

    if (requires2FA) {
        return (
            <form className="mt-8 space-y-6" onSubmit={handle2FAVerify}>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4 mb-6">Double authentification</h2>
                    <p className="text-sm text-gray-400 mb-8">
                        Veuillez saisir le code à 6 chiffres généré par votre application d'authentification.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs text-center">
                        {error}
                    </div>
                )}

                <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                    className="block w-full text-center text-3xl tracking-widest font-bold rounded-2xl border border-white/20 bg-black/50 px-4 py-5 text-white focus:border-white focus:ring-white outline-none transition-all autofill:shadow-[0_0_0_30px_#000000_inset] autofill:text-fill-white"
                    required
                    autoFocus
                />

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setRequires2FA(false)}
                        className="flex-1 rounded-xl border border-white/10 px-4 py-3.5 text-sm font-semibold text-gray-300 hover:bg-white/5"
                    >
                        Retour
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || twoFactorCode.length < 6}
                        className="flex-[2] rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black hover:bg-gray-200 disabled:opacity-70 shadow-lg shadow-white/10"
                    >
                        {isLoading ? "Vérification..." : "Vérifier"}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs text-center animate-shake backdrop-blur-sm">
                    {error}
                </div>
            )}
            <div className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="block w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3.5 text-white placeholder-gray-500 focus:border-white focus:ring-white focus:bg-black/70 text-sm outline-none transition-all autofill:shadow-[0_0_0_30px_#000000_inset] autofill:text-fill-white"
                        placeholder="nom@exemple.com"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Mot de passe</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="block w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3.5 text-white placeholder-gray-500 focus:border-white focus:ring-white focus:bg-black/70 text-sm outline-none transition-all autofill:shadow-[0_0_0_30px_#000000_inset] autofill:text-fill-white"
                        placeholder="••••••••"
                    />
                    <div className="flex justify-end mt-2">
                        <Link
                            href="/forgot-password"
                            className="text-xs font-medium text-gray-500 hover:text-white transition-colors"
                        >
                            Mot de passe oublié ?
                        </Link>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-2xl bg-white px-4 py-3.5 text-sm font-bold text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all shadow-xl shadow-white/5 hover:shadow-white/10 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? "Connexion..." : "Se connecter"}
            </button>
        </form>
    );
}
