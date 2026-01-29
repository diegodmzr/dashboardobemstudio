import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import ClientQuoteViewer from "@/components/client/ClientQuoteViewer";

export const dynamic = "force-dynamic";

export default async function ClientQuotePage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user) return notFound();

    const { id } = await params;

    console.log(`[ClientQuotePage] Viewing quote ${id} for user ${user.id}`);

    const quote = await prisma.quote.findUnique({
        where: { id },
        include: { client: true, project: true }
    });

    if (!quote) {
        return <div className="p-10 text-red-500">Erreur : Devis introuvable (ID: {id})</div>;
    }

    if (quote.clientId !== user.id) {
        return (
            <div className="p-10 text-red-500">
                Erreur : Accès refusé.
                <br />
                User ID: {user.id}
                <br />
                Quote Client ID: {quote.clientId}
            </div>
        );
    }

    if (quote.status === "DRAFT") {
        return <div className="p-10 text-orange-500">Ce devis est encore en brouillon.</div>;
    }

    return <ClientQuoteViewer quote={quote} user={user} />;
}
