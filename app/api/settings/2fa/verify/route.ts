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

        // Use Raw SQL to find the user's 2FA secret
        const users: any[] = await prisma.$queryRaw`SELECT "twoFactorSecret" FROM "User" WHERE id = ${user.id} LIMIT 1`;
        const dbUser = users[0];

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

        // Enable 2FA using Raw SQL
        await prisma.$executeRaw`UPDATE "User" SET "twoFactorEnabled" = 1 WHERE id = ${user.id}`;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("2FA Verify Error:", error);
        return NextResponse.json({ error: "Erreur lors de la vérification du code" }, { status: 500 });
    }
}
