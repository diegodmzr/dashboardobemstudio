import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role === "CLIENT") return new NextResponse("Unauthorized", { status: 401 });

        const zones = await prisma.zone.findMany({
            include: {
                prospects: true
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(zones);
    } catch (error) {
        console.error("Failed to fetch zones", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role === "CLIENT") return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { name, color, status, prospectionDate, assignedTo, coordinates } = body;

        const zone = await prisma.zone.create({
            data: {
                name,
                color,
                status,
                prospectionDate: prospectionDate ? new Date(prospectionDate) : null,
                assignedTo,
                coordinates
            }
        });

        return NextResponse.json(zone);
    } catch (error) {
        console.error("Failed to create zone", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
