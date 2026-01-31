import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hash } from "bcryptjs";

export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const team = await prisma.user.findMany({
            where: {
                role: {
                    in: ["ADMIN", "SUPER_ADMIN"]
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const teamWithoutPasswords = team.map((member) => {
            const { password, ...memberWithoutPassword } = member;
            return memberWithoutPassword;
        });

        return NextResponse.json(teamWithoutPasswords);
    } catch (error) {
        console.error("Error fetching team:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération de l'équipe" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        if (!body.email || !body.name || !body.password || !body.role) {
            return NextResponse.json(
                { error: "Email, nom, mot de passe et rôle requis" },
                { status: 400 }
            );
        }

        if (!["ADMIN", "SUPER_ADMIN"].includes(body.role)) {
            return NextResponse.json(
                { error: "Rôle invalide" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: body.email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Cet email est déjà utilisé" },
                { status: 400 }
            );
        }

        const hashedPassword = await hash(body.password, 12);

        const member = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                role: body.role,
                password: hashedPassword,
                status: "Active",
            },
        });

        const { password, ...memberWithoutPassword } = member;

        return NextResponse.json(memberWithoutPassword, { status: 201 });
    } catch (error) {
        console.error("Error creating team member:", error);
        return NextResponse.json(
            { error: "Erreur lors de la création du membre" },
            { status: 500 }
        );
    }
}
