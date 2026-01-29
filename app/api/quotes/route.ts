import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        // const user = await getCurrentUser();
        // if (!user) {
        //    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        // }

        const body = await req.json();

        // Basic validation
        if (!body.clientId) {
            return NextResponse.json(
                { error: "Le client est requis" },
                { status: 400 }
            );
        }

        // Generate Reference: D-{YEAR}-{INCREMENT}
        const year = new Date().getFullYear();
        const count = await prisma.quote.count({
            where: {
                createdAt: {
                    gte: new Date(`${year}-01-01`),
                    lt: new Date(`${year + 1}-01-01`),
                },
            },
        });
        const increment = (count + 1).toString().padStart(3, "0");
        const reference = `D-${year}-${increment}`;

        // Create Quote
        const quote = await prisma.quote.create({
            data: {
                reference,
                clientId: body.clientId,
                projectId: body.projectId || null,
                status: "DRAFT",
                issuedAt: new Date(body.issuedAt || Date.now()),
                validUntil: body.validUntil ? new Date(body.validUntil) : null,
                items: JSON.stringify(body.items || []),
                subtotal: parseFloat(body.subtotal) || 0,
                taxRate: parseFloat(body.taxRate) || 0,
                taxAmount: parseFloat(body.taxAmount) || 0,
                total: parseFloat(body.total) || 0,
                notes: body.notes,
                terms: body.terms, // Legacy field, kept just in case
                termsConfig: JSON.stringify(body.termSections || []),
                paymentType: body.paymentType || "ONESHOT",
                isRecurring: body.isRecurring || false,
                stripeAutoSend: body.stripeAutoSend || false,
            },
            include: {
                client: true, // Return client details for UI update
            },
        });

        return NextResponse.json(quote, { status: 201 });
    } catch (error: any) {
        console.error("Error creating quote full details:", error);
        return NextResponse.json(
            { error: "Erreur création devis: " + (error.message || String(error)), stack: error.stack },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        const where: any = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { reference: { contains: search } },
                { client: { name: { contains: search } } },
                { client: { companyName: { contains: search } } },
            ];
        }

        const quotes = await prisma.quote.findMany({
            where,
            include: {
                client: {
                    select: { name: true, companyName: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(quotes);
    } catch (error) {
        console.error("Error fetching quotes:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des devis" },
            { status: 500 }
        );
    }
}
