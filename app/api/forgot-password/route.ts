import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email requis" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Even if user doesn't exist, we return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({ success: true });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        // Save token using standard Prisma
        await prisma.passwordResetToken.create({
            data: {
                token,
                email,
                expiresAt,
            }
        });

        const host = request.headers.get("host") || "dashboard.obemstudio.com";
        const protocol = host.includes("localhost") ? "http" : "https";
        const baseUrl = `${protocol}://${host}`;
        const resetLink = `${baseUrl}/reset-password?token=${token}`;

        const emailContent = `
            <h2 style="margin-top: 0; color: #000; font-size: 20px;">Réinitialisation de votre mot de passe</h2>
            <p>Bonjour ${user.name || "Client"},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre espace <strong>Obem Studio</strong>.</p>
            <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien est valable pendant 1 heure.</p>
            
            <div style="text-align: center; margin: 35px 0;">
                <a href="${resetLink}" 
                   style="background: #000; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    Réinitialiser mon mot de passe
                </a>
            </div>
            
            <p style="font-size: 13px; color: #888; border-top: 1px solid #f0f0f0; pt: 20px; margin-top: 30px;">
                Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.
            </p>
        `;

        await sendEmail(email, "Réinitialisation de votre mot de passe - Obem Studio", emailContent);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Une erreur est survenue lors du traitement de votre demande." }, { status: 500 });
    }
}
