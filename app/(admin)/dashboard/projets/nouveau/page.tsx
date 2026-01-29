import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProjectRequestForm from "@/components/client/ProjectRequestForm";

export default async function NewProjectRequestPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    if (user.role !== "CLIENT") {
        redirect("/forbidden");
    }

    return <ProjectRequestForm userName={user.name} userEmail={user.email} userId={user.id} />;
}
