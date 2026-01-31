import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
const { authenticator } = require("otplib");

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { token } = await request.json();
        if (!token) {
            return NextResponse.json({ error: "Code requis" }, { status: 400 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { twoFactorSecret: true }
        });

        if (!dbUser?.twoFactorSecret) {
            return NextResponse.json({ error: "Aucune configuration 2FA en cours" }, { status: 400 });
        }

        const isValid = authenticator.verify({
            token,
            secret: dbUser.twoFactorSecret
        });

        if (!isValid) {
            return NextResponse.json({ error: "Code invalide" }, { status: 400 });
        }

        // Enable 2FA using standard Prisma (handles booleans correctly for PG)
        await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorEnabled: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("2FA Verify Error:", error);
        return NextResponse.json({ error: "Erreur lors de la vérification du code" }, { status: 500 });
    }
}
