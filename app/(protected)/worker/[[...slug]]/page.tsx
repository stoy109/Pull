import { getWorkerWorkspace } from "@/features/worker-core/data";
import { parseWorkerFilters } from "@/features/worker-core/filters";
import { WorkerDashboardClient } from "./client";

type SearchValue = string | string[] | undefined;

export default async function WorkerDashboardPage({
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, SearchValue>>;
}) {
  const params = await searchParams;
  const filters = parseWorkerFilters(params);
  const workspace = await getWorkerWorkspace(filters);
  const notice = Array.isArray(params.notice) ? params.notice[0] : params.notice;

  return <WorkerDashboardClient workspace={workspace} filters={filters} notice={notice} />;
}
