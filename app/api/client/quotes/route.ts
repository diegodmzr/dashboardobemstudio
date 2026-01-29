import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        // Only clients can access this endpoint
        if (user.role !== "CLIENT") {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        // Build where clause
        const where: any = {
            clientId: user.id,
        };

        if (status && status !== "all") {
            if (status === "pending") {
                where.status = { in: ["SENT", "PENDING"] };
            } else if (status === "signed") {
                where.status = { in: ["ACCEPTED", "SIGNED"] };
            } else if (status === "rejected") {
                where.status = { in: ["REJECTED", "REFUSED", "EXPIRED"] };
            }
        }

        // Fetch quotes
        const quotes = await prisma.quote.findMany({
            where,
            include: {
                client: {
                    select: {
                        name: true,
                        companyName: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Format user-friendly project name if projectId is present
        // Note: Quote model currently has projectId as string but no direct relation in provided schema? 
        // Let's check schema again. Schema line 100: projectId String? // Linked project (optional)
        // It seems there is no relation defined in schema line 100, just a comment. 
        // Wait, line 145 in Payment had relation. 
        // Let's assume for now we fetch project manually if needed or just use ID. 
        // Actually, let's look at schema for Quote again.

        // Format dates
        const formattedQuotes = quotes.map((q) => ({
            id: q.id,
            reference: q.reference,
            projectId: q.projectId,
            // projectName: ... we might need to fetch this if we want it
            status: q.status,
            total: q.total,
            issuedAt: q.issuedAt.toISOString(),
            validUntil: q.validUntil ? q.validUntil.toISOString() : null,
            pdfUrl: q.pdfUrl,
            items: JSON.parse(q.items),
        }));

        return NextResponse.json({ quotes: formattedQuotes });
    } catch (error) {
        console.error("Error fetching client quotes:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
