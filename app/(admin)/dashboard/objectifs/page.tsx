import { Suspense } from "react";
import GoalsClient from "@/components/admin/goals/GoalsClient";

export const revalidate = 0; // No cache for real-time updates

export default function GoalsPage() {
    return (
        <div className="h-full">
            <Suspense fallback={<div className="p-8 text-gray-500">Chargement des objectifs...</div>}>
                <GoalsClient />
            </Suspense>
        </div>
    );
}
