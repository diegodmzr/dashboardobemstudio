import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // @ts-ignore
    const submissions = await prisma.formSubmission.findMany({
        orderBy: { createdAt: "desc" },
        include: { form: true }
    });
    return NextResponse.json(submissions);
}
