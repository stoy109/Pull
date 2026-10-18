import type { Metadata } from "next";
import { getUmkmNotifications } from "@/features/dashboard/data/get-umkm-notifications";
import { resolveUmkmDashboardUser } from "@/features/dashboard/data/resolve-umkm-dashboard-user";
import { UmkmNotificationsPage } from "@/features/dashboard/pages/umkm-notifications-page";

export const metadata: Metadata = {
  title: "Notifikasi | Pull",
  description: "Kotak masuk notifikasi usaha: lamaran masuk, pool patungan, dan pembaruan sistem.",
};

export default async function UmkmNotificationsRoute({
  searchParams,
}: {
  searchParams: Promise<{ result?: string | string[] }>;
}) {
  const [dashboardUser, params, notificationResult] = await Promise.all([
    resolveUmkmDashboardUser(),
    searchParams,
    getUmkmNotifications(100),
  ]);

  const result = Array.isArray(params.result) ? params.result[0] : params.result;

  return (
    <UmkmNotificationsPage
      ownerName={dashboardUser.ownerName}
      businessName={dashboardUser.businessName}
      profileCompletion={dashboardUser.profileCompletion}
      notifications={notificationResult.notifications}
      status={notificationResult.status}
      result={result}
    />
  );
}
