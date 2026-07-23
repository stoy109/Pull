import { JobsPageView } from "@/features/umkm-core/components/jobs-page";
import { getJobsWorkspace } from "@/features/umkm-core/data";
import {
  firstSearchParam,
  type PageSearchParams,
} from "@/features/umkm-core/search-params";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const [result, params] = await Promise.all([
    getJobsWorkspace(),
    searchParams,
  ]);

  return (
    <JobsPageView
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
