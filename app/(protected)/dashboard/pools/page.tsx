import { PoolsPageView } from "@/features/umkm-core/components/pools-page";
import { getPoolsWorkspace } from "@/features/umkm-core/data";
import {
  firstSearchParam,
  type PageSearchParams,
} from "@/features/umkm-core/search-params";

export default async function PoolsPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const [result, params] = await Promise.all([
    getPoolsWorkspace(),
    searchParams,
  ]);

  return (
    <PoolsPageView
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
