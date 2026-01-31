"use client";

import { motion } from "framer-motion";

export function AnimatedLoginBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
            {/* Halo 1 */}
            <motion.div
                animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -50, 100, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -top-[10%] -left-[10%] h-[60%] w-[60%] rounded-full bg-white/10 blur-[120px]"
            />

            {/* Halo 2 */}
            <motion.div
                animate={{
                    x: [0, -120, 80, 0],
                    y: [0, 100, -80, 0],
                    scale: [1, 0.8, 1.1, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-zinc-600/10 blur-[100px]"
            />

            {/* Halo 3 */}
            <motion.div
                animate={{
                    x: [0, 80, -100, 0],
                    y: [0, 150, -50, 0],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -bottom-[10%] left-[20%] h-[55%] w-[55%] rounded-full bg-white/5 blur-[110px]"
            />
        </div>
    );
}
