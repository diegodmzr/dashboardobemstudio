import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        const where: any = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { client: { name: { contains: search } } },
                { client: { companyName: { contains: search } } },
                { stripePaymentId: { contains: search } },
            ];
        }

        const payments = await prisma.payment.findMany({
            where,
            include: {
                client: {
                    select: { name: true, companyName: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Calculate aggregated stats
        const stats = {
            totalRevenue: payments
                .filter((p) => p.status === "PAID")
                .reduce((sum, p) => sum + p.amount, 0),
            pendingAmount: payments
                .filter((p) => p.status === "PENDING")
                .reduce((sum, p) => sum + p.amount, 0),
            lateCount: payments.filter((p) => p.status === "LATE").length,
        };

        return NextResponse.json({ payments, stats });
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des paiements" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        // Auth is already handled by the /dashboard layout middleware
        // const user = await getCurrentUser();
        // if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const body = await req.json();

        console.log("📥 Creating payment with data:", body);

        // Validation
        if (!body.clientId) {
            return NextResponse.json({ error: "Client requis" }, { status: 400 });
        }

        const parsedAmount = parseFloat(body.amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
        }

        // Basic creation mostly for Manual payments
        const payment = await prisma.payment.create({
            data: {
                amount: parsedAmount,
                status: body.status || "PENDING",
                method: body.method || "MANUAL",
                clientId: body.clientId,
                projectId: body.projectId || null,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                paidAt: body.paidAt ? new Date(body.paidAt) : null,
                stripePaymentId: body.stripePaymentId || null,
                invoiceUrl: body.invoiceUrl || null,
                description: body.description || "",
            },
        });

        console.log("✅ Payment created:", payment.id);

        return NextResponse.json(payment, { status: 201 });
    } catch (error: any) {
        console.error("❌ Error creating payment:", error);
        console.error("Error details:", error.message);
        return NextResponse.json(
            { error: error.message || "Erreur lors de la création du paiement" },
            { status: 500 }
        );
    }
}
