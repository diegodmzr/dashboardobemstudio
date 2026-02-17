import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }
        const clients = await prisma.user.findMany({
            where: {
                role: "CLIENT",
            },
            include: {
                projects: {
                    select: {
                        amount: true,
                        status: true,
                    },
                },
                quotes: {
                    select: {
                        id: true,
                    }
                },
                formSubmissions: {
                    select: {
                        id: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const clientsWithMetrics = clients.map((client) => {
            const totalRevenue = client.projects.reduce((acc, curr) => acc + curr.amount, 0);
            const projectCount = client.projects.length;
            // Filter out completed projects for active count if needed, but total count is requested

            const { password, ...clientWithoutPassword } = client;

            return {
                ...clientWithoutPassword,
                totalRevenue,
                projectCount,
            };
        });

        return NextResponse.json(clientsWithMetrics);
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des clients" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();

        if (!body.email || !body.name) {
            return NextResponse.json(
                { error: "Email et nom requis" },
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

        let rawPassword = body.password;
        if (!rawPassword && body.sendLoginEmail) {
            // Generate a random password if not provided but email is requested
            const { randomBytes } = await import("crypto");
            rawPassword = randomBytes(8).toString("hex"); // 16 chars
        }

        let hashedPassword = null;
        if (rawPassword) {
            hashedPassword = await hash(rawPassword, 12);
        }

        const client = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                role: "CLIENT",
                phone: body.phone,
                companyName: body.companyName,
                companyLogo: body.companyLogo,
                sector: body.sector,
                siret: body.siret,
                status: body.status || "Active",
                password: hashedPassword,
            },
        });

        // Send Email if requested
        if (body.sendLoginEmail && rawPassword) {
            try {
                const { sendEmail } = await import("@/lib/email");
                const host = req.headers.get("host") || "dashboard.obemstudio.com";
                const protocol = host.includes("localhost") ? "http" : "https";
                const baseUrl = `${protocol}://${host}`;

                await sendEmail(
                    body.email,
                    "Vos identifiants de connexion - Obem Studio",
                    `
                    <h2 style="margin-top: 0; color: #000; font-size: 20px;">Bienvenue sur votre Espace Client</h2>
                    <p>Bonjour <strong>${body.name}</strong>,</p>
                    <p>Votre compte client a été créé avec succès sur le dashboard <strong>Obem Studio</strong>. Vous pouvez désormais suivre vos projets, devis et factures en temps réel.</p>
                    
                    <div style="background-color: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 12px; padding: 25px; margin: 25px 0;">
                        <p style="margin-top: 0; font-weight: bold; color: #666; font-size: 13px; text-transform: uppercase;">Vos identifiants :</p>
                        <p style="margin-bottom: 8px;">Email : <strong>${body.email}</strong></p>
                        <p style="margin-top: 0;">Mot de passe : <strong>${rawPassword}</strong></p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${baseUrl}/login" 
                           style="display: inline-block; background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                           Se connecter à mon espace
                        </a>
                    </div>
                    
                    <p style="text-align: center; margin-top: 30px; font-size: 13px; color: #888;">
                        Nous vous recommandons de modifier votre mot de passe dans les paramètres de votre profil lors de votre première connexion.
                    </p>
                    `
                );
            } catch (emailError) {
                console.error("Failed to send login email:", emailError);
                // Do not fail the request, just log
            }
        }

        const { password, ...clientWithoutPassword } = client;

        return NextResponse.json(clientWithoutPassword, { status: 201 });
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json(
            { error: "Erreur lors de la création du client" },
            { status: 500 }
        );
    }
}
