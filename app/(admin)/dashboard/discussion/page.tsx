import DiscussionClient from "@/components/admin/discussion/DiscussionClient";
import Topbar from "@/components/Topbar";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DiscussionPage() {
    const user = await getCurrentUser();

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-[#f8f6fb] dark:bg-black">
            <Topbar title="Discussions" />
            <div className="flex flex-1 flex-col overflow-hidden p-6">
                <DiscussionClient currentUserId={user?.id || ""} />
            </div>
        </div>
    );
}
