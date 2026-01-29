import ProjectsAdminClient from "@/components/admin/ProjectsAdminClient";
import ClientProjectsClient from "@/components/client/ClientProjectsClient";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

export const revalidate = 0;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Unwrapping searchParams because it can be a promise in newer Next.js versions
  const awaitedSearchParams = await searchParams;

  const statusParam = awaitedSearchParams.status;
  const statuses = typeof statusParam === "string" ? statusParam.split(",") : undefined;

  const typeParam = awaitedSearchParams.type;
  const types = typeof typeParam === "string" ? typeParam.split(",") : undefined;

  const search = typeof awaitedSearchParams.search === "string" ? awaitedSearchParams.search : undefined;

  // CLIENT VIEW: Show only their projects
  if (user.role === "CLIENT") {
    const clientProjects = await prisma.project.findMany({
      where: {
        clientId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const projects = clientProjects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      progress: p.progress,
      type: p.type,
      technology: p.technology,
      deadline: p.deadline ? p.deadline.toISOString() : null,
      amount: p.amount,
      progressConfig: p.progressConfig,
      createdAt: p.createdAt.toISOString(),
    }));

    return <ClientProjectsClient projects={projects} userName={user.name} userEmail={user.email} />;
  }

  // ADMIN VIEW: Show all projects with filters
  const where: Prisma.ProjectWhereInput = {
    ...(statuses && { status: { in: statuses } }),
    ...(types && { type: { in: types } }),
    ...(search && {
      OR: [
        { name: { contains: search } },
        { client: { name: { contains: search } } },
      ],
    }),
  };

  const projectsData = await prisma.project.findMany({
    where,
    include: {
      client: {
        select: {
          name: true,
        },
      },
      formSubmission: {
        select: {
          id: true,
          form: { select: { title: true } }
        }
      }
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const projects = projectsData.map((p) => ({
    id: p.id,
    name: p.name,
    clientId: p.clientId,
    // @ts-ignore
    clientName: p.client.name,
    status: p.status,
    progress: p.progress,
    amount: p.amount,
    type: p.type,
    technology: p.technology,
    paymentType: p.paymentType,
    deadline: p.deadline ? p.deadline.toISOString() : null,
    cpp: p.cpp,
    commission: p.commission,
    attributes: p.attributes ? (JSON.parse(p.attributes) as string[]) : [],
    level: p.level,
    createdAt: p.createdAt.toISOString(),
    progressConfig: p.progressConfig,
    // @ts-ignore
    formSubmissionId: p.formSubmissionId,
    // @ts-ignore
    formSubmissionTitle: p.formSubmission?.form.title
  }));

  return <ProjectsAdminClient projects={projects} />;
}
