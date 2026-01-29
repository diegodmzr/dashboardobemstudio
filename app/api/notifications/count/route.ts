import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const count = await prisma.notification.count({
            where: {
                userId: user.id,
                isRead: false
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Failed to fetch notification count", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
