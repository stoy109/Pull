import { redirect } from "next/navigation";
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

export default async function WorkerDashboardPage() {
  const { user } = await getDashboardData();
  const metadata = user?.user_metadata ?? {};
  const role = readMetadataString(metadata, "role");

  if (user && role !== "pekerja") {
    redirect("/dashboard");
  }

  const initialProfile = {
    name:
      readMetadataString(metadata, "display_name") ||
      readMetadataString(metadata, "full_name", "Dimas Pratama"),
    email: user?.email ?? "dimas.pratama@email.com",
    title: readMetadataString(
      metadata,
      "headline",
      "Staf Toko & Pelayanan Pelanggan",
    ),
    district: readMetadataString(metadata, "delivery_area", "Banjarsari"),
  };

  return <WorkerDashboardClient initialProfile={initialProfile} />;
}
