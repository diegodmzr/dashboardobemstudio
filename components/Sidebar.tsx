"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState, useEffect } from "react";
import NotificationBadge from "./admin/notifications/NotificationBadge";
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  active?: boolean;
  children?: NavItem[];
};

const utilityItems: NavItem[] = [
  {
    label: "Parametres",
    href: "/dashboard/parametres",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="2.5" />
        <path
          d="m6 9.5-.9-1.6 1.6-.9M18 9.5l.9-1.6-1.6-.9M6 14.5l-.9 1.6 1.6.9M18 14.5l.9 1.6-1.6.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 5.5V4" strokeLinecap="round" />
        <path d="M12 20v-1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const NavLink = ({ item, isCollapsed, onMobileClose }: { item: NavItem, isCollapsed: boolean, onMobileClose?: () => void }) => {
  const pathname = usePathname();
  // Check if item is active or any child is active
  const isActive = item.active ?? (pathname === item.href || (item.children && item.children.some(child => pathname === child.href)));
  const [isOpen, setIsOpen] = useState(isActive);

  // Auto-expand if a child becomes active
  useEffect(() => {
    if (isActive && !isOpen) setIsOpen(true);
  }, [isActive, isOpen]);

  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[14px] font-medium transition-colors ${isActive
            ? "bg-white text-[#2f2f2f] shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:bg-[#222] dark:text-white dark:shadow-none"
            : "text-[#8a8a8a] hover:bg-white/60 hover:text-[#4a4a4a] dark:text-gray-400 dark:hover:bg-[#222] dark:hover:text-white"
            } ${isCollapsed ? "justify-center px-2" : ""}`}
          title={isCollapsed ? item.label : undefined}
        >
          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}>
            <span className="text-[#6d6d6d] dark:text-current">{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </div>
          {!isCollapsed && (
            <svg
              className={`h-4 w-4 text-[#8a8a8a] transition-transform ${isOpen ? "rotate-180" : ""} dark:text-gray-500`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {isOpen && !isCollapsed && (
          <div className="ml-9 space-y-1 border-l border-[#d8d4da] pl-2 dark:border-[#333]">
            {item.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onMobileClose}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === child.href
                  ? "bg-[#e5e5e5] text-[#2f2f2f] dark:bg-[#333] dark:text-white"
                  : "text-[#8a8a8a] hover:bg-white/60 hover:text-[#4a4a4a] dark:text-gray-400 dark:hover:bg-[#222] dark:hover:text-white"
                  }`}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onMobileClose}
      className={`flex items-center gap-3 rounded-xl px-2.5 py-2 text-[14px] font-medium transition-colors ${isActive
        ? "bg-white text-[#2f2f2f] shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:bg-[#222] dark:text-white dark:shadow-none"
        : "text-[#8a8a8a] hover:bg-white/60 hover:text-[#4a4a4a] dark:text-gray-400 dark:hover:bg-[#222] dark:hover:text-white"
        } ${isCollapsed ? "justify-center px-2" : ""}`}
      title={isCollapsed ? item.label : undefined}
    >
      <span className="text-[#6d6d6d] dark:text-current">{item.icon}</span>
      {!isCollapsed && <span>{item.label}</span>}
    </Link>
  );
};

export default function Sidebar({
  navItems,
  brandLabel = "OBEM STUDIO",
  userName = "Diego Demazure",
  userEmail = "diego@obemstudio.com",
  userAvatar,
  onMobileClose,
}: {
  navItems: NavItem[];
  brandLabel?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onMobileClose?: () => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <aside className={`flex h-full flex-col justify-between bg-[#efedef] py-4 text-[#3d3d3d] transition-all duration-300 dark:bg-black dark:text-gray-100 dark:border-r dark:border-[#333] ${isCollapsed ? "w-20 px-2" : "w-full md:w-64 px-3"}`}>
      <div>
        {/* Logo + brand + toggle */}
        <div className={`flex items-center ${isCollapsed ? "justify-center flex-col gap-4" : "justify-between"} rounded-xl px-2 py-3`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="relative h-10 w-10 overflow-hidden rounded-lg flex-shrink-0">
              <img
                src="/iconlogo.png"
                alt="Logo"
                className="h-full w-full object-contain"
              />
            </div>
            {!isCollapsed && <div className="text-sm font-semibold text-[#1f1f1f] dark:text-white whitespace-nowrap">{brandLabel}</div>}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block text-gray-400 hover:text-black dark:hover:text-white transition p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#333]"
            title={isCollapsed ? "Ouvrir le menu" : "Fermer le menu"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Main navigation */}
        <nav className="mt-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.label} item={item} isCollapsed={isCollapsed} onMobileClose={onMobileClose} />
          ))}
        </nav>
      </div>

      <div className="space-y-2">
        {/* Secondary actions */}
        <div className="space-y-1">
          <NotificationBadge isCollapsed={isCollapsed} />
          {utilityItems.map((item, index) => (
            <div key={item.label} className="relative">
              <NavLink item={item} isCollapsed={isCollapsed} onMobileClose={onMobileClose} />
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#d8d4da] dark:bg-[#333]" />

        {/* User summary */}
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} rounded-xl px-2 py-2`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fde4ce] text-sm font-semibold text-[#4a331e] flex-shrink-0 overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{userName ? userName.charAt(0).toUpperCase() : "U"}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="leading-tight overflow-hidden">
                <div className="text-sm font-semibold text-[#2b2b2b] dark:text-white truncate">{userName}</div>
                <div className="text-xs text-[#8a8a8a] dark:text-gray-400 truncate">{userEmail}</div>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1 text-[#8a8a8a] hover:text-red-500 transition-colors dark:text-gray-500 dark:hover:text-red-400"
              title="Se déconnecter"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.6} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
