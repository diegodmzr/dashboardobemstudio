import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

        const users = await prisma.user.findMany({
            where: {
                role: "CLIENT" // Mostly we want to message clients, but maybe other admins too?
                // Let's allow fetching everyone for now or just clients as per "clients list" legacy
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                companyName: true
            },
            orderBy: { name: "asc" }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("[ADMIN_USERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
