"use client";

import Topbar from "@/components/Topbar";
import NotificationsClient from "@/components/admin/notifications/NotificationsClient";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
    return (
        <div className="flex h-screen flex-col overflow-hidden bg-[#f8f6fb] dark:bg-black">
            <Topbar title="Notifications" />
            <div className="flex flex-1 flex-col overflow-hidden p-6">
                <NotificationsClient />
            </div>
        </div>
    );
}
