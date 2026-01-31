import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
    try {
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        await prisma.notification.updateMany({
            where: {
                userId: user.id,
                isRead: false
            },
            data: { isRead: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to mark all as read", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
