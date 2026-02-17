import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { signature } = body;

        if (!signature) return new NextResponse("Signature required", { status: 400 });

        const quote = await prisma.quote.findUnique({ where: { id } });
        if (!quote) return new NextResponse("Quote not found", { status: 404 });

        if (quote.clientId !== user.id) return new NextResponse("Forbidden", { status: 403 });

        // Update Quote first
        const updatedQuote = await prisma.quote.update({
            where: { id },
            data: {
                status: "ACCEPTED", // "Signé"
                signature,
                signedAt: new Date(),
            },
            include: { client: true }
        });

        // Generate PDF on Server
        try {
            const { renderToStream } = await import('@react-pdf/renderer');
            const path = await import('path');

            // Resolve image paths for server-side
            const publicDir = path.join(process.cwd(), 'public');
            const imagePaths = {
                logo: path.join(publicDir, 'logoblanc.png'),
                logoNoir: path.join(publicDir, 'logonoir.png'),
                signature: path.join(publicDir, 'signature.png')
            };

            // Add imagePaths to quote object for PDF generation
            const quoteForPdf = { ...updatedQuote, imagePaths };

            // @ts-ignore
            const QuotePDF = (await import("@/components/admin/quotes/QuotePDF")).default;
            const React = await import('react');
            // @ts-ignore
            const stream = await renderToStream(React.createElement(QuotePDF, { quote: quoteForPdf }));

            // Convert stream to buffer
            const chunks: any[] = [];
            for await (const chunk of stream) {
                chunks.push(chunk as Buffer);
            }
            const pdfBuffer = Buffer.concat(chunks);

            // Send Email to Admins
            const { sendEmail } = await import("@/lib/email");
            const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
            console.log(`[QUOTE_SIGN] Found ${admins.length} admins to notify.`);

            for (const admin of admins) {
                console.log(`[QUOTE_SIGN] Notifying admin ${admin.email}...`);
                // DB Notification
                await prisma.notification.create({
                    data: {
                        userId: admin.id,
                        title: "Devis signé !",
                        message: `Le client ${user.name} a signé le devis ${quote.reference}.`,
                        type: "SUCCESS",
                        entityType: "Quote",
                        entityId: quote.id
                    }
                });

                // Email with Attachment
                if (admin.email) {
                    await sendEmail(
                        admin.email,
                        `Devis Signé : ${quote.reference} - ${user.name} - Obem Studio`,
                        `
                        <h2 style="margin-top: 0; color: #000; font-size: 20px;">Dossier Validé !</h2>
                        <p>Le client <strong>${user.name}</strong> vient de signer électroniquement le devis <strong>${quote.reference}</strong>.</p>
                        
                        <div style="background-color: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                            <p style="margin: 0; color: #666; font-size: 13px; text-transform: uppercase;">Détails :</p>
                            <p style="margin: 5px 0 0 0;">Référence : <strong>${quote.reference}</strong></p>
                            <p style="margin: 5px 0 0 0;">Montant : <strong>${updatedQuote.total} €</strong></p>
                        </div>

                        <p>Le document signé est disponible en pièce jointe de cet email et a été archivé dans votre tableau de bord administrateur.</p>
                        `,
                        [
                            {
                                filename: `DEVIS-${quote.reference}-SIGNE.pdf`,
                                content: pdfBuffer
                            }
                        ]
                    );
                }
            }

        } catch (pdfError) {
            console.error("Error generating/sending PDF:", pdfError);
            // Don't block the response, just log it
        }

        // Create Pending Payment based on Quote Payment Type
        // If ONESHOT or RECURRING (first payment), create a PENDING payment for the total
        const paymentAmount = updatedQuote.total;

        if (paymentAmount > 0) {
            const paymentType = updatedQuote.paymentType || "ONESHOT";

            // Create the payment record
            const payment = await prisma.payment.create({
                data: {
                    amount: paymentAmount,
                    currency: "EUR",
                    description: `Règlement Devis ${updatedQuote.reference}`,
                    type: paymentType === "RECURRING" ? "SUBSCRIPTION" : "DEPOSIT", // Or BALANCE depending on logic. DEPOSIT is safe default for first payment.
                    status: "PENDING",
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Due in 30 days default
                    clientId: user.id,
                    projectId: updatedQuote.projectId,
                    quoteId: updatedQuote.id,
                    method: "bank_transfer", // Default until paid
                },
                include: { client: true }
            });
            console.log(`[QUOTE_SIGN] Created PENDING payment for ${paymentAmount} EUR`);

            // --- NOTIFY CLIENT ---
            try {
                const { sendEmail } = await import("@/lib/email");

                // 1. DB Notification for Client
                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        title: "Paiement requis",
                        message: `Merci d'avoir signé le devis ${quote.reference}. Vous pouvez maintenant procéder au règlement de ${paymentAmount}€.`,
                        type: "PAYMENT",
                        entityType: "Payment",
                        entityId: payment.id
                    }
                });

                // 2. Email for Client
                if (user.email) {
                    await sendEmail(
                        user.email,
                        `Action requise : Règlement de votre devis ${quote.reference} - Obem Studio`,
                        `
                        <h2 style="margin-top: 0; color: #000; font-size: 20px;">Merci pour votre confiance !</h2>
                        <p>Bonjour <strong>${user.name}</strong>,</p>
                        <p>Vous venez de signer electroniquement le devis <strong>${quote.reference}</strong>. Pour finaliser la mise en place de votre projet, nous vous invitons à procéder au règlement.</p>
                        
                        <div style="background-color: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                            <p style="margin: 0; color: #666; font-size: 13px; text-transform: uppercase;">Détails du paiement :</p>
                            <p style="margin: 5px 0 0 0;">Référence : <strong>${quote.reference}</strong></p>
                            <p style="margin: 5px 0 0 0;">Montant à régler : <strong>${paymentAmount} €</strong></p>
                        </div>

                        <p>Vous pouvez effectuer votre paiement directement depuis votre tableau de bord dans la section "Mes Finances".</p>
                        
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="https://dashboard.obemstudio.com/dashboard/finances/paiements?paymentId=${payment.id}" 
                               style="background-color: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                               Accéder au paiement
                            </a>
                        </div>

                        <p style="margin-top: 30px; font-size: 13px; color: #666;">Si vous avez des questions, n'hésitez pas à nous contacter directement sur la messagerie de votre dashboard.</p>
                        `
                    );
                }
            } catch (notifyError) {
                console.error("Error notifying client:", notifyError);
            }
        }

        // Trigger Stripe Logic if configured?
        if (quote.stripeAutoSend) {
            console.log("[AutoStripe] Creating payment for quote", quote.id);
        }

        return NextResponse.json({ success: true, paymentRequired: paymentAmount > 0 });

    } catch (error) {
        console.error("[QUOTE_SIGN]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
