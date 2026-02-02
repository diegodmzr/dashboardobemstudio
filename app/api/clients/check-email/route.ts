import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json(
                { error: "Email parameter is required" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        return NextResponse.json({ exists: !!existingUser });
    } catch (error) {
        console.error("Error checking email:", error);
        return NextResponse.json(
            { error: "Error checking email" },
            { status: 500 }
        );
    }
}
