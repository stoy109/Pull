"use client";

import dynamic from "next/dynamic";

type WorkerProfile = {
  name: string;
  email: string;
  title: string;
  district: string;
};

const WorkerDashboard = dynamic<{
  initialProfile: WorkerProfile;
}>(() => import("@/features/worker-dashboard/App"), { ssr: false });

export function WorkerDashboardClient({
  initialProfile,
}: {
  initialProfile: WorkerProfile;
}) {
  return <WorkerDashboard initialProfile={initialProfile} />;
}
