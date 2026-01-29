"use client";

import type { ReactNode } from "react";

type TopbarProps = {
  title?: string;
  subtitle?: string;
  rightContent?: ReactNode;
  userName?: string;
  userEmail?: string;
};

// Simple top bar that shows the current page title and a compact user chip.
export default function Topbar({
  title = "Projets",
  subtitle,
  rightContent,
  userName = "Diego",
  userEmail = "diego@obemstudio.com",
}: TopbarProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#f1eef2] bg-white px-4 md:px-8 py-5 dark:bg-black dark:border-[#333]">
      <div className="w-full md:w-auto">
        <h1 className="text-xl font-semibold text-[#3b3b3b] dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
        {rightContent}
      </div>
    </header>
  );
}
