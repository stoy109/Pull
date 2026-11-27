"use client";

import { RouteErrorFeedback } from "@/components/route-error-feedback";

export default function DashboardError({ retry }: { retry: () => void }) {
  return <RouteErrorFeedback title="Dashboard UMKM belum dapat dibuka" retry={retry} />;
}
