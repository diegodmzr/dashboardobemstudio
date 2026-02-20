import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PartnerHomeClient from "@/components/partner/PartnerHomeClient";

export const dynamic = "force-dynamic";

export default async function PartnerDashboardHome() {
    const user = await getCurrentUser();
    if (!user || user.role !== "PARTNER") {
        redirect("/dashboard");
    }

    // Fetch partner data
    const partner = await (prisma as any).user.findUnique({
        where: { id: user.id },
        select: {
            id: true,
            name: true,
            firstName: true,
            commissionRate: true,
            partnerCommissions: {
                orderBy: { createdAt: "desc" },
                take: 5,
                include: {
                    project: { select: { id: true, name: true, status: true } },
                    quote: { select: { id: true, reference: true, status: true } },
                }
            }
        }
    });

    if (!partner) redirect("/login");

    const totalEarned = partner.partnerCommissions.reduce((s: number, c: any) => s + c.commissionAmount, 0);
    const paidAmount = partner.partnerCommissions.filter((c: any) => c.status === "PAID").reduce((s: number, c: any) => s + c.commissionAmount, 0);
    const pendingAmount = partner.partnerCommissions.filter((c: any) => c.status !== "PAID").reduce((s: number, c: any) => s + c.commissionAmount, 0);

    return (
        <main className="flex-1 px-4 md:px-8 py-6 bg-[#f8f6fb] dark:bg-black min-h-[calc(100vh-80px)]">
            <PartnerHomeClient
                partner={partner}
                totalEarned={totalEarned}
                paidAmount={paidAmount}
                pendingAmount={pendingAmount}
                recentCommissions={partner.partnerCommissions}
            />
        </main>
    );
}
