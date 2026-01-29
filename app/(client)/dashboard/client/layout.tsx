import type { ReactNode } from "react";
import Sidebar, { type NavItem } from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/auth";

// Client navigation items (left rail)
const clientNavItems: NavItem[] = [
  {
    label: "Accueil",
    href: "/dashboard/client",
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
    href: "/dashboard/client/projets",
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
    label: "Demandes",
    href: "/dashboard/client/demandes",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="9" />
        <path
          d="M12 8v5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="16" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Paiements",
    href: "/dashboard/client/paiements",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <rect x="3.5" y="6.5" width="17" height="11" rx="2" />
        <path d="M3.5 10h17" strokeLinecap="round" />
        <path d="M7.5 14h3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default async function ClientDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex h-screen overflow-hidden bg-[#f2eff3] text-[#4a4a4a] dark:bg-black dark:text-gray-100">
      <Sidebar
        navItems={clientNavItems}
        userName={user?.name}
        userEmail={user?.email}
        userAvatar={user?.avatar || undefined}
      />
      <div className="flex flex-1 flex-col p-6 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto rounded-3xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] ring-1 ring-[#efedf0] dark:bg-black dark:ring-[#333] dark:shadow-none">
          {children}
        </div>
      </div>
    </div>
  );
}
