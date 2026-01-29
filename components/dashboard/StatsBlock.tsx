"use client";

import KPICard from "@/components/admin/stats/KPICard";
import { motion } from "framer-motion";

type Props = {
    kpis: any;
    role: "ADMIN" | "CLIENT";
};

export default function StatsBlock({ kpis, role }: Props) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1 }
    };

    if (role === "ADMIN") {
        return (
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <motion.div variants={item}>
                    <KPICard
                        title="Revenus du Mois"
                        value={`${kpis.monthlyRevenue?.toLocaleString('fr-FR')} €`}
                        icon="euro"
                        color="green"
                    />
                </motion.div>
                <motion.div variants={item}>
                    <KPICard
                        title="Paiements en attente"
                        value={`${kpis.pendingPayments?.toLocaleString('fr-FR')} €`}
                        icon="clock"
                        color="blue"
                    />
                </motion.div>
                <motion.div variants={item}>
                    <KPICard
                        title="Discussions Ouvertes"
                        value={kpis.openDiscussions?.toString() || "0"}
                        icon="message-circle"
                        color="purple"
                    />
                </motion.div>
            </motion.div>
        );
    } else {
        return (
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <motion.div variants={item}>
                    <KPICard
                        title="Projets Actifs"
                        value={kpis.activeProjects?.toString() || "0"}
                        icon="layers"
                        color="blue"
                    />
                </motion.div>
                <motion.div variants={item}>
                    <KPICard
                        title="Total Investi"
                        value={`${kpis.totalSpent?.toLocaleString('fr-FR')} €`}
                        icon="credit-card"
                        color="green"
                    />
                </motion.div>
                <motion.div variants={item}>
                    <KPICard
                        title="Reste à payer"
                        value={`${kpis.pendingAmount?.toLocaleString('fr-FR')} €`}
                        icon="alert-circle"
                        color={kpis.pendingAmount > 0 ? "red" : "gray"}
                    />
                </motion.div>
            </motion.div>
        );
    }
}
