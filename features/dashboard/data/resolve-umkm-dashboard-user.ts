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

  const completedFields = [
    metadata.display_name ?? metadata.full_name,
    metadata.business_name,
    metadata.headline,
    metadata.phone,
  ].filter((field) => typeof field === "string" && field.trim()).length;

  return completedFields * 25;
}

export async function resolveUmkmDashboardUser() {
  const { user } = await getDashboardData(["umkm"]);
  const metadata = user.user_metadata ?? {};

  return {
    userId: user.id,
    ownerName: readMetadataString(metadata, "display_name", "Pemilik UMKM"),
    businessName: readMetadataString(metadata, "business_name", "UMKM Pull"),
    profileCompletion: readProfileCompletion(metadata),
  };
}
