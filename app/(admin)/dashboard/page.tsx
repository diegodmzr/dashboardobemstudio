import Topbar from "@/components/Topbar";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return (
    <>
      <Topbar title="Accueil" userName={user?.name} userEmail={user?.email} />
      <main className="flex-1 px-8 py-6 h-[calc(100vh-80px)] overflow-hidden">
        <DashboardClient />
      </main>
    </>
  );
}
