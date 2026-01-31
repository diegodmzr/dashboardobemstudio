import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hash } from "bcryptjs";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        // Prevent self-demotion or self-deletion if needed (optional but recommended)
        if (id === currentUser.id && body.role && body.role !== "SUPER_ADMIN") {
            // Maybe allow it if there's at least one more super admin? 
            // For now let's be simple.
        }

        const data: any = {};
        if (body.name) data.name = body.name;
        if (body.email) data.email = body.email;
        if (body.role) {
            if (!["ADMIN", "SUPER_ADMIN", "CLIENT"].includes(body.role)) {
                return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
            }
            data.role = body.role;
        }
        if (body.status) data.status = body.status;
        if (body.password) {
            data.password = await hash(body.password, 12);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data,
        });

        const { password, ...userWithoutPassword } = updatedUser;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error("Error updating team member:", error);
        return NextResponse.json(
            { error: "Erreur lors de la modification du membre" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        if (id === currentUser.id) {
            return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting team member:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression du membre" },
            { status: 500 }
        );
    }
}
