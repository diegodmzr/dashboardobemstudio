import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Disable 2FA using Raw SQL
        await prisma.$executeRaw`UPDATE "User" SET "twoFactorEnabled" = 0, "twoFactorSecret" = NULL WHERE id = ${user.id}`;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("2FA Disable Error:", error);
        return NextResponse.json({ error: "Erreur lors de la désactivation de la 2FA" }, { status: 500 });
    }
}
