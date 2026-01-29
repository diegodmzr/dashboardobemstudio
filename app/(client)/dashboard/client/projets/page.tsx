import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientProjectsClient from "@/components/client/ClientProjectsClient";

export const dynamic = "force-dynamic";

async function getClientProjects(clientId: string) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        clientId: clientId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return projects.map((project) => ({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      deadline: project.deadline ? project.deadline.toISOString() : null,
    }));
  } catch (error) {
    console.error("Error fetching client projects:", error);
    return [];
  }
}

export default async function ClientProjectsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "CLIENT") {
    redirect("/forbidden");
  }

  const projects = await getClientProjects(user.id);

  return <ClientProjectsClient projects={projects} userName={user.name} userEmail={user.email} />;
}
