import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/partners/commissions — Get commissions for current partner user
export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        let commissions;

        if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
            // Admin sees all commissions
            const url = new URL(req.url);
            const partnerId = url.searchParams.get("partnerId");
            commissions = await (prisma as any).partnerCommission.findMany({
                where: partnerId ? { partnerId } : undefined,
                include: {
                    partner: { select: { id: true, name: true, email: true, commissionRate: true } },
                    project: { select: { id: true, name: true, amount: true, status: true } },
                    quote: { select: { id: true, reference: true, total: true, status: true } },
                },
                orderBy: { createdAt: "desc" }
            });
        } else if (user.role === "PARTNER") {
            // Partner sees only their own
            commissions = await (prisma as any).partnerCommission.findMany({
                where: { partnerId: user.id },
                include: {
                    project: { select: { id: true, name: true, amount: true, status: true } },
                    quote: { select: { id: true, reference: true, total: true, status: true } },
                },
                orderBy: { createdAt: "desc" }
            });
        } else {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        return NextResponse.json(commissions);
    } catch (error) {
        console.error("[COMMISSIONS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST /api/partners/commissions — Create a commission (admin)
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { partnerId, projectId, quoteId, label, commissionRate, baseAmount, notes } = body;

        if (!partnerId || !label || !baseAmount || commissionRate === undefined) {
            return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
        }

        const rate = parseFloat(commissionRate);
        const base = parseFloat(baseAmount);
        const commissionAmount = (base * rate) / 100;

        const commission = await (prisma as any).partnerCommission.create({
            data: {
                partnerId,
                projectId: projectId || null,
                quoteId: quoteId || null,
                label,
                commissionRate: rate,
                baseAmount: base,
                commissionAmount,
                notes: notes || null,
                status: "PENDING"
            },
            include: {
                partner: { select: { id: true, name: true, email: true } },
                project: { select: { id: true, name: true } },
                quote: { select: { id: true, reference: true } },
            }
        });

        return NextResponse.json(commission, { status: 201 });
    } catch (error) {
        console.error("[COMMISSIONS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
