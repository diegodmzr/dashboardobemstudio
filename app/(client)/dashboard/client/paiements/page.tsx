import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ClientPaymentsClient from "@/components/client/ClientPaymentsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClientPaiementsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch Payments
  const paymentsData = await prisma.payment.findMany({
    where: { clientId: user.id },
    include: {
      project: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const payments = paymentsData.map((p) => ({
    id: p.id,
    projectId: p.projectId || undefined,
    projectName: p.project?.name || "Projet standard",
    description: p.description,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    type: p.type,
    dueDate: p.dueDate?.toISOString(),
    paidAt: p.paidAt?.toISOString(),
    invoiceUrl: p.invoiceUrl || undefined,
    method: p.method || undefined,
    last4: p.last4 || undefined,
    createdAt: p.createdAt.toISOString(),
  }));

  // Fetch Quotes (Devis)
  // Only show relevant quotes (not drafts, unless specific logic)
  // Clients usually shouldn't see Admin Drafts.
  const quotesData = await prisma.quote.findMany({
    where: {
      clientId: user.id,
      status: { not: "DRAFT" }
    },
    include: {
      project: {
        select: { name: true }
      }
    },
    orderBy: { issuedAt: "desc" }
  });

  const quotes = quotesData.map((q) => ({
    id: q.id,
    reference: q.reference,
    projectName: q.project?.name || "Projet standard",
    issuedAt: q.issuedAt.toISOString(),
    validUntil: q.validUntil?.toISOString(),
    total: q.total,
    status: q.status,
    pdfUrl: `/api/quotes/${q.id}/pdf`, // Link to PDF endpoint
    items: q.items
  }));

  return (
    <ClientPaymentsClient
      initialPayments={payments}
      initialQuotes={quotes}
      userName={user.name}
      userEmail={user.email}
    />
  );
}
