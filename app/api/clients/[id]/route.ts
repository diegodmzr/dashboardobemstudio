import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

type Params = {
    params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const client = await prisma.user.findUnique({
            where: { id },
            include: {
                projects: true,
            },
        });

        if (!client) {
            return NextResponse.json(
                { error: "Client introuvable" },
                { status: 404 }
            );
        }

        const { password, ...clientWithoutPassword } = client;

        return NextResponse.json(clientWithoutPassword);
    } catch (error) {
        console.error("Error fetching client:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération du client" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Check if client exists
        const existingClient = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingClient) {
            return NextResponse.json(
                { error: "Client introuvable" },
                { status: 404 }
            );
        }

        const updateData: any = {};
        if (body.name) updateData.name = body.name;
        if (body.email) {
            // Check if email is available if changed
            if (body.email !== existingClient.email) {
                const emailExists = await prisma.user.findUnique({
                    where: { email: body.email },
                });
                if (emailExists) {
                    return NextResponse.json(
                        { error: "Cet email est déjà utilisé" },
                        { status: 400 }
                    );
                }
            }
            updateData.email = body.email;
        }
        if (body.phone !== undefined) updateData.phone = body.phone;
        if (body.companyName !== undefined) updateData.companyName = body.companyName;
        if (body.companyLogo !== undefined) updateData.companyLogo = body.companyLogo;
        if (body.sector !== undefined) updateData.sector = body.sector;
        if (body.siret !== undefined) updateData.siret = body.siret;
        if (body.status !== undefined) updateData.status = body.status;

        if (body.password) {
            updateData.password = await hash(body.password, 12);
        }

        const updatedClient = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        const { password, ...clientWithoutPassword } = updatedClient;

        return NextResponse.json(clientWithoutPassword);
    } catch (error) {
        console.error("Error updating client:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du client" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;

        // Check for dependencies (projects)
        const projects = await prisma.project.findMany({
            where: { clientId: id },
        });

        if (projects.length > 0) {
            return NextResponse.json(
                { error: "Impossible de supprimer ce client car il a des projets associés." },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Client supprimé avec succès" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting client:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression du client" },
            { status: 500 }
        );
    }
}
