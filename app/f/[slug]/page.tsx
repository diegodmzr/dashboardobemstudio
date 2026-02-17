import { prisma } from "@/lib/prisma";
import PublicFormClient from "@/components/forms/PublicFormClient";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// Force dynamic rendering to ensure DB is checked on each request
export const dynamic = "force-dynamic";

export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    if (slug === "demande-de-projet") {
        const user = await getCurrentUser();
        // Special component for complex project request
        // Import dynamically to avoid circular dep issues potentially
        const PublicProjectRequestForm = (await import("@/components/client/PublicProjectRequestForm")).default;
        return <PublicProjectRequestForm currentUser={user} />;
    }

    // @ts-ignore
    const form = await prisma.form.findUnique({
        where: { slug }
    });

    if (!form || !form.isActive) return notFound();

    const user = await getCurrentUser();

    return <PublicFormClient form={form} currentUser={user} />
}
