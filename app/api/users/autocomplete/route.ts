import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query")?.toLowerCase();

        if (!query || !query.startsWith("@")) {
            return NextResponse.json([]);
        }

        const searchTerm = query.substring(1); // Remove '@'

        let whereClause: any = {
            OR: [
                { name: { contains: searchTerm } },
                { email: { contains: searchTerm } }
            ]
        };

        // Rule: Clients only see Admins and Super Admins. Admins/Super Admins see everyone.
        if (user.role === "CLIENT") {
            whereClause.role = { in: ["ADMIN", "SUPER_ADMIN"] };
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            take: 5,
            select: {
                id: true,
                name: true,
                role: true,
                avatar: true // Important for UI to show avatar in dropdown
            }
        });

        // Format username as strict lowercase concatenated first+last based on name
        const results = users.map(u => ({
            ...u,
            username: u.name.toLowerCase().replace(/\s+/g, "")
        }));

        return NextResponse.json(results);

    } catch (error) {
        console.error("Autocomplete error", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
