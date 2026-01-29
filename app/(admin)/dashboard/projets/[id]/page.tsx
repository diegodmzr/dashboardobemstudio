import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ClientProjectDetailClient from "@/components/client/ClientProjectDetailClient";

type Props = {
    params: { id: string };
};

export default async function ProjectDetailPage({ params }: Props) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const { id } = await params;

    // Fetch project
    const project = await prisma.project.findUnique({
        where: { id },
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

    if (!project) {
        notFound();
    }

    // CLIENT: Verify ownership
    if (user.role === "CLIENT" && project.clientId !== user.id) {
        redirect("/forbidden");
    }

    // Format project data
    const formattedProject = {
        id: project.id,
        name: project.name,
        status: project.status,
        progress: project.progress,
        type: project.type,
        technology: project.technology,
        deadline: project.deadline ? project.deadline.toISOString() : null,
        amount: project.amount,
        paymentType: project.paymentType,
        progressConfig: project.progressConfig,
        attributes: project.attributes,
        level: project.level,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        client: {
            id: project.client.id,
            name: project.client.name,
            email: project.client.email,
            companyName: project.client.companyName,
        },
    };

    // For now, both roles see the client view
    // TODO: Create admin project detail view
    return <ClientProjectDetailClient project={formattedProject} />;
}
