import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const filter = searchParams.get("filter"); // ALL, UNREAD, PROJECT, PAYMENT, DISCUSSION
        const search = searchParams.get("search");
        const sortBy = searchParams.get("sortBy") || "desc";

        const where: any = { userId: user.id };

        if (filter === "UNREAD") {
            where.isRead = false;
        } else if (filter && filter !== "ALL") {
            where.type = filter;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { message: { contains: search, mode: "insensitive" } },
            ];
        }

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: sortBy as "asc" | "desc" },
            take: 100 // Increased limit
        });

        return NextResponse.json(notifications);

    } catch (error) {
        console.error("Failed to fetch notifications", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// Helper to generate system notification (for testing or manual trigger)
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        // Only Admin should probably trigger manual notifications via API, but for dev we allow it or check role
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { targetUserId, type, title, message, entityType, entityId } = body;

        const notif = await prisma.notification.create({
            data: {
                userId: targetUserId || user.id, // Self notification if no target
                type,
                title,
                message,
                entityType,
                entityId
            }
        });

        return NextResponse.json(notif);
    } catch (error) {
        return new NextResponse("Error creating notification", { status: 500 });
    }
}
