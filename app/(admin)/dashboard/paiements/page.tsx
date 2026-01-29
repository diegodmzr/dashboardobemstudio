import Topbar from "@/components/Topbar";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminPaiementsPage() {
  const user = await getCurrentUser();
  return (
    <>
      <Topbar title="Paiements" userName={user?.name} userEmail={user?.email} />
      <main className="flex-1 px-8 py-6">
        <div className="rounded-2xl border border-dashed border-[#e5e1e8] bg-[#faf8fb] px-6 py-10 text-[#6b6570]">
          Espace admin - paiements (placeholder).
        </div>
      </main>
    </>
  );
}
