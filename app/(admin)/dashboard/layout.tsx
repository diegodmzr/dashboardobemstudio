import type { ReactNode } from "react";
import DashboardShell from "@/components/DashboardShell";
import { type NavItem } from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/auth";

const defaultNavItems: NavItem[] = [
  {
    label: "Accueil",
    href: "/dashboard",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M3 10.5 12 4l9 6.5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M5 12.5V20h14v-7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Projets",
    href: "/dashboard/projets",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <rect x="3.5" y="6" width="17" height="12.5" rx="2" />
        <path d="M3.5 10.5h17" strokeLinecap="round" />
        <path d="M9.5 6V4" strokeLinecap="round" />
        <path d="M14.5 6V4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Clients",
    href: "/dashboard/clients",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M23 21v-2a4 4 0 0 0-3-3.87"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 3.13a4 4 0 0 1 0 7.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Messagerie",
    href: "/dashboard/discussion",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <path d="m22 6-10 7L2 6" />
      </svg>
    ),
  },
  {
    label: "Formulaires",
    href: "/dashboard/forms",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 13H8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 17H8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },


  {
    label: "Finances",
    href: "/dashboard/finances",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
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
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    label: "Statistiques",
    href: "/dashboard/statistiques",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M12 20V10" strokeLinecap="round" />
        <path d="M18 20V4" strokeLinecap="round" />
        <path d="M6 20v-4" strokeLinecap="round" />
      </svg>
    ),
  },
];

// Define client-specific navigation items
const clientNavItems: NavItem[] = [
  {
    label: "Accueil",
    href: "/dashboard",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M3 10.5 12 4l9 6.5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M5 12.5V20h14v-7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Mes Projets",
    href: "/dashboard/projets",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <rect x="3.5" y="6" width="17" height="12.5" rx="2" />
        <path d="M3.5 10.5h17" strokeLinecap="round" />
        <path d="M9.5 6V4" strokeLinecap="round" />
        <path d="M14.5 6V4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Messagerie",
    href: "/dashboard/discussion",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <path d="m22 6-10 7L2 6" />
      </svg>
    ),
  },
  {
    label: "Mes Finances",
    href: "/dashboard/finances",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
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
      }
    ]
  },
];


export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  // Determine nav items based on role
  const navItems = user?.role === "CLIENT" ? clientNavItems : defaultNavItems;

  return (
    <DashboardShell navItems={navItems} user={user || undefined}>
      {children}
    </DashboardShell>
  );
}
