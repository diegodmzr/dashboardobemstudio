import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const archived = searchParams.get("archived");

        const where: any = {};

        // Handle archiving filter
        if (archived === "true") {
            where.isArchived = true;
        } else if (archived === "false") {
            where.isArchived = false;
        } else {
            // Default to non-archived if not specified
            where.isArchived = false;
        }

        // Role filtering: Clients only see their own conversations
        if (user.role !== "ADMIN") {
            where.participants = {
                some: { userId: user.id }
            };
        }

        // Status filter
        if (status && status !== "ALL") {
            where.status = status;
        }

        // Search filter
        if (search) {
            where.OR = [
                { subject: { contains: search } },
                // Note: Filtering by message content might be expensive, disabled for now or keep simple
                // { messages: { some: { content: { contains: search } } } } 
            ];
        }

        const conversations = await prisma.conversation.findMany({
            where,
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                                email: true,
                                role: true
                            }
                        }
                    }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: "desc" }
                }
            },
            orderBy: { lastMessageAt: "desc" }
        });

        return NextResponse.json(conversations);
    } catch (error) {
        console.error("[CONVERSATIONS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { subject, content, recipientIds, projectId, category, type, attachments } = body;

        if (!subject || !content) {
            return new NextResponse("Subject and Content are required", { status: 400 });
        }

        // Prepare participants: Creator + Recipients
        const participantsData: { userId: string; role: string; lastReadAt?: Date | null }[] = [
            { userId: user.id, role: "OWNER", lastReadAt: new Date() }
        ];

        if (recipientIds && Array.isArray(recipientIds)) {
            recipientIds.forEach((id: string) => {
                if (id !== user.id) {
                    participantsData.push({ userId: id, role: "OBSERVER" });
                }
            });
        }

        // Create Conversation
        const conversation = await prisma.conversation.create({
            data: {
                subject,
                status: "OPEN",
                category,
                type,
                projectId: projectId ?? undefined,
                participants: {
                    create: participantsData
                },
                messages: {
                    create: {
                        senderId: user.id,
                        content,
                        isInternal: false,
                        attachments: {
                            create: attachments?.map((att: any) => ({
                                filename: att.filename,
                                url: att.url,
                                mimeType: att.mimeType,
                                size: att.size
                            })) || []
                        }
                    }
                }
            },
            include: {
                participants: true,
                messages: true
            }
        });

        return NextResponse.json(conversation);
    } catch (error) {
        console.error("[CONVERSATIONS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
