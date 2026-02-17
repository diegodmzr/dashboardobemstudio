"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import StepProgressBar from "@/components/admin/StepProgressBar";

type Props = {
    projects: any[];
    role: "ADMIN" | "CLIENT" | "SUPER_ADMIN";
};

export default function ProjectsBlock({ projects, role }: Props) {
    const listUrl = "/dashboard/projets";

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 dark:bg-[#111] dark:border-[#333]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">
                    {role === "CLIENT" ? "Vos Projets" : "Projets Récents"}
                </h3>
                <Link
                    href={listUrl}
                    className="text-xs font-semibold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white flex items-center transition-colors"
                >
                    Voir tout <ChevronRight className="w-3 h-3 ml-0.5" />
                </Link>
            </div>

            <div className="space-y-3">
                {projects.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8 bg-gray-50 rounded-xl dark:bg-[#1a1a1a]">
                        Aucun projet en cours
                    </div>
                ) : (
                    projects.map((project) => {
                        // Determine detail URL
                        const projectUrl = `/dashboard/projets/${project.id}`;

                        return (
                            <Link
                                key={project.id}
                                href={projectUrl}
                                className="block group p-4 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition cursor-pointer dark:bg-[#1a1a1a] dark:border-[#333] dark:hover:border-gray-700"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 group-hover:text-black dark:text-white dark:group-hover:text-white">
                                            {project.name}
                                        </h4>
                                        {role !== "CLIENT" && project.client && (
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                {project.client.avatar && (
                                                    <img src={project.client.avatar} className="w-3 h-3 rounded-full" />
                                                )}
                                                {project.client.name}
                                            </p>
                                        )}
                                    </div>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-white border border-gray-100 dark:bg-[#222] dark:border-[#333] dark:text-gray-300">
                                        {project.status || "En cours"}
                                    </span>
                                </div>

                                {/* Progress Bar - Replaced with Steps */}
                                <div className="mt-4">
                                    <StepProgressBar
                                        currentStatus={project.status}
                                        size="small"
                                    // Pass progressConfig if available in dashboard data projects? 
                                    // Assuming standard projects for now.
                                    />
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
