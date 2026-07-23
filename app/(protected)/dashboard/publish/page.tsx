import { PublishPageView } from "@/features/umkm-core/components/publish-page";
import { getPublishWorkspace } from "@/features/umkm-core/data";
import {
  firstSearchParam,
  type PageSearchParams,
} from "@/features/umkm-core/search-params";

export default async function PublishJobPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const [result, params] = await Promise.all([
    getPublishWorkspace(),
    searchParams,
  ]);

  return (
    <PublishPageView
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
