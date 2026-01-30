import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
    const prisma = new PrismaClient();
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

        // Save token using Raw SQL to bypass stale Prisma Client on Windows
        await (prisma as any).$executeRawUnsafe(
            `INSERT INTO PasswordResetToken (id, token, email, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?)`,
            crypto.randomBytes(16).toString("hex"), // id
            token,
            email,
            expiresAt.toISOString(),
            new Date().toISOString()
        );

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #000; margin: 0;">OBEM Studio</h1>
                </div>
                <div style="background: white; border: 1px solid #eee; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                    <h2 style="margin-top: 0; color: #000;">Réinitialisation de votre mot de passe</h2>
                    <p>Bonjour ${user.name || "Client"},</p>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre espace OBEM Studio.</p>
                    <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien est valable pendant **1 heure**.</p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${resetLink}" 
                           style="background: #000; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; display: inline-block;">
                            Réinitialiser mon mot de passe
                        </a>
                    </div>
                    
                    <p style="font-size: 13px; color: #666;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
                </div>
                <div style="text-align: center; margin-top: 25px; font-size: 12px; color: #888;">
                    &copy; ${new Date().getFullYear()} OBEM Studio. Tous droits réservés.
                </div>
            </div>
        `;

        await sendEmail(email, "Réinitialisation de votre mot de passe - OBEM Studio", emailHtml);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Une erreur est survenue lors du traitement de votre demande." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
