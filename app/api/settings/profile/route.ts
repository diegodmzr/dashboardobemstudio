import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
    try {
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { firstName, lastName, email, phone, address, siret } = body;

        // Optional: Add server-side validation here (e.g. Zod)

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: sessionUser.id },
            data: {
                firstName,
                lastName,
                name: `${firstName} ${lastName}`.trim() || sessionUser.name, // Keep name in sync or fallback
                email,
                phone,
                address,
                siret,
            },
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
