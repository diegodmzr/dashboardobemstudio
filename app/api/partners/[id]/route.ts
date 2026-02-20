import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/partners/[id] — Update partner (commissionRate, status)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, firstName, lastName, email, phone, companyName, commissionRate, status, password } = body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (companyName !== undefined) updateData.companyName = companyName;
        if (commissionRate !== undefined) updateData.commissionRate = parseFloat(commissionRate);
        if (status !== undefined) updateData.status = status;
        if (password) {
            const bcrypt = await import("bcryptjs");
            updateData.password = await bcrypt.hash(password, 10);
        }

        const partner = await (prisma as any).user.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(partner);
    } catch (error) {
        console.error("[PARTNER_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE /api/partners/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        await (prisma as any).user.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PARTNER_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
