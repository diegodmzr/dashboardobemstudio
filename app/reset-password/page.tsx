import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { AnimatedLoginBackground } from "@/components/login/AnimatedLoginBackground";

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
            <div className="text-center space-y-6 py-4 animate-scaleIn">
                <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 backdrop-blur-md">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Mot de passe modifié !</h2>
                    <p className="text-gray-400 text-sm">Votre mot de passe a été réinitialisé avec succès. Redirection vers la connexion...</p>
                </div>
                <Link
                    href="/login"
                    className="inline-block mt-4 text-sm font-semibold text-white/70 hover:text-white transition-colors"
                >
                    Aller à la page de connexion maintenant
                </Link>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="text-center space-y-6 py-4 animate-scaleIn">
                <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30 backdrop-blur-md">
                        <AlertCircle className="w-10 h-10 text-rose-400" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Lien invalide</h2>
                    <p className="text-gray-400 text-sm">Ce lien de réinitialisation est manquant ou expiré.</p>
                </div>
                <Link
                    href="/forgot-password"
                    className="inline-block px-8 py-3.5 bg-white text-black rounded-2xl font-bold text-sm shadow-xl shadow-white/5 hover:shadow-white/10 hover:-translate-y-0.5 transition-all"
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
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Nouveau mot de passe</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3.5 !text-white placeholder-gray-500 focus:border-white focus:ring-white focus:bg-black/70 text-sm outline-none transition-all pr-12 autofill:shadow-[0_0_0_30px_#000000_inset]"
                            style={{ WebkitTextFillColor: 'white' }}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Confirmer le mot de passe</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3.5 !text-white placeholder-gray-500 focus:border-white focus:ring-white focus:bg-black/70 text-sm outline-none transition-all autofill:shadow-[0_0_0_30px_#000000_inset]"
                        style={{ WebkitTextFillColor: 'white' }}
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {status === "error" && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400 text-center backdrop-blur-sm animate-shake">
                    {errorMsg}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-2xl bg-white px-4 py-3.5 text-sm font-bold text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all shadow-xl shadow-white/5 hover:shadow-white/10 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? "Traitement..." : "Confirmer le nouveau mot de passe"}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
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
                    <h2 className="text-2xl font-bold tracking-tight text-white">Réinitialisation</h2>
                    <p className="mt-2 text-sm text-gray-400">Choisissez un mot de passe sécurisé pour votre compte.</p>
                </div>

                <Suspense fallback={<div className="text-center py-8 text-gray-400 animate-pulse text-sm">Chargement du formulaire...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}

