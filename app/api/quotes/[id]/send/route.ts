import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 403 });

        const { id } = await params;

        const quote = await prisma.quote.findUnique({
            where: { id },
            include: { client: true }
        });

        if (!quote) return new NextResponse("Quote not found", { status: 404 });

        // Update Status to SENT
        await prisma.quote.update({
            where: { id },
            data: { status: "SENT" }
        });

        // 1. Send via Dashboard (Conversation/Notification)

        // Create Notification
        await prisma.notification.create({
            data: {
                userId: quote.clientId,
                title: "Nouveau Devis reçu",
                message: `Vous avez reçu le devis ${quote.reference}. Veuillez le consulter et le signer.`,
                type: "ACTION",
                entityType: "Quote",
                entityId: quote.id
            }
        });

        // Mock Link - In real app, this should link to the Client Dashboard Quote Page
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const quoteLink = `${protocol}://${host}/dashboard/client/devis/${quote.id}`;

        await prisma.conversation.create({
            data: {
                subject: `Devis : ${quote.reference}`,
                status: "OPEN",
                category: "FACTURATION",
                // type: "Devis", 
                participants: {
                    create: [
                        { userId: user.id, role: "ADMIN" },
                        { userId: quote.clientId, role: "OWNER" }
                    ]
                },
                messages: {
                    create: {
                        senderId: user.id,
                        content: `Bonjour ${quote.client.name},\n\nVoici le devis ${quote.reference} pour votre projet.\nVous pouvez le consulter et le signer directement ici : ${quoteLink}\n\nCordialement.`,
                    }
                }
            }
        });

        // 2. Send via Email
        const { sendEmail } = await import("@/lib/email");
        if (quote.client.email) {
            const host = req.headers.get("host") || "dashboard.obemstudio.com";
            const protocol = host.includes("localhost") ? "http" : "https";
            const baseUrl = `${protocol}://${host}`;
            const quoteLink = `${baseUrl}/dashboard/client/devis/${quote.id}`;

            await sendEmail(
                quote.client.email,
                `Nouveau Devis : ${quote.reference} - Obem Studio`,
                `
                <h2 style="margin-top: 0; color: #000; font-size: 20px;">Bonjour ${quote.client.name},</h2>
                <p>Un nouveau devis <strong>${quote.reference}</strong> a été édité pour vous par l'équipe <strong>Obem Studio</strong>.</p>
                
                <div style="background-color: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Montant total</p>
                    <p style="margin: 5px 0 0 0; color: #000; font-size: 28px; font-weight: 800;">${quote.total} €</p>
                </div>

                <p>Vous pouvez consulter les détails, télécharger le document et le signer électroniquement en cliquant sur le bouton ci-dessous :</p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${quoteLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">Voir et signer le devis</a>
                </div>
                `
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[QUOTE_SEND]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
