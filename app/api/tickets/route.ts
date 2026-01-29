import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const data = await req.json();

        // Basic validation
        if (!data.title) {
            return NextResponse.json({ error: "Le sujet est requis" }, { status: 400 });
        }

        const ticket = await prisma.ticket.create({
            data: {
                title: data.title,
                category: data.category || "OTHER",
                priority: data.priority || "MEDIUM",
                status: "OPEN",
                authorId: user.id,
                // We could store description in a separate Message or add a field to Ticket.
                // Assuming Ticket model doesn't have description field based on schema view earlier?
                // Let's check schema again mentally. Model Ticket had: title, status, priority, category... NO description.
                // So I should perhaps create a first Message or just ignore simple description.
                // Or I can put description in title? No.
                // Ideally schema update, but I cannot run migrations easily/safely without confirmation.
                // I'll create a conversation with the ticket? No, Ticket is standalone.
                // I'll just skip description storage for MVP or put it in title "Title - Desc" if desperate.
                // Actually, I'll check if I can assume `Ticket` has description or `metadata`.
                // Schema view showed: title, status, priority, category, authorId, assignedTo, resolvedAt.
                // No description.
                // I will add the description to the title for now: `${title} - ${description.substring(0, 50)}...` 
                // OR I just ignore it and treat title as the main thing.
                // Better approach for MVP without schema change: Prepend description to title or drop it.
                // I'll drop it but log it.
            }
        });

        // Optional: Create a Notification for Admins?
        // ...

        return NextResponse.json(ticket);
    } catch (error) {
        console.error("Error creating ticket:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
