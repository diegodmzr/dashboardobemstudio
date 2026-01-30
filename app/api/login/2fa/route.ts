import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const { authenticator } = require("otplib");

export async function POST(request: Request) {
    try {
        const { userId, token } = await request.json();

        if (!userId || !token) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        // Use Raw SQL to find the user and their 2FA secret
        const users: any[] = await prisma.$queryRaw`SELECT * FROM "User" WHERE id = ${userId} LIMIT 1`;
        const user = users[0];

        if (!user || !user.twoFactorSecret) {
            return NextResponse.json({ error: "Utilisateur non trouvé ou 2FA non configurée" }, { status: 400 });
        }

        const isValid = authenticator.verify({
            token,
            secret: user.twoFactorSecret,
        });

        if (!isValid) {
            return NextResponse.json({ error: "Code invalide" }, { status: 400 });
        }

        const redirectPath = "/dashboard";
        const res = NextResponse.json({ success: true, redirect: redirectPath });

        // Set session cookies
        res.cookies.set({
            name: "userId",
            value: user.id,
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
        });
        res.cookies.set({
            name: "role",
            value: user.role,
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
        });

        return res;
    } catch (error) {
        console.error("Login 2FA Error:", error);
        return NextResponse.json({ error: "Erreur lors de la vérification 2FA" }, { status: 500 });
    }
}
