"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Props = {
    payments: any[];
    role: "ADMIN" | "CLIENT";
};

export default function PaymentsBlock({ payments, role }: Props) {
    const router = useRouter();

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 dark:bg-[#111] dark:border-[#333]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">
                    {role === "ADMIN" ? "Derniers Paiements" : "Vos Paiements"}
                </h3>
                <button
                    onClick={() => router.push(role === 'ADMIN' ? '/dashboard/finances/paiements' : '/dashboard/finances/paiements')}
                    className="text-xs font-semibold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white flex items-center"
                >
                    Voir tout <ChevronRight className="w-3 h-3 ml-0.5" />
                </button>
            </div>

            <div className="space-y-4">
                {payments.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-4">Aucun paiement récent</div>
                ) : (
                    payments.map((payment) => (
                        <div
                            key={payment.id}
                            className="flex items-center justify-between group cursor-pointer"
                            onClick={() => router.push(`/dashboard/finances/paiements?paymentId=${payment.id}`)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${payment.status === "PAID"
                                    ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                                    : "bg-gray-50 text-gray-500 dark:bg-[#222] dark:text-gray-400"
                                    }`}>
                                    {payment.status === "PAID" ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 group-hover:underline dark:text-white">
                                        {payment.status === "PAID" ? "Paiement reçu" : "En attente"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {format(new Date(payment.createdAt), "d MMM yyyy", { locale: fr })}
                                        {role === "ADMIN" && payment.client && ` • ${payment.client.name}`}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                    {payment.amount.toLocaleString("fr-FR")} €
                                </div>
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${payment.status === "PAID" ? "text-green-600 dark:text-green-400" :
                                    payment.status === "PENDING" ? "text-orange-500" :
                                        "text-red-500"
                                    }`}>
                                    {payment.status === "PAID" ? "Payé" : payment.status === "PENDING" ? "En attente" : "Échoué"}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
