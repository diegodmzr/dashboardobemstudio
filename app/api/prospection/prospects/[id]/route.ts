import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user || user.role === "CLIENT") return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { name, email, phone, address, company, zoneId, status, notes, latitude, longitude, color } = body;

        const prospect = await prisma.prospect.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                address,
                company,
                zoneId,
                status,
                notes,
                latitude,
                longitude,
                color
            }
        });

        return NextResponse.json(prospect);
    } catch (error) {
        console.error("Failed to update prospect", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user || user.role === "CLIENT") return new NextResponse("Unauthorized", { status: 401 });

        await prisma.prospect.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete prospect", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
