import { getDashboardData } from "@/features/dashboard/data/get-dashboard-data";
import { getWorkerDashboardData } from "@/features/dashboard/data/get-role-dashboard-data";
import { WorkerDashboardClient } from "./client";

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
  fallback = "",
) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readMetadataStrings(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    : [];
}

export default async function WorkerDashboardPage() {
  const { user } = await getDashboardData(["pekerja"]);
  const dashboard = await getWorkerDashboardData(user.id);
  const metadata = user.user_metadata ?? {};

  const initialProfile = {
    name:
      readMetadataString(metadata, "display_name") ||
      readMetadataString(metadata, "full_name", "Pekerja Pull"),
    email: user.email ?? "",
    phone: readMetadataString(metadata, "phone"),
    title: readMetadataString(
      metadata,
      "headline",
      "Profil pekerjaan belum dilengkapi",
    ),
    postalCode: readMetadataString(metadata, "postal_code"),
    province: readMetadataString(metadata, "province"),
    city: readMetadataString(metadata, "city"),
    district:
      readMetadataString(metadata, "district") ||
      readMetadataString(metadata, "delivery_area"),
    village: readMetadataString(metadata, "village"),
    skills: readMetadataStrings(metadata, "skills"),
  };

  return <WorkerDashboardClient initialProfile={initialProfile} initialDashboard={dashboard} />;
}
