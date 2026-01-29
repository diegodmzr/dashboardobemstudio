import StatsClient from "@/components/admin/stats/StatsClient";

export const revalidate = 300; // Cache for 5 minutes

export default async function AdminStatsPage() {
    return <StatsClient />;
}
