"use client";

import Link from "next/link";

export default function ProjectRequestSuccess() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8f6fb] dark:bg-black p-8">
            <div className="w-full max-w-md text-center">
                <div className="mb-8 flex justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black dark:bg-white">
                        <svg
                            className="h-12 w-12 text-white dark:text-black"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                <h1 className="mb-4 text-3xl font-bold text-[#2f2f2f] dark:text-white">
                    Demande envoyée avec succès !
                </h1>

                <p className="mb-8 text-[#6a6a6a] dark:text-gray-400">
                    Nous avons bien reçu votre demande de projet. Notre équipe va l'examiner et reviendra vers vous sous <strong className="text-[#2f2f2f] dark:text-white">24-48h</strong> pour discuter des détails.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/"
                        className="block rounded-xl bg-black px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}
