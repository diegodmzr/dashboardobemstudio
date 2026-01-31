"use client";

import NotificationsClient from "@/components/admin/notifications/NotificationsClient";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
    return (
        <div className="flex-1 w-full bg-white dark:bg-black p-4 md:p-8">
            <NotificationsClient />
        </div>
    );
}
