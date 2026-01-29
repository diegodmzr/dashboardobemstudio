import ClientsAdminClient from "@/components/admin/ClientsAdminClient";
import Topbar from "@/components/Topbar";
import { prisma } from "@/lib/prisma";
import React from "react";

export const dynamic = "force-dynamic";

async function getClients() {
    try {
        const clients = await prisma.user.findMany({
            where: {
                role: "CLIENT",
            },
            include: {
                projects: {
                    select: {
                        id: true,
                        name: true,
                        amount: true,
                        status: true,
                        progress: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        }) as any[]; // Type assertion to bypass outdated Prisma types

        // Transform data to match Client type in component
        return clients.map((client) => {
            const totalRevenue = client.projects.reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0);
            const projectCount = client.projects.length;

            return {
                ...client,
                // Ensure date is serialized to string for Client Component
                createdAt: client.createdAt.toISOString(),
                updatedAt: client.updatedAt.toISOString(),
                // Add computed metrics
                totalRevenue,
                projectCount,
                // Pass projects with serialized dates
                projects: client.projects.map((p: any) => ({
                    ...p,
                    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
                    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
                })),
                // Handle optional fields that might be null from DB
                phone: client.phone || undefined,
                companyName: client.companyName || undefined,
                companyLogo: client.companyLogo || undefined,
                sector: client.sector || undefined,
                siret: client.siret || undefined,
            };
        });
    } catch (error) {
        console.error("Error fetching clients directly:", error);
        return [];
    }
}

export default async function ClientsPage() {
    const clients = await getClients();

    return (
        <div className="flex h-full flex-col overflow-hidden bg-[#f8f6fb] dark:bg-black">
            <Topbar title="Clients" />
            <div className="flex flex-1 flex-col overflow-y-auto">
                {/* @ts-ignore - Types mismatch on dates are handled but TS might complain about serialized vs Date object */}
                <ClientsAdminClient clients={clients} />
            </div>
        </div>
    );
}
