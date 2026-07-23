import { AdminShell } from "@/features/admin/components/admin-shell";
import { getAdminMonitoring } from "@/features/admin/data/get-admin-monitoring";
import { AdminMonitoringPage } from "@/features/admin/pages/admin-monitoring-page";
import { normalizeMonitoringFilters } from "@/lib/activity/monitoring";
import { requireRole } from "@/lib/auth/access";

export default async function AdminPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    range?: string | string[];
    role?: string | string[];
  }>;
}>) {
  const [, rawFilters] = await Promise.all([
    requireRole(["admin"]),
    searchParams,
  ]);
  const filters = normalizeMonitoringFilters(rawFilters);
  const data = await getAdminMonitoring(filters);

  return (
    <AdminShell activePath="/admin">
      <AdminMonitoringPage data={data} filters={filters} />
    </AdminShell>
  );
}
