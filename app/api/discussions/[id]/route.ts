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
        const { status, markAsRead, isArchived } = body;

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
        const updateData: any = {};
        if (status) updateData.status = status;
        if (isArchived !== undefined) updateData.isArchived = isArchived;

        if (Object.keys(updateData).length > 0) {
            await prisma.conversation.update({
                where: { id },
                data: updateData
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

        // Authorization for managing participants
        const userParticipant = conversation.participants.find(p => p.userId === user.id);
        const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
        const isOwner = userParticipant?.role === "OWNER";

        if (addParticipantId || removeParticipantId) {
            if (!isAdmin && !isOwner) {
                return new NextResponse("Forbidden: Only owners or admins can manage participants", { status: 403 });
            }
        }

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
            // Check if removing self (usually allowed?) or removing someone else (owner/admin only)
            // But based on request, restriction is for the action in general.

            const participantToRemove = conversation.participants.find(p => p.userId === removeParticipantId);
            if (participantToRemove) {
                // Prevent removing the owner if not an admin? 
                if (participantToRemove.role === "OWNER" && !isAdmin) {
                    return new NextResponse("Forbidden: Cannot remove the owner", { status: 403 });
                }

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
