"use client";

import { useState, useEffect } from "react";
import Sidebar, { type NavItem } from "@/components/Sidebar";
import { Menu } from "lucide-react";
import MobileNavbar from "./MobileNavbar";

type Props = {
    children: React.ReactNode;
    navItems: NavItem[];
    user?: {
        name?: string | null;
        email?: string | null;
        avatar?: string | null;
        role?: string;
    };
};

export default function DashboardShell({ children, navItems, user }: Props) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    // Initial Load Effect
    useEffect(() => {
        // Start progress
        const start = Date.now();
        const duration = 2000; // 2 seconds

        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const p = Math.min((elapsed / duration) * 100, 100);
            setProgress(p);

            if (p >= 100) {
                clearInterval(interval);
                setTimeout(() => setIsLoading(false), 200); // Small delay to show full bar
            }
        }, 16); // ~60fps

        return () => clearInterval(interval);
    }, []);

    // Loader Overlay
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#f2eff3] dark:bg-black text-[#4a4a4a] dark:text-gray-100">
                <div className="flex flex-col items-center gap-6 animate-fadeIn">
                    <div className="relative h-16 w-16">
                        <img src="/iconlogo.png" alt="Obem Studio" className="h-full w-full object-contain" />
                    </div>

                    <div className="w-48 h-1 bg-gray-300 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-black dark:bg-white transition-all ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#f2eff3] text-[#4a4a4a] dark:bg-black dark:text-gray-100 animate-fadeIn">
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
            <div className="flex flex-1 flex-col overflow-hidden w-full relative">
                {/* Floating Mobile Burger Button */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="fixed top-6 left-6 z-40 md:hidden flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/70 shadow-lg backdrop-blur-xl transition-all active:scale-95 dark:bg-black/70 dark:border-white/10"
                >
                    <Menu className="w-6 h-6 text-black dark:text-white" />
                </button>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
                    <div className="mt-14 md:mt-0 min-h-full flex flex-col rounded-3xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] ring-1 ring-[#efedf0] overflow-hidden dark:bg-black dark:ring-[#333] dark:shadow-none">
                        {children}
                    </div>
                </main>

                <MobileNavbar role={user?.role} onMobileClose={() => setMobileMenuOpen(false)} />
            </div>
        </div>
    );
}
