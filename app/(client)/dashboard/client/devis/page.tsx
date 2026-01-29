import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientQuotesClient from "@/components/client/ClientQuotesClient";

export const dynamic = "force-dynamic";

export default async function ClientQuotesPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const quotes = await prisma.quote.findMany({
        where: {
            clientId: user.id,
            status: { notIn: ["DRAFT", "draft"] }, // Filter out DRAFT for client
        },
        orderBy: { createdAt: "desc" },
        include: { project: true } // Need project name
    });

    const formattedQuotes = quotes.map(q => ({
        id: q.id,
        reference: q.reference,
        projectId: q.projectId || undefined,
        projectName: q.project?.name,
        status: q.status,
        total: q.total,
        issuedAt: q.issuedAt.toISOString(),
        validUntil: q.validUntil?.toISOString(),
        pdfUrl: q.pdfUrl || undefined,
    }));

    return (
        <ClientQuotesClient
            initialQuotes={formattedQuotes}
            userName={user.name!}
            userEmail={user.email!}
        />
    );
}
