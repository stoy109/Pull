import { redirect } from "next/navigation";
import { getDashboardData } from "./get-dashboard-data";

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
  fallback: string,
) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readProfileCompletion(metadata: Record<string, unknown>) {
  const value = metadata.profile_completion;

  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(100, Math.max(0, Math.round(value)));
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return Math.min(100, Math.max(0, parsed));
  }

  return 84;
}

export async function resolveUmkmDashboardUser() {
  const { user } = await getDashboardData();
  const metadata = user?.user_metadata ?? {};
  const role = readMetadataString(metadata, "role", "umkm");

  if (user && role === "pekerja") {
    redirect("/worker/dashboard");
  }

  return {
    ownerName: readMetadataString(metadata, "display_name", "Sari Wulandari"),
    businessName: readMetadataString(metadata, "business_name", "Batik Laweyan Bu Sari"),
    profileCompletion: readProfileCompletion(metadata),
  };
}
