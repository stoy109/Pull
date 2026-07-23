import { resolveUmkmDashboardUser } from "@/features/dashboard/data/resolve-umkm-dashboard-user";
import { getUmkmDashboardData } from "@/features/dashboard/data/get-role-dashboard-data";
import { UmkmActivityPage } from "@/features/dashboard/pages/umkm-activity-page";

export default async function ActivityPage() {
  const dashboardUser = await resolveUmkmDashboardUser();
  const dashboard = await getUmkmDashboardData(dashboardUser.userId);

  return <UmkmActivityPage ownerName={dashboardUser.ownerName} businessName={dashboardUser.businessName} profileCompletion={dashboardUser.profileCompletion} activities={dashboard.activities} />;
}
