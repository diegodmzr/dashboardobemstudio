import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        if (user.role !== "CLIENT") {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        const body = await req.json();
        const { projectName, description, websiteType, pages, features, colors, designStyles, referenceUrls, typography, typographyOther } = body;

        // Validation
        if (!projectName || projectName.trim().length < 3) {
            return NextResponse.json({ error: "Nom du projet invalide" }, { status: 400 });
        }

        // Prepare metadata
        const metadata = JSON.stringify({
            projectRequest: {
                projectName,
                description,
                websiteType,
                pages,
                features,
                colors,
                designStyles,
                referenceUrls: referenceUrls.filter((url: string) => url.trim()),
                typography,
                typographyOther,
                submittedAt: new Date().toISOString(),
            },
        });

        // Find first admin user
        const admin = await prisma.user.findFirst({
            where: { role: "ADMIN" },
        });

        if (!admin) {
            return NextResponse.json({ error: "Aucun administrateur trouvé" }, { status: 500 });
        }

        // Create conversation
        const conversation = await prisma.conversation.create({
            data: {
                subject: `Nouvelle demande: ${projectName}`,
                status: "OPEN",
                category: "PROJET",
                metadata,
                participants: {
                    create: [
                        { userId: user.id, role: "OWNER" },
                        { userId: admin.id, role: "ADMIN" },
                    ],
                },
                messages: {
                    create: {
                        senderId: user.id,
                        content: formatBriefMessage(body),
                        isInternal: false,
                    },
                },
            },
        });

        // Create notification for admin
        await prisma.notification.create({
            data: {
                userId: admin.id,
                type: "DISCUSSION",
                title: "Nouvelle demande de projet",
                message: `${user.name} a soumis une demande: ${projectName}`,
                entityType: "Conversation",
                entityId: conversation.id,
            },
        });

        return NextResponse.json({ success: true, conversationId: conversation.id });
    } catch (error) {
        console.error("Error creating project request:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

function formatBriefMessage(data: any): string {
    const { projectName, description, websiteType, pages, features, colors, designStyles, referenceUrls, typography, typographyOther } = data;

    let message = `### 📋 Nouvelle demande : ${projectName}\n\n`;

    // Intro
    message += `**Type de site :**\n`;
    const typeLabels: Record<string, string> = {
        vitrine: "Site Vitrine 🏢",
        ecommerce: "E-commerce 🛒",
        landing: "Landing Page 🎯",
    };
    message += `- ${typeLabels[websiteType] || websiteType}\n\n`;

    if (description) {
        message += `**Description :**\n${description}\n\n`;
    }

    // Pages
    if (pages && pages.length > 0) {
        message += `**Pages demandées (${pages.length}) :**\n`;
        message += pages.map((p: string) => `- ${p}`).join("\n") + "\n\n";
    }

    // Features
    if (features && features.length > 0) {
        message += `**Fonctionnalités (${features.length}) :**\n`;
        message += features.map((f: string) => `- ${f}`).join("\n") + "\n\n";
    }

    // Design Section
    message += `### 🎨 Préférences Design\n\n`;

    message += `**Couleurs :**\n- ${colors || "Non renseigné"}\n\n`;

    if (designStyles.length > 0) {
        message += `**Styles :**\n${designStyles.map((s: string) => `- ${s}`).join("\n")}\n\n`;
    }

    const validUrls = referenceUrls.filter((url: string) => url.trim());
    if (validUrls.length > 0) {
        message += `**Références :**\n${validUrls.map((url: string) => `- ${url}`).join("\n")}\n\n`;
    }

    message += `**Typographie :**\n- ${typography === "Autre" ? typographyOther : typography}\n\n`;

    message += `---\n`;
    message += `*Cette demande a été générée automatiquement.*`;

    return message;
}
