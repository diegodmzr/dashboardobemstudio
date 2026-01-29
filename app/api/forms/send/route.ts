import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 403 });

        const body = await req.json();
        const { formId, recipientIds, method } = body;

        if (!formId || !recipientIds || !Array.isArray(recipientIds)) {
            return new NextResponse("Invalid data", { status: 400 });
        }

        const form = await prisma.form.findUnique({ where: { id: formId } });
        if (!form) return new NextResponse("Form not found", { status: 404 });

        // Get origin from request headers if possible, or fallback
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const baseUrl = `${protocol}://${host}`;

        // Iterate recipients
        for (const userId of recipientIds) {
            const recipient = await prisma.user.findUnique({ where: { id: userId } });
            if (!recipient) continue;

            // Link includes clientId to track the user
            const formLink = `${baseUrl}/f/${form.slug}`; // ?clientId=${userId} // We will rely on user being logged in?
            // If we send via Dashboard, they are logged in.
            // If we send via Email, they might click it on a device where they are logged in, OR we pass query param.
            // But Public Form usually doesn't take query param for auth.
            // Let modification of PublicProjectRequestForm handle pre-filling if logged in.
            // If I want to FORCE linking, I should probably generate a token... but let's keep it simple.
            // If they are logged in, it works.

            if (method === "dashboard" || method === "both") {
                // Create a Conversation
                await prisma.conversation.create({
                    data: {
                        subject: `Formulaire à remplir : ${form.title}`,
                        status: "OPEN",
                        category: "AUTRE",
                        // type: "Demande", // Temporarily removed due to pending Prisma Client update
                        participants: {
                            create: [
                                { userId: user.id, role: "ADMIN" },
                                { userId: recipient.id, role: "OWNER" }
                            ]
                        },
                        messages: {
                            create: {
                                senderId: user.id,
                                content: `Bonjour ${recipient.name || ""},\n\nMerci de bien vouloir remplir ce formulaire : ${form.title}\n\nVous pouvez y accéder via ce lien : ${formLink}\n\nCordialement.`,
                                isInternal: false
                            }
                        }
                    }
                });

                // Also Create Notification
                await prisma.notification.create({
                    data: {
                        userId,
                        title: "Formulaire à remplir",
                        message: `Vous avez reçu une demande pour remplir le formulaire : ${form.title}`,
                        type: "INFO",
                        entityType: "Form",
                        entityId: form.id
                    }
                });
            }

            if (method === "email" || method === "both") {
                // Send Email using Resend
                const { sendEmail } = await import("@/lib/email");
                await sendEmail(
                    recipient.email,
                    `Formulaire à remplir : ${form.title}`,
                    `
                    <div style="font-family: sans-serif; color: #333;">
                        <h2>Bonjour ${recipient.name || "Client"},</h2>
                        <p>Merci de bien vouloir remplir ce formulaire : <strong>${form.title}</strong></p>
                        <p>Vous pouvez y accéder en cliquant sur le bouton ci-dessous :</p>
                        <a href="${formLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Remplir le formulaire</a>
                        <p style="margin-top: 20px; font-size: 12px; color: #888;">Ou via ce lien : <a href="${formLink}">${formLink}</a></p>
                        <p>Cordialement,<br/>L'équipe</p>
                    </div>
                    `
                );
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[FORM_SEND]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
