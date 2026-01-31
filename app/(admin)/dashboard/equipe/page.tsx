import Topbar from "@/components/Topbar";
import { prisma } from "@/lib/prisma";
import React from "react";
import TeamAdminClient from "@/components/admin/TeamAdminClient";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getTeam() {
    try {
        const team = await prisma.user.findMany({
            where: {
                role: {
                    in: ["ADMIN", "SUPER_ADMIN"]
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return team.map((member) => ({
            ...member,
            createdAt: member.createdAt.toISOString(),
            updatedAt: member.updatedAt.toISOString(),
            lastLoginAt: member.lastLoginAt ? member.lastLoginAt.toISOString() : null,
        }));
    } catch (error) {
        console.error("Error fetching team directly:", error);
        return [];
    }
}

export default async function TeamPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== "SUPER_ADMIN") {
        redirect("/forbidden");
    }

    const team = await getTeam();

    return (
        <div className="flex h-full flex-col overflow-hidden bg-[#f8f6fb] dark:bg-black">
            <Topbar title="Gestion de l'équipe" />
            <div className="flex flex-1 flex-col overflow-y-auto">
                <TeamAdminClient team={team} currentUserId={user.id} />
            </div>
        </div>
    );
}
