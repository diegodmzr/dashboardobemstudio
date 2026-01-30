"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function PWAInstallPrompt() {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        const mobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
        const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

        setIsMobile(mobile);
        setIsIOS(ios);

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);

            const isDismissed = sessionStorage.getItem("pwa-prompt-dismissed");
            if (!isDismissed) {
                setTimeout(() => setIsVisible(true), 3000);
            }
        };

        if (ios) {
            const isDismissed = sessionStorage.getItem("pwa-prompt-dismissed");
            if (!isDismissed) {
                setTimeout(() => setIsVisible(true), 4000);
            }
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Check if app is already installed
        window.addEventListener("appinstalled", () => {
            setInstallPrompt(null);
            setIsVisible(false);
        });

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;

        setIsVisible(false);
        installPrompt.prompt();

        const { outcome } = await installPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        setInstallPrompt(null);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem("pwa-prompt-dismissed", "true");
    };

    if (!isVisible || !isMobile) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="fixed bottom-6 left-6 right-6 z-[200] md:left-auto md:w-96"
            >
                <div className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-[#ece7ef] dark:bg-[#111] dark:border-[#333] dark:shadow-none dark:ring-1 dark:ring-[#333]">
                    {/* Background decoration */}
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-black/5 dark:bg-white/5" />

                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
                            <Smartphone className="h-6 w-6" />
                        </div>

                        <div className="flex-1 space-y-1">
                            <h4 className="text-sm font-bold text-[#2f2f2f] dark:text-white">
                                {isIOS ? "Ajouter à l'écran d'accueil" : "Installer l'application ?"}
                            </h4>
                            <p className="text-xs text-[#8a8a8a] dark:text-gray-400 leading-relaxed">
                                {isIOS
                                    ? "Appuyez sur le bouton de partage et sélectionnez 'Sur l'écran d'accueil'."
                                    : "Accédez plus rapidement à votre dashboard en ajoutant l'icône à votre écran d'accueil."}
                            </p>

                            <div className="flex items-center gap-3 pt-3">
                                {!isIOS && (
                                    <button
                                        onClick={handleInstallClick}
                                        className="flex-1 rounded-full bg-black py-2 text-xs font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black"
                                    >
                                        Installer
                                    </button>
                                )}
                                <button
                                    onClick={handleDismiss}
                                    className={cn(
                                        "rounded-full border border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold text-[#8a8a8a] hover:bg-gray-100 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#222]",
                                        isIOS && "flex-1"
                                    )}
                                >
                                    {isIOS ? "J'ai compris" : "Plus tard"}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleDismiss}
                            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#222]"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
