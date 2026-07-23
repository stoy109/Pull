import { ProfilePageView } from "@/features/umkm-core/components/profile-page";
import { getProfileWorkspace } from "@/features/umkm-core/data";
import {
  firstSearchParam,
  type PageSearchParams,
} from "@/features/umkm-core/search-params";

export default async function BusinessProfilePage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const [result, params] = await Promise.all([
    getProfileWorkspace(),
    searchParams,
  ]);

  return (
    <ProfilePageView
      error={result.error}
      identity={result.identity}
      notice={{
        error: firstSearchParam(params, "error"),
        success: firstSearchParam(params, "success"),
      }}
      workspace={result.data}
    />
  );
}
