import type { Metadata } from "next";
import { PublicUmkmProfilePage } from "@/features/umkm-profile/public-umkm-profile-page";

export const metadata: Metadata = {
  title: "Profil UMKM | Pull",
  description: "Lihat informasi usaha, reputasi, dan produk unggulan UMKM di Pull.",
};

export default async function PublicBusinessProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PublicUmkmProfilePage slug={slug} />;
}
