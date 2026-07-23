"use client";

import { useMemo, useState } from "react";
import PullMap from "@/features/dashboard/components/pull-map";
import type { WorkerJob } from "./types";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function WorkerJobMap({ jobs, radiusKm }: { jobs: WorkerJob[]; radiusKm: number }) {
  const [focusRequest, setFocusRequest] = useState(0);
  const items = useMemo(
    () => jobs
      .filter((job) => job.latitude !== null && job.longitude !== null)
      .map((job) => ({
        id: job.id,
        coordinates: [job.latitude!, job.longitude!] as [number, number],
        title: job.title,
        subtitle: `${job.ownerName || "UMKM Pull"} · ${job.district || "Wilayah belum diisi"}`,
        value: job.wageAmount === null ? "Upah belum dicantumkan" : currencyFormatter.format(job.wageAmount),
      })),
    [jobs],
  );

  if (!items.length) {
    return (
      <section className="mt-5 rounded-[18px] border border-[#dce7e0] bg-white px-5 py-6 text-center shadow-[0_8px_28px_rgba(18,59,48,.035)]">
        <h2 className="text-xs font-extrabold text-[#315b45]">Peta belum punya pin</h2>
        <p className="mt-2 text-[10px] font-medium leading-5 text-[#71857a]">Koordinat UMKM belum tersimpan. Pull tidak menampilkan lokasi perkiraan atau data dummy.</p>
      </section>
    );
  }

  return (
    <section className="mt-5 overflow-hidden rounded-[18px] border border-[#dce7e0] bg-white shadow-[0_8px_28px_rgba(18,59,48,.035)]">
      <header className="flex items-center justify-between gap-4 border-b border-[#e2ebe5] px-5 py-4">
        <div>
          <h2 className="text-xs font-extrabold text-[#315b45]">Peta lowongan nyata</h2>
          <p className="mt-1 text-[9px] font-medium text-[#71857a]">{items.length} pin dari koordinat profil UMKM · radius {radiusKm} km</p>
        </div>
        <button type="button" onClick={() => setFocusRequest((value) => value + 1)} className="shrink-0 rounded-xl border border-[#bddac7] px-3 py-2 text-[9px] font-extrabold text-[#08783f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08783f]">Fokus lokasi</button>
      </header>
      <div className="min-h-[520px]">
        <PullMap
          items={items}
          radius={radiusKm}
          focusRequest={focusRequest}
          onSelectItem={(id) => {
            document.getElementById(`worker-job-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        />
      </div>
    </section>
  );
}
