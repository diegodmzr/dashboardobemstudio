"use client";

import { useState } from "react";
import Topbar from "@/components/Topbar";
import { useRouter } from "next/navigation";

export type Ticket = {
    id: string;
    title: string;
    status: string; // OPEN, IN_PROGRESS, CLOSED
    priority: string; // LOW, MEDIUM, HIGH, URGENT
    category?: string;
    createdAt: string;
    description?: string; // Add description if available
};

type Props = {
    initialTickets: Ticket[];
    userName?: string;
    userEmail?: string;
};

export default function ClientRequestsClient({ initialTickets, userName, userEmail }: Props) {
    const router = useRouter();
    const [tickets, setTickets] = useState(initialTickets);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        category: "SUPPORT",
        priority: "MEDIUM",
        description: ""
    });

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            OPEN: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            IN_PROGRESS: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
            CLOSED: "bg-gray-100 text-gray-500 dark:bg-[#222] dark:text-gray-400",
        };
        const labels: Record<string, string> = {
            OPEN: "Ouvert",
            IN_PROGRESS: "En cours",
            CLOSED: "Clôturé",
        };
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || styles.OPEN}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const labels: Record<string, string> = {
            LOW: "Basse", MEDIUM: "Moyenne", HIGH: "Haute", URGENT: "Urgente"
        };
        return <span className="text-xs text-gray-500 dark:text-gray-400">{labels[priority] || priority}</span>;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error("Erreur création ticket");

            router.refresh();
            setIsCreateOpen(false);
            setFormData({ title: "", category: "SUPPORT", priority: "MEDIUM", description: "" });
            // Optimistic update or wait for refresh
        } catch (error) {
            alert("Erreur lors de la création de la demande.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Topbar
                title="Mes Demandes"
                userName={userName}
                userEmail={userEmail}
                rightContent={
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="cursor-pointer rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        + Nouvelle demande
                    </button>
                }
            />

            <main className="flex-1 px-8 py-6 bg-[#f8f6fb] dark:bg-black min-h-screen">
                {initialTickets.length === 0 ? (
                    <div className="mt-20 flex flex-col items-center justify-center text-center">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#f1eff3] dark:bg-[#222]">
                            <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        </div>
                        <h3 className="mb-1 text-lg font-bold text-[#2f2f2f] dark:text-white">Aucune demande en cours</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Besoin d'aide ou d'une évolution ? Créez un ticket.</p>
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="cursor-pointer text-sm font-semibold text-black underline dark:text-white"
                        >
                            Créer ma première demande
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {initialTickets.map((ticket) => (
                            <div key={ticket.id} className="group relative flex items-center justify-between rounded-2xl border border-[#e0e0e0] bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.04)] transition hover:shadow-md dark:bg-[#1a1a1a] dark:border-[#333]">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-semibold text-[#2f2f2f] dark:text-white">{ticket.title}</h3>
                                        {getStatusBadge(ticket.status)}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span>{new Date(ticket.createdAt).toLocaleDateString("fr-FR")}</span>
                                        <span>•</span>
                                        <span>{ticket.category}</span>
                                        <span>•</span>
                                        {getPriorityBadge(ticket.priority)}
                                    </div>
                                </div>
                                <div className="text-gray-400">
                                    {/* Chevron or Action */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Drawer/Modal */}
            {isCreateOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCreateOpen(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl pointer-events-auto animate-in scale-in-95 duration-200 dark:bg-[#111]">
                            <h2 className="text-xl font-bold text-[#2f2f2f] mb-6 dark:text-white">Nouvelle demande</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Sujet</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full rounded-xl border border-[#e0e0e0] p-3 text-sm outline-none focus:border-black dark:bg-[#222] dark:border-[#333] dark:text-white dark:focus:border-white"
                                        placeholder="Ex: Bug sur la page Contact"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Catégorie</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full rounded-xl border border-[#e0e0e0] p-3 text-sm outline-none focus:border-black dark:bg-[#222] dark:border-[#333] dark:text-white"
                                        >
                                            <option value="SUPPORT">Support Technique</option>
                                            <option value="FEATURE">Nouvelle Fonctionnalité</option>
                                            <option value="OTHER">Autre</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Priorité</label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full rounded-xl border border-[#e0e0e0] p-3 text-sm outline-none focus:border-black dark:bg-[#222] dark:border-[#333] dark:text-white"
                                        >
                                            <option value="LOW">Basse</option>
                                            <option value="MEDIUM">Moyenne</option>
                                            <option value="HIGH">Haute</option>
                                            <option value="URGENT">Urgente</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full rounded-xl border border-[#e0e0e0] p-3 text-sm outline-none focus:border-black dark:bg-[#222] dark:border-[#333] dark:text-white dark:focus:border-white"
                                        placeholder="Décrivez votre demande en détail..."
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="flex-1 rounded-full border border-[#e0e0e0] py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 dark:border-[#333] dark:text-gray-300 dark:hover:bg-[#222]"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 rounded-full bg-black py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black"
                                    >
                                        {isLoading ? "Envoi..." : "Envoyer la demande"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
