import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { content, attachments, isInternal } = body;

        if (!content && (!attachments || attachments.length === 0)) {
            return new NextResponse("Empty message", { status: 400 });
        }

        // Check Access
        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: { participants: true }
        });

        if (!conversation) return new NextResponse("Not Found", { status: 404 });

        const isParticipant = conversation.participants.some(p => p.userId === user.id);
        if (user.role !== "ADMIN" && !isParticipant) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // If internal note, only Admin
        if (isInternal && user.role !== "ADMIN") {
            return new NextResponse("Forbidden Internal Note", { status: 403 });
        }

        // Create Message
        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: user.id,
                content: content || "",
                isInternal: isInternal || false,
                attachments: {
                    create: (attachments || []).map((att: any) => ({
                        filename: att.filename,
                        url: att.url,
                        mimeType: att.mimeType,
                        size: att.size
                    }))
                }
            },
            include: {
                sender: true,
                attachments: true
            }
        });

        // Update Conversation lastMessageAt and Status (Re-open if closed?)
        // If Admin replies, maybe keep current status or set to IN_PROGRESS?
        // If Client replies, set to OPEN?

        let newStatus = conversation.status;
        if (conversation.status === "CLOSED") {
            newStatus = "OPEN"; // Re-open on new message
        } else if (conversation.status === "OPEN" && user.role === "ADMIN") {
            newStatus = "IN_PROGRESS"; // Admin took it
        }

        await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                lastMessageAt: new Date(),
                status: newStatus
            }
        });

        // Update Reader (Sender read it)
        const existingParticipant = conversation.participants.find(p => p.userId === user.id);
        if (existingParticipant) {
            await prisma.participant.update({
                where: { id: existingParticipant.id },
                data: { lastReadAt: new Date() }
            });
        } else if (user.role === "ADMIN") {
            // Admin replying without being participant? Should probably join?
            await prisma.participant.create({
                data: {
                    conversationId: conversation.id,
                    userId: user.id,
                    role: "ADMIN",
                    lastReadAt: new Date()
                }
            });
        }

        return NextResponse.json(message);
    } catch (error) {
        console.error("[MESSAGES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
