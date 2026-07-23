import { resolveUmkmDashboardUser } from "@/features/dashboard/data/resolve-umkm-dashboard-user";
import { UmkmSettingsPage } from "@/features/dashboard/pages/umkm-settings-page";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const [{ section }, dashboardUser] = await Promise.all([
    params,
    resolveUmkmDashboardUser(),
  ]);

  return <UmkmSettingsPage {...dashboardUser} section={section?.[0] ?? "profile"} />;
}
