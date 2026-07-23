import { resolveUmkmDashboardUser } from "@/features/dashboard/data/resolve-umkm-dashboard-user";
import { UmkmActivityPage } from "@/features/dashboard/pages/umkm-activity-page";

export default async function ActivityPage() {
  const dashboardUser = await resolveUmkmDashboardUser();

  return <UmkmActivityPage {...dashboardUser} />;
}
