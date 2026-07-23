import { getDashboardData } from "@/features/dashboard/data/get-dashboard-data";
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
  const metadata = user.user_metadata ?? {};

  const initialProfile = {
    name:
      readMetadataString(metadata, "display_name") ||
      readMetadataString(metadata, "full_name", "Dimas Pratama"),
    email: user.email ?? "dimas.pratama@email.com",
    phone: readMetadataString(metadata, "phone", "+6281234564821"),
    title: readMetadataString(
      metadata,
      "headline",
      "Staf Toko & Pelayanan Pelanggan",
    ),
    postalCode: readMetadataString(metadata, "postal_code"),
    province: readMetadataString(metadata, "province"),
    city: readMetadataString(metadata, "city"),
    district:
      readMetadataString(metadata, "district") ||
      readMetadataString(metadata, "delivery_area", "Banjarsari"),
    village: readMetadataString(metadata, "village"),
    skills: readMetadataStrings(metadata, "skills"),
  };

  return <WorkerDashboardClient initialProfile={initialProfile} />;
}
