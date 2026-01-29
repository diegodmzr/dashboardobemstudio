import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
    const { slug } = await context.params;

    // @ts-ignore
    const form = await prisma.form.findUnique({
        where: { slug }
    });

    if (!form || !form.isActive) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    return NextResponse.json({
        title: form.title,
        description: form.description,
        fields: JSON.parse(form.fields || "[]")
    });
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await context.params;
        const body = await request.json();

        // @ts-ignore
        let form = await prisma.form.findUnique({ where: { slug } });

        if (!form && slug === "demande-de-projet") {
            // @ts-ignore
            form = await prisma.form.create({
                data: {
                    title: "Demande de Projet (Public)",
                    slug: "demande-de-projet",
                    description: "Formulaire de demande de projet",
                    fields: "[]",
                    isActive: true
                }
            });
        }

        if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // @ts-ignore
        await prisma.formSubmission.create({
            data: {
                formId: form.id,
                content: JSON.stringify(body),
                status: "NEW"
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API] Form Submission Error:", error);
        // @ts-ignore
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
