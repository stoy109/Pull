"use client";

import PullMap from "@/features/dashboard/components/pull-map";
import type { PoolItem } from "./pool-patungan-page";

export function PoolMap({
  pools,
  radius,
  focusRequest,
  onSelectPool,
}: {
  pools: PoolItem[];
  radius: number;
  focusRequest: number;
  onSelectPool: (pool: PoolItem) => void;
}) {
  return (
    <PullMap
      items={pools.map((pool) => ({
        id: pool.id,
        coordinates: pool.coordinates,
        title: pool.name,
        subtitle: `${pool.location} · ${pool.memberCount} UMKM`,
        value: `Estimasi hemat ${pool.savings}%`,
      }))}
      radius={radius}
      focusRequest={focusRequest}
      onSelectItem={(id) => {
        const pool = pools.find((item) => item.id === id);
        if (pool) onSelectPool(pool);
      }}
    />
  );
}
