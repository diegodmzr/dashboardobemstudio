import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Le nom du projet est requis" },
        { status: 400 }
      );
    }

    // Validate client exists if provided
    let client = null;
    if (body.clientId) {
      client = await prisma.user.findUnique({
        where: { id: body.clientId },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client introuvable" },
          { status: 404 }
        );
      }
    }

    // Parse attributes/progressConfig
    const attributesJson =
      body.attributes && Array.isArray(body.attributes)
        ? JSON.stringify(body.attributes)
        : null;

    const progressConfigJson =
      body.progressConfig && typeof body.progressConfig === "object"
        ? JSON.stringify(body.progressConfig)
        : null;

    // Use transaction for consistency
    const project = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create Project
      const newProject = await tx.project.create({
        data: {
          name: body.name,
          clientId: body.clientId,
          status: body.status || "Brief",
          progress: body.progress !== undefined ? body.progress : (
            body.status === "Brief" ? 20 :
              body.status === "Design" ? 40 :
                body.status === "Dev" ? 60 :
                  body.status === "Tests" ? 80 :
                    body.status === "Livré" ? 100 : 20 // Default to 20 if Brief/Unknown
          ),
          amount: parseFloat(body.amount) || 0,
          isAmountCustom: body.isAmountCustom || false,
          customAmount: body.customAmount ? parseFloat(body.customAmount) : 0,
          sitePrice: body.sitePrice ? parseFloat(body.sitePrice) : null,
          maintenanceAmount: body.maintenanceAmount ? parseFloat(body.maintenanceAmount) : null,
          maintenanceFrequency: body.maintenanceFrequency || null,
          type: body.type || null,
          technology: body.technology || null,
          paymentType: body.paymentType || null,
          deadline: body.deadline ? new Date(body.deadline) : null,
          cpp: body.cpp ? parseFloat(body.cpp) : null,
          commission: body.commission ? parseFloat(body.commission) : null,
          attributes: attributesJson,
          level: body.level || null,
          progressConfig: progressConfigJson,
          // @ts-ignore
          formSubmissionId: body.formSubmissionId || null,
          assignees: body.assigneeIds && Array.isArray(body.assigneeIds) ? {
            connect: body.assigneeIds.map((id: string) => ({ id }))
          } : undefined,
        },
        include: {
          client: true,
          assignees: true,
          quotes: true,
        },
      });

      // 1.5. Link Quotes
      if (body.quoteIds && Array.isArray(body.quoteIds)) {
        await tx.quote.updateMany({
          where: { id: { in: body.quoteIds } },
          data: { projectId: newProject.id },
        });
      }

      // 2. Initial Status History
      await tx.projectStatusHistory.create({
        data: {
          projectId: newProject.id,
          newStatus: newProject.status,
          changedBy: user.id,
          reason: "Création du projet",
        },
      });

      // 3. Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CREATE_PROJECT",
          entity: "Project",
          entityId: newProject.id,
          metadata: JSON.stringify({ name: newProject.name, client: client?.name || "Aucun" }),
        },
      });

      return newProject;
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du projet" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const projects = await prisma.project.findMany({
      include: {
        client: true,
        assignees: true,
        quotes: {
          select: {
            id: true,
            reference: true,
            total: true,
            status: true,
          }
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des projets" },
      { status: 500 }
    );
  }
}
