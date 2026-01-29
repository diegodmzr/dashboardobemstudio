"use client";

import { User } from "@prisma/client";
import { useState } from "react";

export default function SecurityTab({ user }: { user: User }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: "error", text: "Les nouveaux mots de passe ne correspondent pas." });
            return;
        }

        if (formData.newPassword.length < 8) {
            setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractères." });
            return;
        }

        setIsLoading(true);

        // TODO: Implement API call to /api/settings/password
        console.log("Updating password...", formData);

        // Simulating API delay
        setTimeout(() => {
            setIsLoading(false);
            setMessage({ type: "success", text: "Mot de passe mis à jour avec succès (simulation)." });
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        }, 1000);
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-base font-bold leading-7 text-[#2f2f2f] dark:text-white">Mot de passe</h3>
                <p className="mt-1 text-sm leading-6 text-[#8a8a8a] dark:text-gray-400">
                    Pour changer votre mot de passe, vous devez d'abord confirmer votre mot de passe actuel.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                {message && (
                    <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
                        {message.text}
                    </div>
                )}

                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-bold leading-6 text-[#2f2f2f] dark:text-white">
                        Mot de passe actuel
                    </label>
                    <div className="mt-2">
                        <input
                            type="password"
                            name="currentPassword"
                            id="currentPassword"
                            required
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            className="block w-full rounded-md border border-[#ece7ef] bg-[#f8f6fb] py-2 pl-3 text-[#2f2f2f] shadow-sm outline-none transition focus:border-[#2f2f2f] focus:ring-1 focus:ring-[#2f2f2f] sm:text-sm sm:leading-6 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="newPassword" className="block text-sm font-bold leading-6 text-[#2f2f2f] dark:text-white">
                        Nouveau mot de passe
                    </label>
                    <div className="mt-2">
                        <input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            required
                            minLength={8}
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            className="block w-full rounded-md border border-[#ece7ef] bg-[#f8f6fb] py-2 pl-3 text-[#2f2f2f] shadow-sm outline-none transition focus:border-[#2f2f2f] focus:ring-1 focus:ring-[#2f2f2f] sm:text-sm sm:leading-6 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-bold leading-6 text-[#2f2f2f] dark:text-white">
                        Confirmer le nouveau mot de passe
                    </label>
                    <div className="mt-2">
                        <input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            required
                            minLength={8}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="block w-full rounded-md border border-[#ece7ef] bg-[#f8f6fb] py-2 pl-3 text-[#2f2f2f] shadow-sm outline-none transition focus:border-[#2f2f2f] focus:ring-1 focus:ring-[#2f2f2f] sm:text-sm sm:leading-6 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-x-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                    </button>
                </div>
            </form>
        </div>
    );
}
