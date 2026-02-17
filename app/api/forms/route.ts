import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const { title, description, fields } = body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 7);

    const form = await prisma.form.create({
        data: {
            title,
            description,
            slug,
            fields: typeof fields === 'string' ? fields : JSON.stringify(fields || [])
        }
    });

    return NextResponse.json(form);
}

export async function PATCH(request: Request) {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const { id, title, description, fields, isActive } = body;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const form = await prisma.form.update({
        where: { id },
        data: {
            title,
            description,
            fields: typeof fields === 'string' ? fields : JSON.stringify(fields || []),
            isActive
        }
    });

    return NextResponse.json(form);
}

export async function GET(request: Request) {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Ensure default form exists
    const defaultForm = await prisma.form.findUnique({ where: { slug: "demande-de-projet" } });
    if (!defaultForm) {
        await prisma.form.create({
            data: {
                title: "Demande de Projet Public",
                slug: "demande-de-projet",
                description: "Formulaire complet qualifié (8 étapes) accessible à tous sans connexion.",
                fields: "[]",
                isActive: true
            }
        });
    }

    // @ts-ignore - Prisma client outdated in current session
    const forms = await prisma.form.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { submissions: true } } }
    });
    return NextResponse.json(forms);
}
