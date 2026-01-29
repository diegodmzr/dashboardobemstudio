import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
        }

        // Set Cookie for compatibility with lib/auth.ts (cookie-based session)
        const cookieStore = cookies();

        cookieStore.set("userId", user.id, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        // Optional: Set role cookie if needed by client middleware immediately
        cookieStore.set("role", user.role, {
            httpOnly: false,
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        // Also set auth_token for legacy/other checks if any
        const token = "session-" + user.id;
        cookieStore.set("auth_token", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return NextResponse.json({
            success: true,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
