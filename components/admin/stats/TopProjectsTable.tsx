import { Briefcase } from "lucide-react";

type Project = {
    id: string;
    name: string;
    clientName: string;
    amount: number;
    status: string;
    progress: number;
    createdAt: string;
};

type Props = {
    projects: Project[];
};

export default function TopProjectsTable({ projects }: Props) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            "En cours": "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
            "Terminé": "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
            "En attente": "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
            "Annulé": "bg-gray-100 text-gray-500 dark:bg-[#333] dark:text-gray-400",
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-500 dark:bg-[#333] dark:text-gray-400"}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 dark:bg-[#1a1a1a] dark:border-[#333]">
            <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Top 5 Projets
                </h3>
            </div>
            {projects.length > 0 ? (
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-[#333]">
                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                Projet
                            </th>
                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right dark:text-gray-500">
                                Montant
                            </th>
                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 text-center dark:text-gray-500">
                                Statut
                            </th>
                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right dark:text-gray-500">
                                Avancement
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-[#333]">
                        {projects.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition dark:hover:bg-[#222]">
                                <td className="py-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">{p.clientName}</span>
                                    </div>
                                </td>
                                <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(p.amount)}
                                </td>
                                <td className="py-3 text-center">{getStatusBadge(p.status)}</td>
                                <td className="py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-[#333]">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${p.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 w-8 dark:text-gray-400">{p.progress}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center py-12 text-gray-400 text-sm dark:text-gray-500">Aucun projet dans cette période</div>
            )}
        </div>
    );
}
