import { LoaderCircle } from "lucide-react";

export function RouteLoading({ label }: { label: string }) {
  return (
    <div className="grid min-h-64 place-items-center px-5 py-10">
      <div role="status" className="inline-flex items-center gap-3 rounded-2xl border border-[#dce7e0] bg-white px-5 py-4 text-sm font-semibold text-[#315b45] shadow-sm">
        <LoaderCircle aria-hidden="true" className="h-5 w-5 shrink-0 text-[#08783f] motion-safe:animate-spin" />
        {label}
      </div>
    </div>
  );
}
