"use client";

import dynamic from "next/dynamic";

export type PullMapItem = {
  id: string;
  coordinates: [number, number];
  title: string;
  subtitle: string;
  value?: string;
};

type PullMapProps = {
  items: PullMapItem[];
  radius: number;
  focusRequest: number;
  onSelectItem: (id: string) => void;
  loadingLabel?: string;
};

const PullMapInner = dynamic(() => import("./pull-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-[620px] place-items-center bg-pull-50 text-[11px] font-extrabold text-pull-500">
      Memuat peta Solo Raya…
    </div>
  ),
});

export default function PullMap({
  items,
  radius,
  focusRequest,
  onSelectItem,
}: PullMapProps) {
  return (
    <PullMapInner
      items={items}
      radius={radius}
      focusRequest={focusRequest}
      onSelectItem={onSelectItem}
    />
  );
}
