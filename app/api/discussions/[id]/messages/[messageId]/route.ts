import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; messageId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        // Await params for Next.js 15+
        const { messageId } = await params;

        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        if (!message) return new NextResponse("Message not found", { status: 404 });

        if (message.senderId !== user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.message.delete({
            where: { id: messageId }
        });

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error("[MESSAGE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; messageId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { content } = body;

        // Await params for Next.js 15+
        const { messageId } = await params;

        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        if (!message) return new NextResponse("Message not found", { status: 404 });

        if (message.senderId !== user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: { content }
        });

        return NextResponse.json(updatedMessage);
    } catch (error) {
        console.error("[MESSAGE_UPDATE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
