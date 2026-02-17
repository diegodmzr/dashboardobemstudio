import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role === "CLIENT") return new NextResponse("Unauthorized", { status: 401 });

        const prospects = await prisma.prospect.findMany({
            include: {
                zone: true
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(prospects);
    } catch (error) {
        console.error("Failed to fetch prospects", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role === "CLIENT") return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { name, email, phone, address, company, zoneId, status, notes, latitude, longitude, color } = body;

        const prospect = await prisma.prospect.create({
            data: {
                name,
                email,
                phone,
                address,
                company,
                zoneId,
                status: status || "NOT_APPROACHED",
                notes,
                latitude,
                longitude,
                color
            }
        });

        return NextResponse.json(prospect);
    } catch (error) {
        console.error("Failed to create prospect", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
