import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";

type Params = {
    params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        // Check if project exists and get current status
        const existingProject = await prisma.project.findUnique({
            where: { id },
        });

        if (!existingProject) {
            return NextResponse.json(
                { error: "Projet introuvable" },
                { status: 404 }
            );
        }

        // Validate client if changing
        if (body.clientId && body.clientId !== existingProject.clientId) {
            const client = await prisma.user.findUnique({
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
            body.attributes !== undefined
                ? Array.isArray(body.attributes)
                    ? JSON.stringify(body.attributes)
                    : null
                : undefined; // undefined means no change

        const progressConfigJson =
            body.progressConfig !== undefined
                ? body.progressConfig === null
                    ? null
                    : typeof body.progressConfig === "string"
                        ? body.progressConfig
                        : JSON.stringify(body.progressConfig)
                : undefined;

        // Build data object
        const updateData: any = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.clientId !== undefined) updateData.clientId = body.clientId;
        if (body.status !== undefined) {
            updateData.status = body.status;
            // Auto update progress based on status if not provided explicitly
            if (body.progress === undefined) {
                if (body.status === "Brief") updateData.progress = 20;
                if (body.status === "Design") updateData.progress = 40;
                if (body.status === "Dev") updateData.progress = 60;
                if (body.status === "Tests") updateData.progress = 80;
                if (body.status === "Livré") updateData.progress = 100;
            }
        }
        if (body.progress !== undefined) updateData.progress = body.progress;
        if (body.amount !== undefined) updateData.amount = body.amount;
        if (body.type !== undefined) updateData.type = body.type;
        if (body.technology !== undefined) updateData.technology = body.technology;
        if (body.paymentType !== undefined) updateData.paymentType = body.paymentType;
        if (body.deadline !== undefined) updateData.deadline = body.deadline ? new Date(body.deadline) : null;
        if (body.cpp !== undefined) updateData.cpp = body.cpp;
        if (body.commission !== undefined) updateData.commission = body.commission;
        if (attributesJson !== undefined) updateData.attributes = attributesJson;
        if (body.level !== undefined) updateData.level = body.level;
        if (progressConfigJson !== undefined) updateData.progressConfig = progressConfigJson;
        // @ts-ignore
        if (body.formSubmissionId !== undefined) updateData.formSubmissionId = body.formSubmissionId;

        // Handle assignees update if provided
        if (body.assigneeIds !== undefined && Array.isArray(body.assigneeIds)) {
            updateData.assignees = {
                set: body.assigneeIds.map((id: string) => ({ id }))
            };
        }

        // Transaction
        const project = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Update Project
            const updated = await tx.project.update({
                where: { id },
                data: updateData,
                include: { client: true, assignees: true },
            });

            // 2. Status History if changed
            if (body.status && body.status !== existingProject.status) {
                await tx.projectStatusHistory.create({
                    data: {
                        projectId: id,
                        oldStatus: existingProject.status,
                        newStatus: body.status,
                        changedBy: user.id,
                        reason: "Mise à jour via UI",
                    },
                });
            }

            // 3. Audit Log (only if significant changes)
            // For now log all updates
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: "UPDATE_PROJECT",
                    entity: "Project",
                    entityId: id,
                    metadata: JSON.stringify({
                        changedFields: Object.keys(updateData),
                        oldStatus: existingProject.status,
                        newStatus: updated.status
                    }),
                },
            });

            return updated;
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error("Error updating project:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du projet" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;

        // Check if project exists
        const existingProject = await prisma.project.findUnique({
            where: { id },
        });

        if (!existingProject) {
            return NextResponse.json(
                { error: "Projet introuvable" },
                { status: 404 }
            );
        }

        // Delete project
        await prisma.project.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Projet supprimé avec succès" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression du projet" },
            { status: 500 }
        );
    }
}
