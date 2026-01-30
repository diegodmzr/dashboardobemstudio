"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, X, Copy, Check, QrCode } from "lucide-react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export default function TwoFactorSetupModal({ isOpen, onClose, onSuccess }: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [secret, setSecret] = useState("");
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSetup();
            setStep(1);
            setToken("");
            setError("");
        }
    }, [isOpen]);

    const fetchSetup = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/settings/2fa/setup", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setQrCodeUrl(data.qrCodeUrl);
                setSecret(data.secret);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Erreur de communication avec le serveur");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/settings/2fa/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            const data = await res.json();
            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Erreur de communication avec le serveur");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm dark:bg-black/80 animate-fadeIn">
            <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl dark:bg-[#111] dark:ring-1 dark:ring-[#333] animate-scaleIn">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black rounded-lg text-white dark:bg-white dark:text-black">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-[#2f2f2f] dark:text-white">
                            Double authentification
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-[#222]">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-6">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Scannez ce code QR avec votre application d'authentification (Google Authenticator, Authy, etc.).
                            </div>

                            <div className="flex justify-center bg-gray-50 p-6 rounded-2xl dark:bg-[#1a1a1a]">
                                {loading && !qrCodeUrl ? (
                                    <div className="h-48 w-48 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
                                    </div>
                                ) : (
                                    <img src={qrCodeUrl} alt="2FA QR Code" className="h-48 w-48 rounded-lg" />
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Ou saisissez la clé manuellement</label>
                                <div className="flex gap-2">
                                    <code className="flex-1 bg-gray-100 p-3 rounded-xl text-sm font-mono dark:bg-[#222] dark:text-gray-300">
                                        {secret}
                                    </code>
                                    <button
                                        onClick={copyToClipboard}
                                        className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 dark:bg-[#222] dark:hover:bg-[#333]"
                                    >
                                        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-500" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition dark:bg-white dark:text-black dark:hover:bg-gray-200"
                            >
                                Continuer
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Saisissez le code à 6 chiffres généré par votre application pour finaliser la configuration.
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Code de vérification</label>
                                <input
                                    type="text"
                                    placeholder="000000"
                                    maxLength={6}
                                    value={token}
                                    onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                                    className="w-full text-center text-3xl tracking-widest font-bold bg-gray-50 border border-gray-200 p-4 rounded-2xl outline-none focus:border-black dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 dark:bg-red-900/20 dark:border-red-900/50">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="py-4 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 dark:border-[#333] dark:hover:bg-[#222] dark:text-white"
                                >
                                    Retour
                                </button>
                                <button
                                    onClick={handleVerify}
                                    disabled={loading || token.length < 6}
                                    className="bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                >
                                    {loading ? "Vérification..." : "Vérifier"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
