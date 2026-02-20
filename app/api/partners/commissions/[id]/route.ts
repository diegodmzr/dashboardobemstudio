import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/partners/commissions/[id] — Update commission status (admin)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { status, notes } = body;

        const updateData: any = {};
        if (status !== undefined) {
            updateData.status = status;
            if (status === "PAID") {
                updateData.paidAt = new Date();
            } else {
                updateData.paidAt = null;
            }
        }
        if (notes !== undefined) updateData.notes = notes;

        const commission = await (prisma as any).partnerCommission.update({
            where: { id },
            data: updateData,
            include: {
                partner: { select: { id: true, name: true, email: true } },
                project: { select: { id: true, name: true } },
                quote: { select: { id: true, reference: true } },
            }
        });

        return NextResponse.json(commission);
    } catch (error) {
        console.error("[COMMISSION_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE /api/partners/commissions/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        await (prisma as any).partnerCommission.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[COMMISSION_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
