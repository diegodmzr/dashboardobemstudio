import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const currentUser = await getCurrentUser();

        // Check if current user is admin
        if (!currentUser || currentUser.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Non autorisé. Seuls les administrateurs peuvent effectuer cette action." },
                { status: 403 }
            );
        }

        // Disable 2FA for the target user
        await prisma.user.update({
            where: { id },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
            },
        });

        return NextResponse.json({ success: true, message: "La double authentification a été désactivée avec succès." });
    } catch (error) {
        console.error("Error disabling 2FA:", error);
        return NextResponse.json(
            { error: "Une erreur est survenue lors de la désactivation de la 2FA." },
            { status: 500 }
        );
    }
}
