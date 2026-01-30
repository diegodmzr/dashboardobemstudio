import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const subscriptions = await prisma.subscription.findMany({
            where: {
                clientId: user.id
            },
            include: {
                // If project is linked, get its name
                // Note: Schema might not have explicit relation to project model, 
                // but checking schema.prisma I recall 'projectId' exists. 
                // If 'Project' model exists and handled, good. 
                // Let's check if 'Project' is a valid model. I'll omit include project relation if I am not sure,
                // but let's try to include it if valid.
                // Assuming no direct relation defined in schema for projectId -> Project model based on previous views (it said // Relations ... projectId String?), 
                // actually let's check schema again or safer: fetch projects separately or assume 'project' relation might not exist on Subscription model yet.
                // Re-reading schema lines 225: projectId String?
                // It does NOT show @relation for projectId. So I can't include project.
                // I will fetch project names manually if needed or just show "Projet"
                // Actually, I can allow the client component to handle "Project ID" display or just basic info.
                // Wait, users want to know WHAT they are paying for.
                // I will try to fetch project names.
            },
            orderBy: { createdAt: "desc" },
        });

        // Fetch projects manually to map names
        const projectIds = subscriptions.map((s) => s.projectId).filter(Boolean) as string[];
        const projects = await prisma.project.findMany({
            where: { id: { in: projectIds } },
            select: { id: true, name: true }
        });

        // Enhance with metadata and joined project info
        const enhancedSubscriptions = subscriptions.map((sub: any) => {
            let startDate = sub.startDate || sub.currentPeriodStart;
            let endDate = sub.endDate || null;

            if (sub.metadata) {
                try {
                    const meta = JSON.parse(sub.metadata);
                    if (meta.startDate) startDate = meta.startDate;
                    if (meta.endDate) endDate = meta.endDate;
                } catch (e) {
                    // Ignore
                }
            }

            const project = projects.find(p => p.id === sub.projectId);

            return {
                ...sub,
                startDate,
                endDate,
                project: project ? { name: project.name } : null
            };
        });

        return NextResponse.json({ subscriptions: enhancedSubscriptions });
    } catch (error) {
        console.error("Error fetching client subscriptions:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des abonnements" },
            { status: 500 }
        );
    }
}
