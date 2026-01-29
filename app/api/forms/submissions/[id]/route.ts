import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // In Next.js 15, params is a Promise
    const { id } = await context.params;

    // @ts-ignore
    await prisma.formSubmission.delete({
        where: { id }
    });

    return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await context.params;
    const body = await request.json();

    // @ts-ignore
    await prisma.formSubmission.update({
        where: { id },
        data: { status: body.status } // 'ARCHIVED' or 'READ'
    });

    return NextResponse.json({ success: true });
}
