"use client";

import { motion } from "framer-motion";

const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1, rotate: 2 }
};

const pathVariants = {
    initial: { pathLength: 1, opacity: 1 },
    hover: {
        pathLength: [1, 0.8, 1],
        opacity: [1, 0.7, 1],
        transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1 }
    }
};

export const AnimatedHome = () => (
    <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={iconVariants}
    >
        <motion.path
            d="M3 10.5 12 4l9 6.5"
            variants={{
                hover: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 1.5 } }
            }}
        />
        <motion.path
            d="M5 12.5V20h14v-7.5"
            variants={{
                hover: { scaleY: [1, 0.95, 1], originY: 1, transition: { repeat: Infinity, duration: 1.5 } }
            }}
        />
    </motion.svg>
);

export const AnimatedProjects = () => (
    <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={iconVariants}
    >
        <rect x="3.5" y="6" width="17" height="12.5" rx="2" />
        <motion.path
            d="M3.5 10.5h17"
            variants={{
                hover: { y: [0, 1, 0], transition: { repeat: Infinity, duration: 1 } }
            }}
        />
        <motion.path
            d="M9.5 6V4"
            variants={{
                hover: { height: [2, 4, 2], transition: { repeat: Infinity, duration: 1 } }
            }}
        />
    </motion.svg>
);

export const AnimatedClients = () => (
    <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={iconVariants}
    >
        <motion.circle
            cx="9" cy="7" r="4"
            variants={{
                hover: { y: [0, -1, 0], transition: { repeat: Infinity, duration: 2 } }
            }}
        />
        <motion.path
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
            variants={{
                hover: { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2 } }
            }}
        />
    </motion.svg>
);

export const AnimatedMessage = () => (
    <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={iconVariants}
    >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <motion.path
            d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
            variants={{
                hover: { d: ["m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7", "m22 6-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 6", "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"], transition: { repeat: Infinity, duration: 1 } }
            }}
        />
    </motion.svg>
);

export const AnimatedFinance = () => (
    <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={iconVariants}
    >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <motion.line
            x1="2" y1="10" x2="22" y2="10"
            variants={{
                hover: { opacity: [1, 0.5, 1], transition: { repeat: Infinity, duration: 1 } }
            }}
        />
        <motion.circle
            cx="18" cy="15" r="1"
            variants={{
                hover: { scale: [1, 1.5, 1], transition: { repeat: Infinity, duration: 1 } }
            }}
        />
    </motion.svg>
);

export const AnimatedStats = () => (
    <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={iconVariants}
    >
        <motion.path d="M12 20V10" variants={{ hover: { scaleY: [1, 1.2, 1], originY: 1, transition: { repeat: Infinity, duration: 1 } } }} />
        <motion.path d="M18 20V4" variants={{ hover: { scaleY: [1, 1.1, 1], originY: 1, transition: { repeat: Infinity, duration: 1.2, delay: 0.1 } } }} />
        <motion.path d="M6 20v-4" variants={{ hover: { scaleY: [1, 1.3, 1], originY: 1, transition: { repeat: Infinity, duration: 0.8, delay: 0.2 } } }} />
    </motion.svg>
);

export const AnimatedSettings = () => (
    <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={iconVariants}
    >
        <circle cx="12" cy="12" r="3" />
        <motion.path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            variants={{
                hover: { rotate: 90, transition: { duration: 2, repeat: Infinity, ease: "linear" } }
            }}
        />
    </motion.svg>
);

export const AnimatedBell = () => (
    <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={iconVariants}
    >
        <motion.path
            d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
            variants={{
                hover: { rotate: [-5, 5, -5], transition: { repeat: Infinity, duration: 0.5 }, originX: "12px", originY: "4px" }
            }}
        />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </motion.svg>
);

export const AnimatedForms = () => (
    <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={iconVariants}
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <motion.path
            d="M14 2v6h6"
            variants={{
                hover: { x: [0, 1, 0], y: [0, -1, 0], transition: { repeat: Infinity, duration: 1 } }
            }}
        />
        <motion.path d="M16 13H8" variants={{ hover: { opacity: [1, 0.4, 1], transition: { repeat: Infinity, duration: 1 } } }} />
        <motion.path d="M16 17H8" variants={{ hover: { opacity: [1, 0.4, 1], transition: { repeat: Infinity, duration: 1, delay: 0.2 } } }} />
    </motion.svg>
);

export const AnimatedGoals = () => (
    <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={iconVariants}
    >
        <circle cx="12" cy="12" r="10" />
        <motion.circle
            cx="12" cy="12" r="6"
            variants={{
                hover: { scale: [1, 1.2, 1], transition: { repeat: Infinity, duration: 1.5 } }
            }}
        />
        <motion.circle
            cx="12" cy="12" r="2"
            variants={{
                hover: { fill: ["none", "currentColor", "none"], transition: { repeat: Infinity, duration: 1.5 } }
            }}
        />
    </motion.svg>
);

export const AnimatedUsers = () => (
    <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={iconVariants}
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <motion.path
            d="M22 21v-2a4 4 0 0 0-3-3.87"
            variants={{
                hover: { x: [0, 1, 0], transition: { repeat: Infinity, duration: 1 } }
            }}
        />
        <motion.path
            d="M16 3.13a4 4 0 0 1 0 7.75"
            variants={{
                hover: { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1 } }
            }}
        />
    </motion.svg>
);
