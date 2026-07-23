import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PublicProfileError,
  PublicProfilePageView,
} from "@/features/umkm-core/components/public-profile-page";
import { getPublicUmkmProfile } from "@/features/umkm-core/data";
import {
  firstSearchParam,
  type PageSearchParams,
} from "@/features/umkm-core/search-params";

export const metadata: Metadata = {
  description: "Lihat storefront, produk, dan ulasan transaksi UMKM di Pull.",
  title: "Profil UMKM | Pull",
};

export default async function PublicBusinessProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: PageSearchParams;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const result = await getPublicUmkmProfile(slug);

  if (result.kind === "not-found") notFound();
  if (result.kind === "error") return <PublicProfileError message={result.message} />;

  return (
    <PublicProfilePageView
      contactStatus={firstSearchParam(query, "contact")}
      profile={result.profile}
    />
  );
}
