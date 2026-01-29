"use client";

import { useState } from "react";
import Sidebar, { type NavItem } from "@/components/Sidebar";
import { Menu } from "lucide-react";

type Props = {
    children: React.ReactNode;
    navItems: NavItem[];
    user?: {
        name?: string | null;
        email?: string | null;
        avatar?: string | null;
    };
};

export default function DashboardShell({ children, navItems, user }: Props) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-[#f2eff3] text-[#4a4a4a] dark:bg-black dark:text-gray-100">
            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar (Desktop & Mobile) */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-auto
                ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <Sidebar
                    navItems={navItems}
                    userName={user?.name || undefined}
                    userEmail={user?.email || undefined}
                    userAvatar={user?.avatar || undefined}
                    onMobileClose={() => setMobileMenuOpen(false)}
                />
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden w-full">
                {/* Mobile Header */}
                <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm md:hidden dark:bg-[#111] dark:border-b dark:border-[#333]">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222]"
                        >
                            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </button>
                        <span className="font-semibold text-gray-900 dark:text-white">OBEM STUDIO</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="min-h-full flex flex-col rounded-3xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] ring-1 ring-[#efedf0] overflow-hidden dark:bg-black dark:ring-[#333] dark:shadow-none">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
