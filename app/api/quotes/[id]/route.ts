import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

        const existingQuote = await prisma.quote.findUnique({ where: { id } });
        if (!existingQuote) {
            return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
        }

        // Prepare update data
        const updateData: any = {};
        if (body.clientId) updateData.clientId = body.clientId;
        if (body.projectId !== undefined) updateData.projectId = body.projectId;
        if (body.status) updateData.status = body.status;
        if (body.issuedAt) updateData.issuedAt = new Date(body.issuedAt);
        if (body.validUntil) updateData.validUntil = body.validUntil ? new Date(body.validUntil) : null;
        if (body.items) updateData.items = JSON.stringify(body.items);
        if (body.subtotal !== undefined) updateData.subtotal = parseFloat(body.subtotal);
        if (body.taxRate !== undefined) updateData.taxRate = parseFloat(body.taxRate);
        if (body.taxAmount !== undefined) updateData.taxAmount = parseFloat(body.taxAmount);
        if (body.total !== undefined) updateData.total = parseFloat(body.total);
        if (body.notes !== undefined) updateData.notes = body.notes;
        if (body.terms !== undefined) updateData.terms = body.terms;
        if (body.termSections !== undefined) updateData.termsConfig = JSON.stringify(body.termSections);
        if (body.paymentType !== undefined) updateData.paymentType = body.paymentType;
        if (body.isRecurring !== undefined) updateData.isRecurring = body.isRecurring;
        if (body.stripeAutoSend !== undefined) updateData.stripeAutoSend = body.stripeAutoSend;

        const updatedQuote = await prisma.quote.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updatedQuote);
    } catch (error) {
        console.error("Error updating quote:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du devis" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const { id } = await params;

        await prisma.quote.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Devis supprimé" });
    } catch (error) {
        console.error("Error deleting quote:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression du devis" },
            { status: 500 }
        );
    }
}
