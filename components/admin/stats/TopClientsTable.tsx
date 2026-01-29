import { Trophy } from "lucide-react";

type Client = {
    id: string;
    name: string;
    companyName: string | null;
    revenue: number;
    activeProjects: number;
    lastActivity: string;
};

type Props = {
    clients: Client[];
};

export default function TopClientsTable({ clients }: Props) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 dark:bg-[#1a1a1a] dark:border-[#333]">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Top 5 Clients
                </h3>
            </div>
            {clients.length > 0 ? (
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-[#333]">
                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                Client
                            </th>
                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right dark:text-gray-500">
                                Projets
                            </th>
                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right dark:text-gray-500">
                                CA
                            </th>
                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right dark:text-gray-500">
                                Dernier
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-[#333]">
                        {clients.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50 transition dark:hover:bg-[#222]">
                                <td className="py-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
                                        {c.companyName && <span className="text-xs text-gray-400 dark:text-gray-500">{c.companyName}</span>}
                                    </div>
                                </td>
                                <td className="py-3 text-right text-gray-600 dark:text-gray-400">{c.activeProjects}</td>
                                <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(c.revenue)}
                                </td>
                                <td className="py-3 text-right text-xs text-gray-500 dark:text-gray-500">{formatDate(c.lastActivity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center py-12 text-gray-400 text-sm dark:text-gray-500">Aucun client dans cette période</div>
            )}
        </div>
    );
}
