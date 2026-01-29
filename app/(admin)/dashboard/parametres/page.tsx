import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsMain from "@/components/settings/SettingsMain";
import Topbar from "@/components/Topbar";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
        redirect("/login");
    }

    // Fetch full user data from DB to get new fields (firstName, etc.)
    const user = await prisma.user.findUnique({
        where: { id: sessionUser.id },
    });

    if (!user) {
        return <div>Erreur de chargement du profil</div>;
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-[#f3f4f6] dark:bg-black">
            <Topbar title="Paramètres" />

            <main className="flex flex-1 flex-col overflow-y-auto p-8">
                <SettingsMain user={user} />
            </main>
        </div>
    );
}
