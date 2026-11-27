"use client";

import { RouteErrorFeedback } from "@/components/route-error-feedback";

export default function WorkerError({ retry }: { retry: () => void }) {
  return <RouteErrorFeedback title="Ruang kerja pekerja belum dapat dibuka" retry={retry} />;
}
