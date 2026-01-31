import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Token et mot de passe requis" }, { status: 400 });
        }

        // 1. Find the token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token }
        });

        if (!resetToken) {
            return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 });
        }

        // 2. Check expiry
        if (new Date() > new Date(resetToken.expiresAt)) {
            await prisma.passwordResetToken.delete({
                where: { token }
            });
            return NextResponse.json({ error: "Ce lien a expiré" }, { status: 400 });
        }

        // 3. Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Update user
        await prisma.user.update({
            where: { email: resetToken.email },
            data: { password: hashedPassword },
        });

        // 5. Delete token
        await prisma.passwordResetToken.delete({
            where: { token }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
    }
}
