import { redirect } from "next/navigation";
import { getDashboardData } from "@/features/dashboard/data/get-dashboard-data";
import { PoolPatunganPage } from "@/features/umkm-pools/pool-patungan-page";

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
  fallback: string,
) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

export default async function PoolsPage() {
  const { user } = await getDashboardData();
  const metadata = user?.user_metadata ?? {};
  const role = readMetadataString(metadata, "role", "umkm");

  if (user && role === "pekerja") {
    redirect("/worker/dashboard");
  }

  return (
    <PoolPatunganPage
      ownerName={readMetadataString(metadata, "display_name", "Bu Sari")}
      businessName={readMetadataString(
        metadata,
        "business_name",
        "Batik Laweyan",
      )}
    />
  );
}
