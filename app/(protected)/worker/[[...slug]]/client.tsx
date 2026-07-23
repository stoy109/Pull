"use client";

import dynamic from "next/dynamic";
import type { WorkerDashboardData } from "@/features/dashboard/data/get-role-dashboard-data";

type WorkerProfile = {
  name: string;
  email: string;
  phone: string;
  title: string;
  postalCode: string;
  province: string;
  city: string;
  district: string;
  village: string;
  skills: string[];
};

const WorkerDashboard = dynamic<{
  initialProfile: WorkerProfile;
  initialDashboard: WorkerDashboardData;
}>(() => import("@/features/worker-dashboard/App"), { ssr: false });

export function WorkerDashboardClient({
  initialProfile,
  initialDashboard,
}: {
  initialProfile: WorkerProfile;
  initialDashboard: WorkerDashboardData;
}) {
  return <WorkerDashboard initialProfile={initialProfile} initialDashboard={initialDashboard} />;
}
