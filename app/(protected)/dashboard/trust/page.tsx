import { resolveUmkmDashboardUser } from "@/features/dashboard/data/resolve-umkm-dashboard-user";
import { UmkmTrustScorePage } from "@/features/dashboard/pages/umkm-trust-score-page";

export default async function TrustScorePage() {
  const dashboardUser = await resolveUmkmDashboardUser();

  return <UmkmTrustScorePage {...dashboardUser} />;
}
