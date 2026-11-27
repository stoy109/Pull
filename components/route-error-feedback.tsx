import { useTransition } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function RetryLoadButton({ retry }: { retry?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => (retry ? retry() : router.refresh()))}
      className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#08783f] px-5 text-xs font-extrabold text-white hover:bg-[#006a37] focus-visible:ring-4 focus-visible:ring-[#9cd0ad] disabled:opacity-70"
    >
      <RefreshCw aria-hidden="true" className={`h-4 w-4 ${isPending ? "motion-safe:animate-spin" : ""}`} />
      {isPending ? "Memuat ulang…" : "Coba lagi"}
    </button>
  );
}

export function RouteErrorFeedback({ title, retry }: { title: string; retry: () => void }) {
  return (
    <div className="grid min-h-64 place-items-center px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#dce7e0] bg-white p-6 text-center shadow-sm">
        <AlertTriangle aria-hidden="true" className="mx-auto h-6 w-6 text-[#b36417]" />
        <div role="alert">
          <h1 className="mt-4 text-lg font-extrabold text-[#19352b]">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[#52685e]">Data belum dapat dimuat. Silakan coba lagi.</p>
        </div>
        <RetryLoadButton retry={retry} />
      </div>
    </div>
  );
}
