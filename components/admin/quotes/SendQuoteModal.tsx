"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mail, CheckCircle2, PartyPopper, AlertCircle } from "lucide-react";

type SendQuoteModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    quoteReference: string;
    loading?: boolean;
    isSuccess?: boolean;
    error?: string | null;
};

export default function SendQuoteModal({
    isOpen,
    onClose,
    onConfirm,
    quoteReference,
    loading,
    isSuccess,
    error
}: SendQuoteModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-all"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-md w-full overflow-hidden border border-gray-100 dark:border-[#1a1a1a]"
                        >
                            {isSuccess ? (
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <PartyPopper className="w-8 h-8 text-emerald-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Devis envoyé !</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                        Le devis <span className="font-semibold text-gray-900 dark:text-white">{quoteReference}</span> a été transmis avec succès à votre client.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm shadow-xl shadow-black/5 hover:bg-zinc-800 transition-all active:scale-[0.98]"
                                    >
                                        Terminer
                                    </button>
                                </div>
                            ) : error ? (
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <AlertCircle className="w-8 h-8 text-rose-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Erreur d'envoi</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed line-clamp-3">
                                        {error}
                                    </p>
                                    <p className="text-xs text-rose-500 dark:text-rose-400 mb-8 bg-rose-50 dark:bg-rose-500/5 p-3 rounded-xl italic">
                                        Conseil : Vérifiez que votre domaine est bien vérifié sur Resend.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 py-4 rounded-2xl border border-gray-200 dark:border-[#222] text-gray-600 dark:text-gray-300 font-bold text-sm"
                                        >
                                            Fermer
                                        </button>
                                        <button
                                            onClick={onConfirm}
                                            className="flex-1 py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm"
                                        >
                                            Réessayer
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Header */}
                                    <div className="p-8 pb-4">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#111] flex items-center justify-center border border-gray-100 dark:border-[#222]">
                                                <Mail className="w-5 h-5 text-black dark:text-white" />
                                            </div>
                                            <button
                                                onClick={onClose}
                                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Confirmation d'envoi</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Document : <span className="font-semibold text-gray-900 dark:text-white">{quoteReference}</span>
                                        </p>
                                    </div>

                                    {/* Content */}
                                    <div className="px-8 py-4 space-y-6">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            Le devis sera envoyé instantanément à votre client par email et via son espace personnel.
                                        </p>

                                        <div className="space-y-3">
                                            {[
                                                "Signature électronique activée",
                                                "Liaison avec le projet automatique",
                                                "Notification push client"
                                            ].map((text, i) => (
                                                <div key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    <span>{text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="p-8 pt-6 flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={onClose}
                                            disabled={loading}
                                            className="flex-1 px-6 py-3.5 rounded-2xl border border-gray-200 dark:border-[#222] text-gray-600 dark:text-gray-400 text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#111] transition-all disabled:opacity-50"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={onConfirm}
                                            disabled={loading}
                                            className="flex-[1.5] px-6 py-3.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xl shadow-black/5 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    Envoi en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <span>Confirmer l'envoi</span>
                                                    <Send className="w-3.5 h-3.5" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
