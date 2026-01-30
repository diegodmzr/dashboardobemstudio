"use client";

import { useState } from "react";
import ProfileTab from "./ProfileTab";
import SecurityTab from "./SecurityTab";
import AppearanceTab from "./AppearanceTab";
import { User } from "@prisma/client";
import { cn } from "@/lib/utils";

// Define the tabs
type Tab = "profile" | "security" | "appearance";

export default function SettingsMain({ user }: { user: User }) {
    const [activeTab, setActiveTab] = useState<Tab>("profile");

    const tabs: { id: Tab; label: string }[] = [
        { id: "profile", label: "Profil" },
        { id: "security", label: "Sécurité" },
        { id: "appearance", label: "Apparence" },
    ];

    return (
        <div className="space-y-6 w-full">
            {/* Tabs Header */}
            <div className="border-b border-[#ece7ef] dark:border-[#333] overflow-x-auto overflow-y-hidden scrollbar-hide">
                <nav className="-mb-px flex space-x-6 md:space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200 outline-none",
                                activeTab === tab.id
                                    ? "border-[#2f2f2f] text-[#2f2f2f] dark:border-white dark:text-white"
                                    : "border-transparent text-[#8a8a8a] hover:border-gray-300 hover:text-[#2f2f2f] dark:text-gray-400 dark:hover:text-white"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl border border-[#ece7ef] shadow-sm p-4 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-forwards dark:bg-[#111111] dark:border-[#333]">
                {activeTab === "profile" && (
                    <ProfileTab user={user} />
                )}
                {activeTab === "security" && (
                    <SecurityTab user={user} />
                )}
                {activeTab === "appearance" && (
                    <AppearanceTab user={user} />
                )}
            </div>
        </div>
    );
}
