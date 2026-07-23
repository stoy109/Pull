"use client";

import { useMemo, useState } from "react";
import PullMap from "@/features/dashboard/components/pull-map";
import type { Pool } from "../types";

export function PersistedPoolMap({ pools }: { pools: Pool[] }) {
  const [selectedId, setSelectedId] = useState("");
  const items = useMemo(() => pools
    .filter((pool) => pool.latitude !== null && pool.longitude !== null)
    .map((pool) => ({
      id: pool.id,
      coordinates: [pool.latitude!, pool.longitude!] as [number, number],
      title: pool.itemName,
      subtitle: `${pool.district} · ${pool.currentQuantity}/${pool.targetQuantity} ${pool.unit}`,
      value: pool.hub ? `Hub ${pool.hub}` : "Hub belum ditentukan",
    })), [pools]);

  if (!items.length) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-[22px] border border-[#dce7e1] bg-white shadow-sm">
      <div className="border-b border-[#e3ebe6] px-5 py-4">
        <h2 className="text-sm font-extrabold text-[#17362a]">Peta pool aktif</h2>
        <p className="mt-1 text-[10px] font-medium text-[#718078]">Pin berasal dari koordinat pool yang tersimpan. Pilih pin untuk melihat lokasinya.</p>
      </div>
      <div className="min-h-[420px]">
        <PullMap items={items} radius={50} focusRequest={selectedId ? 1 : 0} onSelectItem={setSelectedId} />
      </div>
    </section>
  );
}
