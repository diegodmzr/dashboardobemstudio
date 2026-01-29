import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientProjectDetailClient from "@/components/client/ClientProjectDetailClient";

export const dynamic = "force-dynamic";

async function getProjectDetails(projectId: string, clientId: string) {
    try {
        const project = await prisma.project.findUnique({
            where: {
                id: projectId,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        companyName: true,
                    },
                },
            },
        });

        // Ensure the project belongs to the client
        if (!project || project.clientId !== clientId) {
            return null;
        }

        return {
            ...project,
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
            deadline: project.deadline ? project.deadline.toISOString() : null,
        };
    } catch (error) {
        console.error("Error fetching project details:", error);
        return null;
    }
}

export default async function ClientProjectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    if (user.role !== "CLIENT") {
        redirect("/forbidden");
    }

    const { id } = await params;
    const project = await getProjectDetails(id, user.id);

    if (!project) {
        notFound();
    }

    return <ClientProjectDetailClient project={project} />;
}
