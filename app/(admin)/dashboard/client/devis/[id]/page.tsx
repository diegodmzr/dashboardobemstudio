import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import ClientQuoteViewer from "@/components/client/ClientQuoteViewer";

export const revalidate = 0;

export default async function ClientQuotePage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/login");
    }

    const { id } = await params;

    const quote = await prisma.quote.findUnique({
        where: { id },
        include: {
            client: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    companyName: true,
                    siret: true,
                    address: true
                }
            }
        }
    });

    if (!quote) {
        return notFound();
    }

    // Security: Only allow the client who owns the quote or an admin
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    if (quote.clientId !== user.id && !isAdmin) {
        redirect("/forbidden");
    }

    // If client, ensure the quote is not in DRAFT status
    if (user.role === "CLIENT" && quote.status === "DRAFT") {
        return notFound();
    }

    return (
        <ClientQuoteViewer quote={quote} user={user} />
    );
}
