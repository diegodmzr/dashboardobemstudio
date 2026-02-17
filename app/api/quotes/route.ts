import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();

        // 1. Handle Manual Client Creation
        let clientId = body.clientId;

        if (body.isManual && body.manualClientInfo) {
            const { name, email, companyName, address, phone, siret } = body.manualClientInfo;

            if (!email || !name) {
                return NextResponse.json({ error: "Email et Nom sont requis pour une saisie manuelle" }, { status: 400 });
            }

            // Find existing or create new
            const client = await prisma.user.upsert({
                where: { email: email.toLowerCase() },
                update: {
                    // Update info if it was a ghost user or just to keep it fresh
                    name,
                    companyName: companyName || null,
                    address: address || null,
                    phone: phone || null,
                    siret: siret || null,
                },
                create: {
                    email: email.toLowerCase(),
                    name,
                    companyName: companyName || null,
                    address: address || null,
                    phone: phone || null,
                    siret: siret || null,
                    role: "CLIENT",
                    status: "Active"
                },
            });
            clientId = client.id;
        }

        // Basic validation
        if (!clientId) {
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
                clientId: clientId,
                projectId: body.projectId || null,
                status: "DRAFT",
                issuedAt: new Date(body.issuedAt || Date.now()),
                validUntil: body.validUntil ? new Date(body.validUntil) : null,
                items: JSON.stringify({
                    label: body.quantityLabel || "MOIS",
                    lines: body.items || []
                }),
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
        const user = await getCurrentUser();
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }
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
