"use client";

import dynamic from "next/dynamic";

const LeafletMapInner = dynamic(() => import("@/components/leaflet-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[392px] items-center justify-center rounded-3xl bg-primary-900/60 text-sm text-text-inverse/80">
      Loading map...
    </div>
  ),
});

export default function LeafletMap() {
  return <LeafletMapInner />;
}
