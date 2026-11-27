"use client";

import dynamic from "next/dynamic";
import { RouteLoading } from "@/components/route-loading";
import type { WorkerFilters, WorkerWorkspace } from "@/features/worker-core/types";

const WorkerDashboard = dynamic<{
  workspace: WorkerWorkspace;
  filters: WorkerFilters;
  notice: string | undefined;
}>(() => import("@/features/worker-dashboard/App").then((module) => module.default), {
  ssr: false,
  loading: () => <RouteLoading label="Memuat ruang kerja pekerja…" />,
});

export function WorkerDashboardClient({
  workspace,
  filters,
  notice,
}: {
  workspace: WorkerWorkspace;
  filters: WorkerFilters;
  notice?: string;
}) {
  return <WorkerDashboard workspace={workspace} filters={filters} notice={notice} />;
}
