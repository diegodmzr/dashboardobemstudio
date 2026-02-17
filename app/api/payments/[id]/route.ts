import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        const updatedPayment = await prisma.payment.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(updatedPayment);
    } catch (error) {
        console.error("Error updating payment:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du paiement" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = await params;

        await prisma.payment.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Paiement supprimé" });
    } catch (error) {
        console.error("Error deleting payment:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression du paiement" },
            { status: 500 }
        );
    }
}
