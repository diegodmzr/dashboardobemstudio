import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
const { authenticator } = require("otplib");
import qrcode from "qrcode";

export async function POST() {
    const prisma = new PrismaClient();
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.email, "OBEM Studio", secret);
        const qrCodeUrl = await qrcode.toDataURL(otpauth);

        // Save the secret temporarily using Raw SQL to bypass stale Prisma Client on Windows
        await (prisma as any).$executeRawUnsafe(
            `UPDATE User SET twoFactorSecret = ? WHERE id = ?`,
            secret,
            user.id
        );

        return NextResponse.json({ secret, qrCodeUrl });
    } catch (error) {
        console.error("2FA Setup Error:", error);
        return NextResponse.json({ error: "Erreur lors de la configuration de la 2FA" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
