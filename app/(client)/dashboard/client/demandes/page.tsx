import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ClientRequestsClient from "@/components/client/ClientRequestsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClientDemandesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const ticketsData = await prisma.ticket.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" }
  });

  const tickets = ticketsData.map(t => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    category: t.category || "OTHER",
    createdAt: t.createdAt.toISOString(),
    description: undefined // Not fetched/used in list for now or implies separate detail view
  }));

  return (
    <ClientRequestsClient
      initialTickets={tickets}
      userName={user.name}
      userEmail={user.email}
    />
  );
}
