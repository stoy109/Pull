import { requireRole } from "@/lib/auth/require-role";
import { PoolPatunganPage } from "@/features/umkm-pools/pool-patungan-page";

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

export default async function PoolsPage() {
  const { user } = await requireRole(["umkm"]);
  const metadata = user.user_metadata ?? {};

  return (
    <PoolPatunganPage
      ownerName={readMetadataString(metadata, "display_name", "Sari Wulandari")}
      businessName={readMetadataString(
        metadata,
        "business_name",
        "Dapur Sari",
      )}
      profileCompletion={readProfileCompletion(metadata)}
    />
  );
}
