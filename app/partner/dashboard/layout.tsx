import type { ReactNode } from "react";
import DashboardShell from "@/components/DashboardShell";
import { type NavItem } from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
    AnimatedHome,
    AnimatedProjects,
    AnimatedFinance,
} from "@/components/ui/AnimatedIcons";

const partnerNavItems: NavItem[] = [
    {
        label: "Accueil",
        href: "/partner/dashboard",
        icon: <AnimatedHome />,
    },
    {
        label: "Mes Projets",
        href: "/partner/dashboard/projets",
        icon: <AnimatedProjects />,
    },
    {
        label: "Mes Commissions",
        href: "/partner/dashboard/commissions",
        icon: <AnimatedFinance />,
    },
];

export const dynamic = "force-dynamic";

export default async function PartnerDashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) redirect("/login");
    if (user.role !== "PARTNER") redirect("/dashboard");

    return (
        <DashboardShell navItems={partnerNavItems} user={user || undefined}>
            {children}
        </DashboardShell>
    );
}
