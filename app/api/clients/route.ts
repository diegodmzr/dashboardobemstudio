import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function GET() {
    try {
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
                await sendEmail(
                    body.email,
                    "Vos identifiants de connexion - Dashboard Obem Studio",
                    `
                    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                        <div style="text-align: center; margin-bottom: 24px;">
                             <h1 style="font-size: 24px; font-weight: bold;">Bienvenue sur votre Espace Client</h1>
                        </div>
                        
                        <div style="background-color: #f9f9f9; padding: 24px; border-radius: 12px; border: 1px solid #eee;">
                            <p style="margin-bottom: 16px;">Bonjour <strong>${body.name}</strong>,</p>
                            <p style="margin-bottom: 16px;">Votre compte client a été créé avec succès. Vous pouvez désormais accéder à votre tableau de bord pour suivre vos projets, devis et factures.</p>
                            
                            <p style="margin-bottom: 8px;">Voici vos identifiants de connexion :</p>
                            <ul style="list-style: none; padding: 0; margin-bottom: 24px;">
                                <li style="margin-bottom: 8px;">Email : <strong>${body.email}</strong></li>
                                <li>Mot de passe : <strong>${rawPassword}</strong></li>
                            </ul>

                            <div style="text-align: center;">
                                <a href="${req.headers.get("origin") || "https://dashboard.obem.studio"}/login" 
                                   style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                   Se connecter
                                </a>
                            </div>
                        </div>
                        <p style="text-align: center; margin-top: 24px; font-size: 12px; color: #888;">
                            Nous vous recommandons de modifier votre mot de passe lors de votre première connexion.
                        </p>
                    </div>
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
