import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.clientId) {
      return NextResponse.json(
        { error: "Le nom du projet et le client sont requis" },
        { status: 400 }
      );
    }

    // Validate client exists
    const client = await prisma.user.findUnique({
      where: { id: body.clientId },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client introuvable" },
        { status: 404 }
      );
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
        },
        include: {
          client: true,
        },
      });

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
          metadata: JSON.stringify({ name: newProject.name, client: client.name }),
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
    const projects = await prisma.project.findMany({
      include: {
        client: true,
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
