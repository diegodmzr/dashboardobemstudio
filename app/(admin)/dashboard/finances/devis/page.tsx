import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import QuotesClient from "@/components/admin/quotes/QuotesClient";
import ClientQuotesClient from "@/components/client/ClientQuotesClient";

export const revalidate = 0;

export default async function QuotesPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    // CLIENT VIEW: Show only their quotes that have been sent
    if (user.role === "CLIENT") {
        const quotes = await prisma.quote.findMany({
            where: {
                clientId: user.id,
                status: {
                    in: ["SENT", "ACCEPTED", "REJECTED"] // Exclude DRAFT
                }
            },
            include: {
                // Determine project name if possible. 
                // Since relation is not clearly defined in schema as 'project', let's just get raw data.
                // We'll rely on projectId or just show "Projet"
            },
            orderBy: { createdAt: "desc" },
        });

        // Try to fetch project names if projectId exists
        const projectIds = quotes.map(q => q.projectId).filter(Boolean) as string[];
        const projects = await prisma.project.findMany({
            where: { id: { in: projectIds } },
            select: { id: true, name: true },
        });

        const formattedQuotes = quotes.map((q) => {
            const project = projects.find(p => p.id === q.projectId);
            return {
                id: q.id,
                reference: q.reference,
                projectId: q.projectId || undefined,
                projectName: project?.name,
                status: q.status,
                total: q.total,
                issuedAt: q.issuedAt.toISOString(),
                validUntil: q.validUntil ? q.validUntil.toISOString() : undefined,
                pdfUrl: q.pdfUrl || undefined,
                items: JSON.parse(q.items),
            };
        });

        return (
            <ClientQuotesClient
                initialQuotes={formattedQuotes}
                userName={user.name}
                userEmail={user.email}
            />
        );
    }

    // ADMIN VIEW: Show all quotes
    const quotes = await prisma.quote.findMany({
        include: {
            client: {
                select: { id: true, name: true, companyName: true, email: true }
            }
        },
        orderBy: { createdAt: "desc" },
    });

    // Fetch clients for the dropdown
    const clients = await prisma.user.findMany({
        where: { role: "CLIENT" },
        select: { id: true, name: true, companyName: true, email: true },
        orderBy: { name: "asc" },
    });

    // Fetch projects for dropdown
    const projects = await prisma.project.findMany({
        select: { id: true, name: true, clientId: true },
        orderBy: { createdAt: "desc" },
    });

    // Serialize dates for client components
    const serializedQuotes = quotes.map(q => ({
        ...q,
        projectId: q.projectId || undefined,
        notes: q.notes || undefined,
        terms: q.terms || undefined,
        pdfUrl: q.pdfUrl, // Keep null if null
        createdAt: q.createdAt.toISOString(),
        updatedAt: q.updatedAt.toISOString(),
        issuedAt: q.issuedAt.toISOString(),
        validUntil: q.validUntil ? q.validUntil.toISOString() : null,
    }));

    return (
        <QuotesClient
            initialQuotes={serializedQuotes}
            clients={clients}
            projects={projects}
        />
    );
}
