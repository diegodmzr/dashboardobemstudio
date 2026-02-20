import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PartnersAdminClient from "@/components/admin/partners/PartnersAdminClient";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/forbidden");
    }

    return (
        <main className="flex-1 px-4 md:px-8 py-6 bg-[#f8f6fb] dark:bg-black min-h-[calc(100vh-80px)]">
            <PartnersAdminClient />
        </main>
    );
}
