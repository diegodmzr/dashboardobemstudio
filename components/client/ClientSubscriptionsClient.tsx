"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { DollarSign, Layers, Calendar, Clock, CreditCard, ChevronRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import ClientSubscriptionDetailModal from "./ClientSubscriptionDetailModal";
import { useRouter, useSearchParams } from "next/navigation";

type Subscription = {
    id: string;
    status: string;
    amount: number;
    currency: string;
    interval: string;
    currentPeriodEnd: string;
    stripeSubscriptionId: string;
    createdAt: string;
    projectId?: string | null;
    startDate?: string;
    endDate?: string | null;
    commitmentEndDate?: string | null;
    project?: { name: string } | null;
};

export default function ClientSubscriptionsClient() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const { toasts, error, success } = useToast();
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const sessionId = searchParams.get("session_id");
        const successParam = searchParams.get("success");

        if (successParam === "true" && sessionId) {
            const verifySession = async () => {
                try {
                    const res = await fetch("/api/client/subscriptions/verify-session", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sessionId })
                    });
                    const data = await res.json();
                    if (data.success) {
                        success("Prélèvement automatique activé avec succès !");
                        // Refresh data
                        fetchSubscriptions();
                        // Clear URL params
                        router.replace("/dashboard/finances/abonnements");
                    }
                } catch (e) {
                    console.error("Validation error", e);
                }
            };
            verifySession();
        } else {
            fetchSubscriptions();
        }
    }, [searchParams]);

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch("/api/client/subscriptions");
            if (!res.ok) throw new Error("Erreur chargement");
            const data = await res.json();
            setSubscriptions(data.subscriptions || []);
        } catch (err) {
            console.error(err);
            error("Impossible de charger vos abonnements");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);

    const formatDate = (d: string | null | undefined) =>
        d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—";

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

    return (
        <div className="flex flex-col h-full bg-[#f2eff3] dark:bg-black">
            <Toast toasts={toasts} onRemove={() => { }} />
            <Topbar
                title="Mes Abonnements"
                subtitle="Gérez vos services récurrents et paiements"
            />

            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                <ClientSubscriptionDetailModal
                    isOpen={!!selectedSubscription}
                    onClose={() => setSelectedSubscription(null)}
                    subscription={selectedSubscription}
                />

                {subscriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 dark:bg-[#111] dark:border-[#333]">
                        <div className="bg-gray-50 p-4 rounded-full mb-4 dark:bg-[#222]">
                            <Layers className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucun abonnement actif</h3>
                        <p className="text-gray-500 text-sm mt-1">Vous n'avez pas de services récurrents pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subscriptions.map((sub) => (
                            <div
                                key={sub.id}
                                onClick={() => setSelectedSubscription(sub)}
                                className="group relative bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer dark:bg-[#111] dark:border-[#333] dark:shadow-none dark:hover:bg-[#1a1a1a]"
                            >
                                {/* Status Orb */}
                                <div className={`absolute top-6 right-6 w-3 h-3 rounded-full ${sub.status === 'active' ? 'bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.5)]' :
                                    (sub.status === 'past_due' || sub.status === 'incomplete') ? 'bg-orange-400' : 'bg-gray-300'
                                    }`} />

                                <div className="flex flex-col h-full justify-between">
                                    <div>
                                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/10 dark:bg-white dark:shadow-none">
                                            <CreditCard className="w-6 h-6 text-white dark:text-black" />
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-1 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">
                                            {sub.project ? sub.project.name : "Abonnement Service"}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-medium">
                                            Service récurrent
                                        </p>

                                        <div className="mt-6 flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(sub.amount)}
                                            </span>
                                            <span className="text-sm text-gray-400 font-medium">
                                                / {sub.interval === "month" ? "mois" : sub.interval === "quarter" ? "trim" : "an"}
                                            </span>
                                        </div>

                                        {sub.commitmentEndDate && (
                                            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider dark:bg-blue-900/20 dark:text-blue-400">
                                                <Clock className="w-3 h-3" />
                                                Engagement → {formatDate(sub.commitmentEndDate)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between dark:border-[#222]">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Prochaine échéance</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                                                {formatDate(sub.currentPeriodEnd)}
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300 dark:bg-[#222] dark:group-hover:bg-white dark:group-hover:text-black">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
