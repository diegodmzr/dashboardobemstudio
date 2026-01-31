"use client";

import { motion } from "framer-motion";

type Props = {
    userName: string;
    role: "ADMIN" | "CLIENT" | "SUPER_ADMIN";
};

export default function HeaderGreeting({ userName, role }: Props) {
    const greeting = `Bonjour ${userName.split(" ")[0]} 👋`;
    const subtitle = role === "CLIENT"
        ? "Voici un aperçu de l'avancement de vos projets et de vos paiements."
        : "Voici un aperçu de l'activité de l'agence aujourd'hui.";

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-1"
        >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {greeting}
            </h1>
            <p className="text-gray-500 text-sm dark:text-gray-400">
                {subtitle}
            </p>
        </motion.div>
    );
}
