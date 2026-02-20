import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/partners — List all partners (admin)
export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const partners = await (prisma as any).user.findMany({
            where: { role: "PARTNER" },
            select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                companyName: true,
                avatar: true,
                commissionRate: true,
                status: true,
                createdAt: true,
                partnerCommissions: {
                    select: {
                        id: true,
                        label: true,
                        commissionRate: true,
                        baseAmount: true,
                        commissionAmount: true,
                        status: true,
                        paidAt: true,
                        createdAt: true,
                        project: { select: { id: true, name: true, amount: true, status: true } },
                        quote: { select: { id: true, reference: true, total: true, status: true } },
                    },
                    orderBy: { createdAt: "desc" }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(partners);
    } catch (error) {
        console.error("[PARTNERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST /api/partners — Create a new partner account
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, firstName, lastName, email, phone, companyName, commissionRate, password } = body;

        if (!name || !email) {
            return NextResponse.json({ error: "Nom et email requis" }, { status: 400 });
        }

        const existing = await (prisma as any).user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
        }

        let hashedPassword = null;
        if (password) {
            const bcrypt = await import("bcryptjs");
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const partner = await (prisma as any).user.create({
            data: {
                name,
                firstName: firstName || null,
                lastName: lastName || null,
                email,
                phone: phone || null,
                companyName: companyName || null,
                commissionRate: commissionRate ? parseFloat(commissionRate) : 10,
                role: "PARTNER",
                password: hashedPassword,
                status: "Active"
            }
        });

        return NextResponse.json(partner, { status: 201 });
    } catch (error) {
        console.error("[PARTNERS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
