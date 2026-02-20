import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PartnerProjectsClient from "@/components/partner/PartnerProjectsClient";

export const dynamic = "force-dynamic";

export default async function PartnerProjectsPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== "PARTNER") redirect("/dashboard");

    // Fetch projects linked via commissions for this partner
    const commissions = await (prisma as any).partnerCommission.findMany({
        where: { partnerId: user.id, projectId: { not: null } },
        include: {
            project: {
                include: {
                    client: { select: { name: true, email: true, companyName: true } },
                    quotes: { select: { id: true, reference: true, total: true, status: true } },
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    // Deduplicate by project
    const projectMap = new Map();
    for (const c of commissions) {
        if (c.project && !projectMap.has(c.project.id)) {
            projectMap.set(c.project.id, {
                ...c.project,
                myCommission: c
            });
        }
    }

    const projects = Array.from(projectMap.values());

    return (
        <main className="flex-1 px-4 md:px-8 py-6 bg-[#f8f6fb] dark:bg-black min-h-[calc(100vh-80px)]">
            <PartnerProjectsClient projects={projects} />
        </main>
    );
}
