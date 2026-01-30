"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMsg("Les mots de passe ne correspondent pas.");
            setStatus("error");
            return;
        }

        if (password.length < 6) {
            setErrorMsg("Le mot de passe doit contenir au moins 6 caractères.");
            setStatus("error");
            return;
        }

        setIsLoading(true);
        setStatus("idle");

        try {
            const response = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus("success");
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } else {
                setErrorMsg(data.error || "Une erreur est survenue.");
                setStatus("error");
            }
        } catch (error) {
            setErrorMsg("Erreur de connexion au serveur.");
            setStatus("error");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "success") {
        return (
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Mot de passe modifié !</h2>
                <p className="text-gray-600">Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.</p>
                <Link
                    href="/login"
                    className="inline-block mt-4 text-sm font-semibold text-black hover:underline"
                >
                    Aller à la page de connexion immédiatement
                </Link>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Lien invalide</h2>
                <p className="text-gray-600">Ce lien de réinitialisation est manquant ou corrompu.</p>
                <Link
                    href="/forgot-password"
                    className="inline-block px-6 py-3 bg-black text-white rounded-xl font-semibold"
                >
                    Demander un nouveau lien
                </Link>
            </div>
        );
    }

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1.5">Nouveau mot de passe</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-black focus:ring-black focus:bg-white text-sm outline-none transition-all pr-10"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1.5">Confirmer le mot de passe</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-black focus:ring-black focus:bg-white text-sm outline-none transition-all"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {status === "error" && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600 text-center">
                    {errorMsg}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-xl bg-black px-4 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all shadow-lg shadow-black/20"
            >
                {isLoading ? "Traitement..." : "Confirmer le nouveau mot de passe"}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
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
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Définir un nouveau mot de passe</h2>
                    <p className="mt-2 text-sm text-gray-600">Choisissez un mot de passe sécurisé pour votre compte.</p>
                </div>

                <Suspense fallback={<div className="text-center py-4">Chargement...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
