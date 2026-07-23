"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#cddbd4] bg-white px-4 text-xs font-extrabold text-[#315b4c] transition hover:bg-[#f4f8f5] disabled:cursor-wait disabled:opacity-60"
    >
      <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Memperbarui" : "Perbarui"}
    </button>
  );
}
