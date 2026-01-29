import Topbar from "@/components/Topbar";
import React from "react";

export default function DemandesPage() {
  return (
    <>
      <Topbar title="Demandes" />
      <main className="flex-1 px-8 py-6">
        <div className="flex h-full flex-col items-center justify-center text-center text-[#6a6a6a] dark:text-gray-400">
          <div className="mb-4 rounded-full bg-gradient-to-br from-[#f8f6fb] to-[#ece7ef] p-4 shadow-sm dark:from-[#333] dark:to-[#222] dark:shadow-none">
            <svg
              className="h-8 w-8 text-[#2f2f2f] dark:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="16" r="0.6" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#2f2f2f] dark:text-white">Module Demandes</h2>
          <p>Cette fonctionnalité sera bientôt disponible.</p>
        </div>
      </main>
    </>
  );
}
