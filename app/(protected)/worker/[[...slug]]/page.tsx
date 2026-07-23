import { redirect } from "next/navigation";
import { getWorkerWorkspace, parseWorkerFilters } from "@/features/worker-core/data";
import { WorkerPageContent } from "@/features/worker-core/worker-pages";
import { WorkerShell } from "@/features/worker-core/worker-shell";
import type { WorkerPage } from "@/features/worker-core/types";

type SearchParams = Record<string, string | string[] | undefined>;

function resolvePage(slug: string[] | undefined): WorkerPage | null {
  if (!slug?.length || (slug.length === 1 && slug[0] === "dashboard")) return "dashboard";
  if (slug.length !== 1) return null;
  return (["jobs", "applications", "profile", "trust", "notifications"] as const).find((page) => page === slug[0]) ?? null;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function WorkerWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const page = resolvePage(slug);
  if (!page) redirect("/worker");

  const filters = parseWorkerFilters(query);
  const data = await getWorkerWorkspace(filters);
  const unreadCount = data.notifications.filter((notification) => !notification.readAt).length;

  return (
    <WorkerShell currentPage={page} profile={data.profile} unreadCount={unreadCount}>
      <WorkerPageContent page={page} data={data} filters={filters} notice={first(query.notice)} />
    </WorkerShell>
  );
}
