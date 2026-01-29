"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppearanceTab({ user }: { user: User }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="space-y-8">
            <div>
                <p className="text-sm font-medium text-[#8a8a8a] dark:text-gray-400">
                    Choisissez le thème de l'interface qui vous convient le mieux.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Light Mode */}
                <button
                    onClick={() => setTheme("light")}
                    className={cn(
                        "relative flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-all duration-200",
                        theme === "light"
                            ? "border-black bg-black text-white shadow-lg ring-1 ring-black dark:bg-white dark:text-black dark:ring-white dark:border-white"
                            : "border-[#ece7ef] bg-white text-[#2f2f2f] hover:border-[#2f2f2f] hover:bg-[#f8f6fb] dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:hover:bg-[#222]"
                    )}
                >
                    <Sun className={cn("h-6 w-6", theme === "light" ? "text-white dark:text-black" : "text-[#2f2f2f] dark:text-white")} />
                    <span className="text-sm font-medium">Clair</span>
                </button>

                {/* Dark Mode */}
                <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                        "relative flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-all duration-200",
                        theme === "dark"
                            ? "border-black bg-black text-white shadow-lg ring-1 ring-black dark:bg-white dark:text-black dark:ring-white dark:border-white"
                            : "border-[#ece7ef] bg-white text-[#2f2f2f] hover:border-[#2f2f2f] hover:bg-[#f8f6fb] dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:hover:bg-[#222]"
                    )}
                >
                    <Moon className={cn("h-6 w-6", theme === "dark" ? "text-white dark:text-black" : "text-[#2f2f2f] dark:text-white")} />
                    <span className="text-sm font-medium">Sombre</span>
                </button>

                {/* System Mode */}
                <button
                    onClick={() => setTheme("system")}
                    className={cn(
                        "relative flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-all duration-200",
                        theme === "system"
                            ? "border-black bg-black text-white shadow-lg ring-1 ring-black dark:bg-white dark:text-black dark:ring-white dark:border-white"
                            : "border-[#ece7ef] bg-white text-[#2f2f2f] hover:border-[#2f2f2f] hover:bg-[#f8f6fb] dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:hover:bg-[#222]"
                    )}
                >
                    <Monitor className={cn("h-6 w-6", theme === "system" ? "text-white dark:text-black" : "text-[#2f2f2f] dark:text-white")} />
                    <span className="text-sm font-medium">Système</span>
                </button>
            </div>
        </div>
    );
}
