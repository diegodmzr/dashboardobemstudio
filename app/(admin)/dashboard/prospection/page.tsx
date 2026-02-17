import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProspectionClient from "@/components/admin/prospection/ProspectionClient";
import Topbar from "@/components/Topbar";
import { Map, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProspectionPage() {
    const user = await getCurrentUser();

    if (!user || user.role === "CLIENT") {
        redirect("/dashboard");
    }

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.4))]">
            <Topbar
                title="Prospection"
                subtitle="Gérez vos zones et prospects"
                userName={user.name}
                userEmail={user.email}
                rightContent={
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider dark:bg-blue-900/20 dark:text-blue-400">
                            Mode Admin
                        </div>
                    </div>
                }
            />

            <div className="flex-1 p-4 md:p-6 overflow-hidden">
                <ProspectionClient />
            </div>
        </div>
    );
}
