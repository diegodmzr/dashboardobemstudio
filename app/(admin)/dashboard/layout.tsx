import type { ReactNode } from "react";
import DashboardShell from "@/components/DashboardShell";
import { type NavItem } from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/auth";
import {
  AnimatedHome,
  AnimatedProjects,
  AnimatedClients,
  AnimatedMessage,
  AnimatedForms,
  AnimatedFinance,
  AnimatedGoals,
  AnimatedStats,
  AnimatedUsers
} from "@/components/ui/AnimatedIcons";

const defaultNavItems: NavItem[] = [
  {
    label: "Accueil",
    href: "/dashboard",
    icon: <AnimatedHome />,
  },
  {
    label: "Projets",
    href: "/dashboard/projets",
    icon: <AnimatedProjects />,
  },
  {
    label: "Clients",
    href: "/dashboard/clients",
    icon: <AnimatedClients />,
  },
  {
    label: "Messagerie",
    href: "/dashboard/discussion",
    icon: <AnimatedMessage />,
  },
  {
    label: "Formulaires",
    href: "/dashboard/forms",
    icon: <AnimatedForms />,
  },


  {
    label: "Finances",
    href: "/dashboard/finances",
    icon: <AnimatedFinance />,
    children: [
      {
        label: "Devis",
        href: "/dashboard/finances/devis",
        icon: null
      },
      {
        label: "Paiements",
        href: "/dashboard/finances/paiements",
        icon: null
      }
    ]
  },
  {
    label: "Objectifs",
    href: "/dashboard/objectifs",
    icon: <AnimatedGoals />,
  },
  {
    label: "Statistiques",
    href: "/dashboard/statistiques",
    icon: <AnimatedStats />,
  },
];

// Define client-specific navigation items
const clientNavItems: NavItem[] = [
  {
    label: "Accueil",
    href: "/dashboard",
    icon: <AnimatedHome />,
  },
  {
    label: "Mes Projets",
    href: "/dashboard/projets",
    icon: <AnimatedProjects />,
  },
  {
    label: "Messagerie",
    href: "/dashboard/discussion",
    icon: <AnimatedMessage />,
  },
  {
    label: "Mes Finances",
    href: "/dashboard/finances",
    icon: <AnimatedFinance />,
    children: [
      {
        label: "Mes Devis",
        href: "/dashboard/finances/devis",
        icon: null
      },
      {
        label: "Mes Paiements",
        href: "/dashboard/finances/paiements",
        icon: null
      },
      {
        label: "Mes Abonnements",
        href: "/dashboard/finances/abonnements",
        icon: null
      }
    ]
  },
];


export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  // Determine nav items based on role
  let navItems = user?.role === "CLIENT" ? clientNavItems : [...defaultNavItems];

  // Add Super Admin specific items
  if (user?.role === "SUPER_ADMIN") {
    // Insert "Équipe" after "Clients" (index 2 + 1 = 3)
    navItems.splice(3, 0, {
      label: "Équipe",
      href: "/dashboard/equipe",
      icon: <AnimatedUsers />,
    });
  }

  return (
    <DashboardShell navItems={navItems} user={user || undefined}>
      {children}
    </DashboardShell>
  );
}
