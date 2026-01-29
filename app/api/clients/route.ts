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

        let hashedPassword = null;
        if (body.password) {
            hashedPassword = await hash(body.password, 12);
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
