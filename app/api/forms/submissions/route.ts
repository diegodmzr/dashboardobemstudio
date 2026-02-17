import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();
        if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
            return NextResponse.json([]);
        }

        // @ts-ignore
        const submissions = await prisma.formSubmission.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                form: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });
        return NextResponse.json(submissions);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return NextResponse.json([]);
    }
}
