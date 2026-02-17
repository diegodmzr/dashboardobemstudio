import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user || user.role === "CLIENT") return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { name, color, status, prospectionDate, assignedTo, coordinates } = body;

        const zone = await prisma.zone.update({
            where: { id },
            data: {
                name,
                color,
                status,
                prospectionDate: prospectionDate ? new Date(prospectionDate) : null,
                assignedTo,
                coordinates
            }
        });

        return NextResponse.json(zone);
    } catch (error) {
        console.error("Failed to update zone", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user || user.role === "CLIENT") return new NextResponse("Unauthorized", { status: 401 });

        await prisma.zone.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete zone", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
