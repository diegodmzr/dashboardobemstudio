"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            // Using fetch to ensure we read values from DOM at the exact moment of submit
            // and avoiding any React state synchronization issues with autofill
            const response = await fetch("/api/login", {
                method: "POST",
                body: formData,
            });

            // Handle the response (which might be a redirect from the server)
            // We force a navigation to the final URL (dashboard or login with error)
            window.location.href = response.url;
        } catch (error) {
            console.error("Login error:", error);
            setIsLoading(false);
        }
    };

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1.5">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-black focus:bg-white text-sm outline-none transition-all"
                        placeholder="nom@exemple.com"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1.5">Mot de passe</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-black focus:bg-white text-sm outline-none transition-all"
                        placeholder="••••••••"
                    />
                    <div className="flex justify-end mt-2">
                        <Link
                            href="/forgot-password"
                            className="text-xs font-medium text-gray-500 hover:text-black transition-colors"
                        >
                            Mot de passe oublié ?
                        </Link>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-xl bg-black px-4 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? "Connexion..." : "Se connecter"}
            </button>
        </form>
    );
}
