import FormsClient from "@/components/admin/forms/FormsClient";
import Topbar from "@/components/Topbar";

export const dynamic = "force-dynamic";

export default function FormsPage() {
    return (
        <div className="flex h-screen flex-col overflow-hidden bg-[#f8f6fb] dark:bg-black">
            <Topbar title="Formulaires" />
            <div className="flex flex-1 flex-col overflow-hidden p-6">
                <FormsClient />
            </div>
        </div>
    );
}
