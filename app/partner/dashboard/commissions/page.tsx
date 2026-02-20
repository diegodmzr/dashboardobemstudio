import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PartnerCommissionsClient from "@/components/partner/PartnerCommissionsClient";

export const dynamic = "force-dynamic";

export default async function PartnerCommissionsPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== "PARTNER") redirect("/dashboard");

    const partner = await (prisma as any).user.findUnique({
        where: { id: user.id },
        select: { commissionRate: true, companyName: true }
    });

    const commissions = await (prisma as any).partnerCommission.findMany({
        where: { partnerId: user.id },
        include: {
            project: { select: { id: true, name: true, amount: true, status: true } },
            quote: { select: { id: true, reference: true, total: true, status: true } },
        },
        orderBy: { createdAt: "desc" }
    });

    const totalEarned = commissions.reduce((s: number, c: any) => s + c.commissionAmount, 0);
    const paidAmount = commissions.filter((c: any) => c.status === "PAID").reduce((s: number, c: any) => s + c.commissionAmount, 0);
    const pendingAmount = commissions.filter((c: any) => c.status !== "PAID").reduce((s: number, c: any) => s + c.commissionAmount, 0);

    return (
        <main className="flex-1 px-4 md:px-8 py-6 bg-[#f8f6fb] dark:bg-black min-h-[calc(100vh-80px)]">
            <PartnerCommissionsClient
                commissions={commissions}
                commissionRate={partner?.commissionRate || 10}
                totalEarned={totalEarned}
                paidAmount={paidAmount}
                pendingAmount={pendingAmount}
            />
        </main>
    );
}
