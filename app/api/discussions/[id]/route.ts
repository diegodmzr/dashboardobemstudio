import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                participants: {
                    include: { user: true }
                },
                messages: {
                    orderBy: { createdAt: "asc" },
                    include: {
                        sender: true,
                        attachments: true
                    }
                },
                project: true
            }
        });

        if (!conversation) return new NextResponse("Not Found", { status: 404 });

        // Access control
        const isParticipant = conversation.participants.some(p => p.userId === user.id);
        if (user.role !== "ADMIN" && !isParticipant) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        return NextResponse.json(conversation);
    } catch (error) {
        console.error("[CONVERSATION_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { status, markAsRead } = body;

        // First check access
        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: { participants: true }
        });

        if (!conversation) return new NextResponse("Not Found", { status: 404 });

        const isParticipant = conversation.participants.some(p => p.userId === user.id);
        if (user.role !== "ADMIN" && !isParticipant) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Update Logic
        if (status) {
            // Only Admin or maybe Owner can change status? Let's allow participants for now
            await prisma.conversation.update({
                where: { id },
                data: { status }
            });
        }

        if (markAsRead) {
            // Update user's participant lastReadAt
            const participant = conversation.participants.find(p => p.userId === user.id);
            if (participant) {
                await prisma.participant.update({
                    where: { id: participant.id },
                    data: { lastReadAt: new Date() }
                });
            }
        }

        const { addParticipantId, removeParticipantId } = body;
        if (addParticipantId) {
            // Check if already exists
            const exists = conversation.participants.some(p => p.userId === addParticipantId);
            if (!exists) {
                await prisma.participant.create({
                    data: {
                        conversationId: id,
                        userId: addParticipantId,
                        role: "OBSERVER" // Default role
                    }
                });
            }
        }

        if (removeParticipantId) {
            // Only admin or owner can remove participants
            const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
            if (!isAdmin) {
                return new NextResponse("Forbidden", { status: 403 });
            }

            const participantToRemove = conversation.participants.find(p => p.userId === removeParticipantId);
            if (participantToRemove) {
                await prisma.participant.delete({
                    where: { id: participantToRemove.id }
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[CONVERSATION_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
