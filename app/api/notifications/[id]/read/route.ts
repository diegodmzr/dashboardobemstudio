import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const notification = await prisma.notification.findUnique({
            where: { id }
        });

        if (!notification || notification.userId !== user.id) {
            return new NextResponse("Not found or forbidden", { status: 404 });
        }

        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to mark read", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
