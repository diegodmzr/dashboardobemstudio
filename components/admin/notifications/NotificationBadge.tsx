"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NotificationBadge({ isCollapsed, onMobileClose }: { isCollapsed?: boolean, onMobileClose?: () => void }) {
    const [count, setCount] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await fetch("/api/notifications/count");
                if (res.ok) {
                    const data = await res.json();
                    setCount(data.count);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative">
            <Link
                href="/dashboard/notifications"
                onClick={onMobileClose}
                className={`group flex items-center gap-3 rounded-xl px-2.5 py-2 text-[14px] font-medium transition-colors ${pathname === "/dashboard/notifications"
                    ? "bg-white text-[#2f2f2f] shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:bg-[#222] dark:text-white dark:shadow-none"
                    : "text-[#8a8a8a] hover:bg-white/60 hover:text-[#4a4a4a] dark:text-gray-400 dark:hover:bg-[#222] dark:hover:text-white"
                    } ${isCollapsed ? "justify-center px-2" : ""}`}
                title="Notifications"
            >
                <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}>
                    <Bell className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                    {!isCollapsed && <span>Notifications</span>}
                </div>
            </Link>
            {count > 0 && (
                <span className={`absolute bg-[#e5464d] text-white pointer-events-none flex items-center justify-center font-semibold 
                    ${isCollapsed
                        ? "-top-1 -right-1 h-4 w-4 rounded-full text-[10px]"
                        : "right-3 top-1/2 -translate-y-1/2 h-5 min-w-[1.5rem] px-2 rounded-full text-xs"
                    }`}>
                    {count}
                </span>
            )}
        </div>
    );
}
