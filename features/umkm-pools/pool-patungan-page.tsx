"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Clock3,
  FlaskConical,
  LayoutList,
  LocateFixed,
  Map,
  MapPin,
  MoreHorizontal,
  PackageOpen,
  Plus,
  Search,
  Share2,
  ShoppingBag,
  TrendingUp,
  UsersRound,
  X,
} from "lucide-react";
import { UmkmDashboardShell } from "@/features/dashboard/components/umkm-dashboard-shell";
import {
  createPoolAction as recordPoolCreation,
  joinPoolAction as recordPoolJoin,
} from "@/features/activity/actions";
import { calculatePoolOrder } from "./pool-calculations";
import { PoolMap } from "./pool-map";
import {
  POOL_STATUS_LABELS,
  resolvePoolStatus,
  type PoolStatus,
} from "./pool-status";

type ViewMode = "list" | "map";
type ActiveModal = "create" | "detail" | null;

export type PoolItem = {
  id: string;
  name: string;
  category: string;
  current: number;
  target: number;
  unit: string;
  percentage: number;
  memberCount: number;
  location: string;
  district: string;
  deadline: string;
  deadlineAt: string;
  status: PoolStatus;
  description: string;
  icon: "fabric" | "dye" | "package";
  iconTone: string;
  iconColor: string;
  coordinates: [number, number];
  unitPrice: number;
  maximumSupplierDiscount: number;
};

type Filters = {
  search: string;
  category: string;
  district: string;
};

function futureDeadline(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

const INITIAL_POOLS: PoolItem[] = [
  {
    id: "pool-1",
    name: "Kain Katun Combed 30s",
    category: "Tekstil & Kain",
    current: 350,
    target: 500,
    unit: "kg",
    percentage: 70,
    memberCount: 8,
    location: "Laweyan, Solo",
    district: "Laweyan",
    deadline: "3 hari lagi",
    deadlineAt: futureDeadline(3),
    status: "waiting",
    description: "Kain katun combed 30s untuk kebutuhan produksi garmen dan batik.",
    icon: "fabric",
    iconTone: "bg-[#e1f1e4] text-[#08783f]",
    iconColor: "#08783f",
    coordinates: [-7.5662, 110.7974],
    unitPrice: 37500,
    maximumSupplierDiscount: 22,
  },
  {
    id: "pool-2",
    name: "Pewarna Batik Sintetis",
    category: "Bahan Kerajinan",
    current: 120,
    target: 200,
    unit: "kg",
    percentage: 60,
    memberCount: 5,
    location: "Pasar Kliwon, Solo",
    district: "Pasar Kliwon",
    deadline: "5 hari lagi",
    deadlineAt: futureDeadline(5),
    status: "waiting",
    description: "Pewarna sintetis konsentrat untuk kebutuhan produksi batik skala UMKM.",
    icon: "dye",
    iconTone: "bg-[#fff0df] text-[#df710e]",
    iconColor: "#ee8615",
    coordinates: [-7.5831, 110.8311],
    unitPrice: 68000,
    maximumSupplierDiscount: 18,
  },
  {
    id: "pool-3",
    name: "Kemasan Plastik Standing Pouch",
    category: "Kemasan",
    current: 8000,
    target: 10000,
    unit: "pcs",
    percentage: 80,
    memberCount: 12,
    location: "Serengan, Solo",
    district: "Serengan",
    deadline: "1 hari lagi",
    deadlineAt: futureDeadline(1),
    status: "waiting",
    description: "Kemasan standing pouch transparan untuk makanan kering dan produk rumahan.",
    icon: "package",
    iconTone: "bg-[#eee9fb] text-[#7057b8]",
    iconColor: "#775bc1",
    coordinates: [-7.575, 110.8167],
    unitPrice: 1850,
    maximumSupplierDiscount: 28,
  },
];

const CATEGORY_OPTIONS = [
  "Semua kategori",
  "Tekstil & Kain",
  "Bahan Kerajinan",
  "Kemasan",
  "Bahan Pangan",
];
const DISTRICT_OPTIONS = ["Semua kecamatan", "Laweyan", "Pasar Kliwon", "Serengan"];
const USER_POSITION: [number, number] = [-7.5666, 110.8167];

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDeadlineDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function distanceKm(first: [number, number], second: [number, number]) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(second[0] - first[0]);
  const longitudeDelta = toRadians(second[1] - first[1]);
  const firstLatitude = toRadians(first[0]);
  const secondLatitude = toRadians(second[0]);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function PoolIcon({ pool, small = false }: { pool: PoolItem; small?: boolean }) {
  const Icon = pool.icon === "dye" ? FlaskConical : pool.icon === "package" ? ShoppingBag : PackageOpen;
  return (
    <span className={`grid shrink-0 place-items-center rounded-full ${small ? "h-10 w-10" : "h-14 w-14"} ${pool.iconTone}`}>
      <Icon className={small ? "h-5 w-5" : "h-7 w-7"} strokeWidth={1.9} />
    </span>
  );
}

function PoolStatusBadge({ status }: { status: PoolStatus }) {
  const tone = status === "successful"
    ? "bg-[#e4f4e8] text-[#08783f]"
    : status === "cancelled"
      ? "bg-[#fde8e6] text-[#b63b32]"
      : "bg-[#fff3db] text-[#a7600b]";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-extrabold ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {POOL_STATUS_LABELS[status]}
    </span>
  );
}

function FilterBar({ filters, setFilters, viewMode, setViewMode, onCreate }: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onCreate: () => void;
}) {
  return (
    <section className="rounded-[24px] border border-[#dfe8e1] bg-white p-4 shadow-[0_10px_35px_rgba(18,59,48,.035)] sm:p-5">
      <label className="flex h-14 items-center gap-3 rounded-[16px] border border-[#dfe5e1] bg-white px-4 text-[#5c8f70] transition focus-within:border-[#71a987] focus-within:ring-4 focus-within:ring-[#e7f3eb]">
        <Search className="h-5 w-5 shrink-0" />
        <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} type="search" className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#31423b] outline-none placeholder:text-[#6d9b7e]" placeholder="Cari bahan baku, UMKM, atau lokasi..." />
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex h-[52px] min-w-0 flex-col justify-center rounded-[15px] border border-[#dfe5e1] bg-white px-3.5 py-1.5 transition hover:border-[#b9cfc1] focus-within:border-[#71a987]">
          <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[#5c8f70]">Kategori</span>
          <span className="relative mt-0.5 flex min-w-0 items-center">
            <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} className="w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent pr-7 text-sm font-medium leading-5 text-[#17392c] outline-none" aria-label="Kategori Bahan">
              {CATEGORY_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-[#38694e]" />
          </span>
        </label>
        <label className="flex h-[52px] min-w-0 flex-col justify-center rounded-[15px] border border-[#dfe5e1] bg-white px-3.5 py-1.5 transition hover:border-[#b9cfc1] focus-within:border-[#71a987]">
          <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[#5c8f70]">Kecamatan</span>
          <span className="relative mt-0.5 flex min-w-0 items-center">
            <select value={filters.district} onChange={(event) => setFilters({ ...filters, district: event.target.value })} className="w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent pr-7 text-sm font-medium leading-5 text-[#17392c] outline-none" aria-label="Kecamatan">
              {DISTRICT_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-[#38694e]" />
          </span>
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex h-[52px] w-full rounded-[15px] border border-[#dfe5e1] bg-white p-1 sm:w-[252px]">
          <button type="button" onClick={() => setViewMode("list")} className={`flex min-w-[122px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm font-semibold leading-none transition ${viewMode === "list" ? "bg-[#08783f] text-white shadow-sm" : "text-[#38694e] hover:bg-[#f0f5f1]"}`}><LayoutList className="h-4 w-4 shrink-0" /><span className="whitespace-nowrap">List View</span></button>
          <button type="button" onClick={() => setViewMode("map")} className={`flex min-w-[112px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm font-semibold leading-none transition ${viewMode === "map" ? "bg-[#08783f] text-white shadow-sm" : "text-[#38694e] hover:bg-[#f0f5f1]"}`}><Map className="h-4 w-4 shrink-0" /><span className="whitespace-nowrap">Map</span></button>
        </div>
        <button type="button" onClick={onCreate} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#08783f] px-5 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(8,120,63,.18)] transition hover:bg-[#066b36]">Buat Pool <Plus className="h-4 w-4" /></button>
      </div>
    </section>
  );
}

function PoolCard({ pool, joined, onOpen }: { pool: PoolItem; joined: boolean; onOpen: () => void }) {
  const actionLabel = pool.status === "successful"
    ? "Pool Berhasil"
    : pool.status === "cancelled"
      ? "Pool Dibatalkan"
      : joined
        ? "Sudah Bergabung"
        : "Gabung Pool";
  const actionTone = pool.status === "cancelled"
    ? "bg-[#f9e8e6] text-[#b63b32]"
    : pool.status === "successful" || joined
      ? "bg-[#e5f3e9] text-[#08783f] group-hover:bg-[#dceee2]"
      : "bg-[#08783f] text-white group-hover:bg-[#066b36]";

  return (
    <button type="button" onClick={onOpen} className="group flex min-h-[328px] w-full flex-col rounded-xl border border-[#dfe5e1] bg-white p-5 text-left shadow-[0_5px_18px_rgba(18,59,48,.03)] transition hover:-translate-y-0.5 hover:border-[#9ac4aa] hover:shadow-[0_12px_28px_rgba(18,59,48,.08)]">
      <div className="flex items-start gap-3.5">
        <PoolIcon pool={pool} />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[15px] font-extrabold leading-5 text-[#10231d]">{pool.name}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2"><span className="inline-flex rounded bg-[#f1f3f2] px-2 py-1 text-[9px] font-bold text-[#46534d]">{pool.category}</span><PoolStatusBadge status={pool.status} /></div>
        </div>
      </div>
      <div className="mt-7">
        <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-[#34463e]"><span><strong>{formatNumber(pool.current)}{pool.unit}</strong> / {formatNumber(pool.target)}{pool.unit} target</span><strong className="text-[#10231d]">{pool.percentage}%</strong></div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e8ecea]"><div className="h-full rounded-full bg-[#08783f] transition-all" style={{ width: `${pool.percentage}%` }} /></div>
      </div>
      <div className="mt-4 rounded-lg bg-[linear-gradient(90deg,#f0f7e9,#f5f9ef)] px-3 py-2.5 text-[#1c663a]">
        <div className="flex items-center justify-between gap-3 text-[9px] font-bold"><span>Harga normal supplier</span><strong className="text-[11px]">{formatCurrency(pool.unitPrice)}/{pool.unit}</strong></div>
        <p className="mt-1 flex items-center gap-1.5 text-[9px] font-extrabold"><TrendingUp className="h-3.5 w-3.5" /> Diskon maks. {pool.maximumSupplierDiscount}%</p>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-[9px] font-semibold leading-4 text-[#53625b]">
        <span className="flex items-start gap-1.5"><UsersRound className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {pool.memberCount} UMKM bergabung</span>
        <span className="flex items-start gap-1.5"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {pool.location}</span>
        <span className="flex items-start gap-1.5"><Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {pool.deadline}</span>
      </div>
      <span className={`mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg text-xs font-extrabold transition ${actionTone}`}>
        {(joined || pool.status === "successful") && pool.status !== "cancelled" ? <Check className="h-4 w-4" /> : null}{actionLabel}
      </span>
    </button>
  );
}

function MapPoolCard({ pool, onDetail }: { pool: PoolItem; onDetail: () => void }) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-[500] max-w-xl rounded-[20px] border border-pull-100 bg-white/95 p-4 shadow-[0_18px_45px_rgba(12,38,28,.18)] backdrop-blur-md">
      <div className="flex items-start gap-3">
        <PoolIcon pool={pool} small />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-extrabold text-pull-950">{pool.name}</p>
          <p className="mt-1 flex items-center gap-1 text-[9px] font-bold text-pull-500">
            <MapPin className="h-3 w-3" /> {pool.location} · {pool.memberCount} UMKM
          </p>
        </div>
        <button type="button" onClick={onDetail} className="grid h-9 w-9 place-items-center rounded-xl border border-pull-100 bg-white text-pull-600 transition hover:bg-pull-50" aria-label={`Buka detail ${pool.name}`}>
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-pull-600"><span>{formatNumber(pool.current)}{pool.unit} / {formatNumber(pool.target)}{pool.unit}</span><span>{pool.percentage}%</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-pull-100"><div className="h-full rounded-full bg-[#08783f]" style={{ width: `${pool.percentage}%` }} /></div>
          <p className="mt-2 text-xs font-extrabold text-[#08783f]">Harga normal {formatCurrency(pool.unitPrice)}/{pool.unit}</p>
          <p className="mt-1 text-[9px] font-bold text-[#5d7466]">Diskon maks. supplier {pool.maximumSupplierDiscount}%</p>
        </div>
        <button type="button" onClick={onDetail} className="h-10 rounded-xl bg-[#08783f] px-4 text-[10px] font-extrabold text-white transition hover:bg-[#066b36]">Lihat detail</button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="grid min-h-[420px] place-items-center rounded-xl border border-[#dfe5e1] bg-white px-6 py-12 text-center">
      <div>
        <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#eff5ed] text-[#6aa379]">
          <PackageOpen className="h-12 w-12" strokeWidth={1.5} />
          <span className="absolute right-2 top-1 text-[#a7c840]">✦</span>
        </div>
        <h2 className="mt-5 text-lg font-extrabold text-[#10231d]">Belum ada pool aktif di kategori ini</h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-[#6b7280]">Coba ubah filter atau buat pool baru untuk bahan baku yang Anda butuhkan.</p>
      </div>
    </section>
  );
}

function CreatePoolModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (pool: PoolItem) => void }) {
  const [description, setDescription] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [unit, setUnit] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const target = Number(form.get("target_volume"));
    const unitValue = String(form.get("satuan"));
    const category = String(form.get("kategori"));
    const unitPrice = Number(String(form.get("normal_unit_price")).replace(/\D/g, ""));
    const maximumSupplierDiscount = Number(form.get("maximum_supplier_discount"));
    const deadlineValue = String(form.get("deadline"));
    const deadlineAt = `${deadlineValue}T23:59:59+07:00`;
    onSubmit({
      id: crypto.randomUUID(),
      name: String(form.get("nama_bahan")),
      category,
      current: 0,
      target,
      unit: unitValue,
      percentage: 0,
      memberCount: 1,
      location: "Laweyan, Solo",
      district: "Laweyan",
      deadline: formatDeadlineDate(deadlineAt),
      deadlineAt,
      status: resolvePoolStatus({ currentQuantity: 0, targetQuantity: target, deadlineAt }),
      description: description || "Pool bahan baku baru dari komunitas UMKM Pull.",
      icon: category === "Kemasan" ? "package" : category === "Bahan Kerajinan" ? "dye" : "fabric",
      iconTone: "bg-[#e1f1e4] text-[#08783f]",
      iconColor: "#08783f",
      coordinates: [-7.569, 110.805],
      unitPrice,
      maximumSupplierDiscount,
    });
  }

  function updateEstimatedPrice(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    setEstimatedPrice(digits ? formatNumber(Number(digits)) : "");
  }

  return (
    <ModalFrame title="Buat Pool Baru" onClose={onClose} width="max-w-[760px]">
      <form onSubmit={submit}>
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <Field label="Nama Bahan Baku *"><input name="nama_bahan" required placeholder="Contoh: Kain Katun Combed 30s" className="pool-input" /></Field>
          <Field label="Kategori *"><select name="kategori" required className="pool-input"><option value="">Pilih kategori</option>{CATEGORY_OPTIONS.slice(1).map((option) => <option key={option}>{option}</option>)}</select></Field>
          <Field label="Harga Normal Supplier per satuan *">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-extrabold text-[#52635a]">Rp</span>
              <input name="normal_unit_price" value={estimatedPrice} onChange={(event) => updateEstimatedPrice(event.target.value)} inputMode="numeric" pattern="[0-9.]+" required placeholder="Contoh: 10.000" className="pool-input pool-currency-input" />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] font-bold text-[#7b8781]">/ {unit || "satuan"}</span>
            </div>
          </Field>
          <Field label="Diskon Maksimum Supplier *"><div className="relative"><input name="maximum_supplier_discount" type="number" min="0" max="100" step="0.1" required placeholder="Contoh: 10" className="pool-input pool-percentage-input" /><span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-extrabold text-[#52635a]">%</span></div></Field>
          <Field label="Target Volume *"><input name="target_volume" type="number" min="1" required placeholder="Masukkan jumlah target" className="pool-input" /></Field>
          <Field label="Satuan *"><select name="satuan" value={unit} onChange={(event) => setUnit(event.target.value)} required className="pool-input"><option value="">Pilih satuan</option><option>kg</option><option>pcs</option><option>liter</option><option>meter</option></select></Field>
          <Field label="Batas Waktu Pool *" full><input name="deadline" type="date" required className="pool-input" /></Field>
          <Field label="Deskripsi (opsional)" full>
            <div className="relative"><textarea value={description} onChange={(event) => setDescription(event.target.value.slice(0, 200))} placeholder="Jelaskan detail bahan baku, spesifikasi, atau catatan lainnya..." className="pool-input min-h-28 resize-none py-3" /><span className="absolute bottom-3 right-3 text-[9px] font-semibold text-[#7b8781]">{description.length}/200</span></div>
          </Field>
        </div>
        <div className="flex items-center justify-between border-t border-[#e5e7eb] px-6 py-4">
          <button type="button" onClick={onClose} className="h-11 rounded-lg border border-[#aeb8b3] px-6 text-xs font-extrabold text-[#425149] transition hover:bg-[#f5f7f6]">Batal</button>
          <button type="submit" className="h-11 rounded-lg bg-[#08783f] px-7 text-xs font-extrabold text-white transition hover:bg-[#066b36]">Buat Pool</button>
        </div>
      </form>
    </ModalFrame>
  );
}

function Field({ label, full = false, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return <label className={full ? "sm:col-span-2" : ""}><span className="mb-2 block text-[11px] font-extrabold text-[#27372f]">{label}</span>{children}</label>;
}

function ModalFrame({ title, onClose, width, children }: { title: string; onClose: () => void; width: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[#071d15]/45 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="pool-modal-title" onMouseDown={(event) => event.stopPropagation()} className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl border border-[#dfe5e1] bg-white shadow-[0_30px_90px_rgba(7,29,21,.28)] ${width}`}>
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e7eb] bg-white px-6 py-5">
          <h2 id="pool-modal-title" className="text-lg font-extrabold text-[#10231d]">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-[#2c3d35] transition hover:bg-[#f0f4f1]" aria-label="Tutup modal"><X className="h-5 w-5" /></button>
        </header>
        {children}
      </section>
    </div>
  );
}

function DetailModal({
  pool,
  joined,
  joinedQuantity,
  onClose,
  onJoin,
  onShare,
}: {
  pool: PoolItem;
  joined: boolean;
  joinedQuantity: number;
  onClose: () => void;
  onJoin: (quantity: number) => void;
  onShare: () => void;
}) {
  const remainingQuantity = Math.max(0, pool.target - pool.current);
  const maximumQuantity = joined ? joinedQuantity : remainingQuantity;
  const [quantityInput, setQuantityInput] = useState(joinedQuantity ? String(joinedQuantity) : "");
  const requestedQuantity = Number(quantityInput) || 0;
  const purchaseQuantity = Math.min(Math.max(0, requestedQuantity), maximumQuantity);
  const order = calculatePoolOrder({
    quantity: purchaseQuantity,
    normalUnitPrice: pool.unitPrice,
    poolTarget: pool.target,
    maximumSupplierDiscount: pool.maximumSupplierDiscount,
  });
  const contributionLabel = order.contributionPercentage.toLocaleString("id-ID", { maximumFractionDigits: 1 });
  const discountLabel = order.estimatedDiscountPercentage.toLocaleString("id-ID", { maximumFractionDigits: 1 });
  const hasQuantity = order.quantity > 0;
  const isWaiting = pool.status === "waiting";
  const isSuccessful = pool.status === "successful";
  const members = [
    { initials: "BS", name: "Bu Sari", business: "Batik Laweyan", tone: "bg-[#367d4e] text-white" },
    { initials: "AR", name: "Arum", business: "Batik", tone: "bg-[#ffe5b6] text-[#b66d11]" },
    { initials: "SR", name: "Sido Rahayu", business: "Batik", tone: "bg-[#ffd7d1] text-[#bd4c3e]" },
    { initials: "NT", name: "Nusantara", business: "Batik", tone: "bg-[#e8ddfa] text-[#7354a8]" },
  ];

  return (
    <ModalFrame title="Detail Pool" onClose={onClose} width="max-w-[1080px]">
      <div className="grid gap-0 lg:grid-cols-[1.05fr_.95fr]">
        <div className="p-6 lg:border-r lg:border-[#e5e7eb]">
          <div className="flex items-start gap-4"><PoolIcon pool={pool} /><div><h3 className="text-lg font-extrabold text-[#10231d]">{pool.name}</h3><div className="mt-2 flex flex-wrap items-center gap-2"><span className="inline-flex rounded bg-[#eef3ec] px-2 py-1 text-[9px] font-bold text-[#315c45]">{pool.category}</span><PoolStatusBadge status={pool.status} /></div></div></div>
          <p className="mt-5 text-xs font-medium leading-6 text-[#596760]">{pool.description}</p>
          {isSuccessful ? <p className="mt-4 rounded-xl border border-[#cce3d2] bg-[#eef8f0] px-4 py-3 text-[10px] font-semibold leading-5 text-[#17683a]">Target pool berhasil terpenuhi. Diskon telah dikonfirmasi dan transaksi dapat dilanjutkan.</p> : null}
          {pool.status === "cancelled" ? <p className="mt-4 rounded-xl border border-[#f0c9c5] bg-[#fff1ef] px-4 py-3 text-[10px] font-semibold leading-5 text-[#a83b32]">Pool gagal karena target tidak terpenuhi hingga batas waktu. Seluruh pesanan dibatalkan, pengguna tidak dikenakan pembayaran, dan dana deposit akan dikembalikan.</p> : null}
          <div className="mt-6">
            <p className="text-[11px] font-extrabold text-[#27372f]">Progress Pool</p>
            <div className="mt-3 flex items-center justify-between text-xs font-bold"><span><strong>{formatNumber(pool.current)}{pool.unit}</strong> / {formatNumber(pool.target)}{pool.unit} target</span><strong>{pool.percentage}%</strong></div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e7ebe9]"><div className="h-full rounded-full bg-[#08783f]" style={{ width: `${pool.percentage}%` }} /></div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-[9px] font-semibold text-[#53625b]"><span className="flex gap-1.5"><UsersRound className="h-4 w-4" /> {pool.memberCount} UMKM bergabung</span><span className="flex gap-1.5"><MapPin className="h-4 w-4" /> {pool.location}</span><span className="flex gap-1.5"><Clock3 className="h-4 w-4" /> {pool.deadline}</span></div>
          </div>
          <div className="mt-7">
            <h4 className="text-[11px] font-extrabold text-[#27372f]">Anggota Pool ({pool.memberCount})</h4>
            <div className="mt-4 flex flex-wrap gap-4">
              {members.map((member) => <div key={member.initials} className="w-16 text-center"><span className={`mx-auto grid h-10 w-10 place-items-center rounded-full text-[10px] font-extrabold ${member.tone}`}>{member.initials}</span><p className="mt-2 truncate text-[9px] font-bold text-[#27372f]">{member.name}</p><p className="mt-0.5 truncate text-[8px] text-[#7b8781]">{member.business}</p></div>)}
              <button type="button" className="w-16 text-center"><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#e8ecea] text-[10px] font-extrabold text-[#596760]">+{Math.max(0, pool.memberCount - 4)}</span><p className="mt-2 text-[9px] font-bold text-[#27372f]">Lihat semua</p></button>
            </div>
          </div>
          <label className="mt-7 block rounded-xl border border-[#dfe8e2] bg-[#f8fbf9] p-4">
            <span className="text-[11px] font-extrabold text-[#27372f]">Jumlah Pesanan Anda</span>
            <span className="relative mt-2 block">
              <input
                type="number"
                min="1"
                max={maximumQuantity || undefined}
                step="1"
                value={quantityInput}
                onChange={(event) => setQuantityInput(event.target.value)}
                disabled={joined || !remainingQuantity || !isWaiting}
                placeholder="Contoh: 70"
                className="pool-input pool-quantity-input disabled:bg-[#eef2ef] disabled:text-[#64716b]"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[11px] font-extrabold text-[#52635a]">{pool.unit}</span>
            </span>
            <span className="mt-2 block text-[9px] font-medium leading-4 text-[#6c7973]">
              {joined
                ? `Pesanan Anda tercatat ${formatNumber(joinedQuantity)} ${pool.unit}.`
                : isWaiting
                  ? `Tersedia ${formatNumber(remainingQuantity)} ${pool.unit} dari target pool.`
                  : pool.status === "successful"
                    ? "Target pool sudah terpenuhi."
                    : "Input ditutup karena pool telah dibatalkan."}
            </span>
          </label>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => onJoin(purchaseQuantity)} disabled={joined || !hasQuantity || !remainingQuantity || !isWaiting} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#08783f] text-xs font-extrabold text-white transition hover:bg-[#066b36] disabled:cursor-not-allowed disabled:bg-[#91ae9b]"><Check className="h-4 w-4" /> {joined ? "Sudah Bergabung" : isSuccessful ? "Pool Berhasil" : pool.status === "cancelled" ? "Pool Dibatalkan" : remainingQuantity ? "Gabung Pool" : "Pool Penuh"}</button>
            <button type="button" onClick={onShare} className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#87b99a] text-xs font-extrabold text-[#08783f] transition hover:bg-[#f0f7f2]"><Share2 className="h-4 w-4" /> Bagikan Pool</button>
          </div>
        </div>

        <div className="bg-[#fbfcfb] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-extrabold text-[#10231d]">Ringkasan Pesanan</h3>
            <span className={`rounded-full px-3 py-1.5 text-[9px] font-extrabold ${isSuccessful ? "bg-[#e4f4e8] text-[#08783f]" : "bg-[#fff3db] text-[#9a5a0a]"}`}>
              {isSuccessful ? `Diskon final ${discountLabel}%` : `Estimasi diskon ${discountLabel}%`}
            </span>
          </div>
          <p className="mt-3 rounded-lg bg-[#f0f6f2] px-3 py-2.5 text-[9px] font-medium leading-4 text-[#52635a]">Harga per satuan tetap memakai harga normal supplier. Estimasi diskon Anda = jumlah pesanan ÷ target pool × diskon maksimum supplier.</p>

          <div className="mt-5 rounded-xl border border-[#dfe8e2] bg-white p-4">
            <div className="flex items-center justify-between gap-4"><span className="text-[10px] font-bold text-[#68766f]">Harga normal supplier</span><strong className="text-sm text-[#10231d]">{formatCurrency(pool.unitPrice)}/{pool.unit}</strong></div>
            <div className="mt-3 flex items-center justify-between gap-4"><span className="text-[10px] font-bold text-[#68766f]">Diskon maksimum supplier</span><strong className="text-sm text-[#08783f]">{pool.maximumSupplierDiscount}%</strong></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e8ecea]"><div className="h-full rounded-full bg-[#08783f] transition-all" style={{ width: `${order.contributionPercentage}%` }} /></div>
            <p className="mt-2 text-[9px] font-medium text-[#78847e]">Kontribusi pesanan Anda terhadap target: {hasQuantity ? `${contributionLabel}%` : "0%"}</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-[9px] font-bold text-[#7b8781]">Jumlah pesanan Anda</p><p className="mt-2 text-lg font-extrabold text-[#10231d]">{hasQuantity ? `${formatNumber(order.quantity)} ${pool.unit}` : "Masukkan jumlah"}</p></div>
            <div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-[9px] font-bold text-[#7b8781]">Subtotal normal</p><p className="mt-2 text-lg font-extrabold text-[#10231d]">{hasQuantity ? formatCurrency(order.subtotalNormal) : "—"}</p></div>
            <div className="rounded-xl border border-[#eadfbe] bg-[#fffaf0] p-4 shadow-sm"><p className="text-[9px] font-bold text-[#8a7334]">{isSuccessful ? "Diskon Anda" : "Estimasi diskon Anda"}</p><p className="mt-2 text-lg font-extrabold text-[#9a650c]">{hasQuantity ? `${discountLabel}%` : "—"}</p></div>
            <div className="rounded-xl border border-[#cfe4d4] bg-[#f3faf4] p-4 shadow-sm"><p className="text-[9px] font-bold text-[#61806c]">{isSuccessful ? "Penghematan" : "Estimasi penghematan"}</p><p className="mt-2 text-lg font-extrabold text-[#08783f]">{hasQuantity ? formatCurrency(order.estimatedDiscountAmount) : "—"}</p></div>
            <div className="rounded-xl border border-[#c7ddd0] bg-white p-4 shadow-sm sm:col-span-2"><p className="text-[9px] font-bold text-[#61806c]">{isSuccessful ? "Total pembayaran" : "Estimasi total pembayaran"}</p><p className="mt-2 text-xl font-extrabold text-[#08783f]">{pool.status === "cancelled" ? "Tidak ada pembayaran" : hasQuantity ? formatCurrency(order.estimatedTotal) : "—"}</p></div>
          </div>

          <p className="mt-5 text-[9px] font-medium leading-4 text-[#7b8781]">Selama status pool masih menunggu, diskon dan total pembayaran bersifat estimasi. Nilai final hanya dikonfirmasi setelah target pool terpenuhi sebelum {pool.deadline}.</p>
        </div>
      </div>
    </ModalFrame>
  );
}

export function PoolPatunganPage({
  ownerName,
  businessName,
  profileCompletion,
}: {
  ownerName: string;
  businessName: string;
  profileCompletion: number;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ search: "", category: "Semua kategori", district: "Semua kecamatan" });
  const [pools, setPools] = useState(INITIAL_POOLS);
  const [joinedPoolIds, setJoinedPoolIds] = useState<string[]>([]);
  const [joinedPoolQuantities, setJoinedPoolQuantities] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [mapRadius, setMapRadius] = useState(5);
  const [focusRequest, setFocusRequest] = useState(0);
  const [selectedMapPoolId, setSelectedMapPoolId] = useState<string | null>(null);
  const notifiedCancelledPools = useRef(new Set<string>());

  const filteredPools = useMemo(() => pools.filter((pool) => {
    const search = filters.search.trim().toLocaleLowerCase("id-ID");
    const matchesSearch = !search || `${pool.name} ${pool.category} ${pool.location}`.toLocaleLowerCase("id-ID").includes(search);
    const matchesCategory = filters.category === "Semua kategori" || pool.category === filters.category;
    const matchesDistrict = filters.district === "Semua kecamatan" || pool.district === filters.district;
    return matchesSearch && matchesCategory && matchesDistrict;
  }), [filters, pools]);

  const selectedPool = pools.find((pool) => pool.id === selectedPoolId) ?? null;
  const activePools = useMemo(() => filteredPools.filter((pool) => pool.status === "waiting"), [filteredPools]);
  const historyPools = useMemo(() => filteredPools.filter((pool) => pool.status !== "waiting"), [filteredPools]);
  const mappablePools = useMemo(
    () => activePools.filter((pool) => distanceKm(USER_POSITION, pool.coordinates) <= mapRadius),
    [activePools, mapRadius],
  );
  const activeMapPool =
    (selectedMapPoolId
      ? mappablePools.find((pool) => pool.id === selectedMapPoolId)
      : null) ?? mappablePools[0] ?? null;

  useEffect(() => {
    if (!activeModal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setActiveModal(null);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeModal]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    function refreshPoolStatuses() {
      setPools((current) => {
        let hasChanges = false;
        const updated = current.map((pool) => {
          const status = resolvePoolStatus({
            currentQuantity: pool.current,
            targetQuantity: pool.target,
            deadlineAt: pool.deadlineAt,
          });
          if (status === pool.status) return pool;
          hasChanges = true;
          return { ...pool, status };
        });
        return hasChanges ? updated : current;
      });
    }

    refreshPoolStatuses();
    const interval = window.setInterval(refreshPoolStatuses, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const newlyCancelled = pools.find(
      (pool) => pool.status === "cancelled" && !notifiedCancelledPools.current.has(pool.id),
    );
    if (!newlyCancelled) return;
    notifiedCancelledPools.current.add(newlyCancelled.id);
    setToast(`Pool ${newlyCancelled.name} gagal karena target tidak terpenuhi. Pesanan dibatalkan tanpa pembayaran.`);
  }, [pools]);

  function openDetail(poolId: string) {
    setSelectedPoolId(poolId);
    setActiveModal("detail");
  }

  function createPool(pool: PoolItem) {
    void recordPoolCreation({
      poolId: pool.id,
      productName: pool.name,
      category: pool.category,
      targetQuantity: pool.target,
      unit: pool.unit,
      deadline: pool.deadlineAt,
      district: pool.district,
      poolLeader: businessName,
    }).catch(() => setToast("Pool tampil lokal, tetapi pencatatan aktivitas gagal."));
    setPools((current) => [pool, ...current]);
    setFilters({ search: "", category: "Semua kategori", district: "Semua kecamatan" });
    setViewMode("list");
    setActiveModal(null);
    setToast("Pool baru berhasil dibuat dan ditambahkan ke daftar.");
  }

  function joinPool(quantity: number) {
    if (!selectedPool) return;
    if (selectedPool.status !== "waiting") {
      setToast(selectedPool.status === "successful" ? "Pool sudah berhasil dan tidak menerima pesanan baru." : "Pool telah dibatalkan karena target tidak terpenuhi.");
      return;
    }
    if (joinedPoolIds.includes(selectedPool.id)) {
      setToast(`Anda sudah bergabung ke pool ${selectedPool.name}.`);
      return;
    }
    const availableQuantity = Math.max(0, selectedPool.target - selectedPool.current);
    const safeQuantity = Math.min(availableQuantity, Math.max(0, Math.round(quantity)));
    if (!safeQuantity) {
      setToast("Masukkan jumlah pesanan sebelum bergabung.");
      return;
    }
    void recordPoolJoin({
      poolId: selectedPool.id,
      poolReference: selectedPool.id,
      productName: selectedPool.name,
      quantity: safeQuantity,
      unit: selectedPool.unit,
    }).catch(() => setToast("Pesanan tersimpan lokal, tetapi pencatatan aktivitas gagal."));
    setJoinedPoolIds((current) => [...current, selectedPool.id]);
    setJoinedPoolQuantities((current) => ({ ...current, [selectedPool.id]: safeQuantity }));
    setPools((current) => current.map((pool) => {
      if (pool.id !== selectedPool.id) return pool;
      const nextCurrent = Math.min(pool.target, pool.current + safeQuantity);
      const status = resolvePoolStatus({
        currentQuantity: nextCurrent,
        targetQuantity: pool.target,
        deadlineAt: pool.deadlineAt,
      });
      return {
        ...pool,
        current: nextCurrent,
        percentage: Math.round((nextCurrent / pool.target) * 100),
        memberCount: pool.memberCount + 1,
        status,
      };
    }));
    const targetReached = selectedPool.current + safeQuantity >= selectedPool.target;
    setToast(targetReached ? `Target pool ${selectedPool.name} berhasil terpenuhi. Transaksi dapat dilanjutkan.` : `Anda berhasil bergabung ke pool ${selectedPool.name}.`);
  }

  async function sharePool() {
    if (!selectedPool) return;
    const shareData = { title: selectedPool.name, text: `Gabung pool ${selectedPool.name} bersama UMKM Pull.`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(window.location.href);
      setToast("Tautan pool siap dibagikan.");
    } catch {
      setToast("Berbagi dibatalkan.");
    }
  }

  return (
    <>
      <style jsx global>{`.pool-input{height:46px;width:100%;border:1px solid #dfe5e1;border-radius:10px;background:white;padding:0 12px;font-size:12px;font-weight:600;color:#26372f;outline:none;transition:.2s}.pool-currency-input{padding-left:38px;padding-right:76px}.pool-quantity-input{padding-right:64px}.pool-percentage-input{padding-right:36px}.pool-input:focus{border-color:#71a987;box-shadow:0 0 0 4px #e7f3eb}.pool-input::placeholder{color:#98a29d}.pool-map-marker{background:transparent!important;border:0!important}`}</style>
      <UmkmDashboardShell ownerName={ownerName} businessName={businessName} profileCompletion={profileCompletion}>
          <FilterBar filters={filters} setFilters={setFilters} viewMode={viewMode} setViewMode={setViewMode} onCreate={() => setActiveModal("create")} />

          <div className="mt-5 flex items-center justify-between gap-4 text-[11px] font-bold text-[#507f63]">
            <p>Menampilkan <strong className="text-[#17392c]">{activePools.length}</strong> pool aktif di Solo Raya</p>
          </div>

          <div className="mt-4">
            {viewMode === "list" ? (
              <>
                {activePools.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{activePools.map((pool) => <PoolCard key={pool.id} pool={pool} joined={joinedPoolIds.includes(pool.id)} onOpen={() => openDetail(pool.id)} />)}</div> : <EmptyState />}
                {historyPools.length ? (
                  <section className="mt-8 border-t border-[#dfe5e1] pt-7">
                    <div className="mb-4"><h2 className="text-lg font-extrabold text-[#10231d]">Riwayat Pool</h2><p className="mt-1 text-[11px] font-medium text-[#6b7872]">Pool yang telah berhasil atau dibatalkan.</p></div>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{historyPools.map((pool) => <PoolCard key={pool.id} pool={pool} joined={joinedPoolIds.includes(pool.id)} onOpen={() => openDetail(pool.id)} />)}</div>
                  </section>
                ) : null}
              </>
            ) : mappablePools.length ? (
              <section className="relative isolate z-0 min-h-[620px] overflow-hidden rounded-[24px] border border-pull-100 bg-pull-50 shadow-[0_18px_50px_rgba(18,59,48,.08)]">
                <PoolMap
                  pools={mappablePools}
                  radius={mapRadius}
                  focusRequest={focusRequest}
                  onSelectPool={(pool) => setSelectedMapPoolId(pool.id)}
                />
                <label className="absolute right-4 top-4 z-[500] rounded-[16px] border border-pull-100 bg-white/95 p-3 shadow-lg backdrop-blur-md">
                  <span className="block text-[9px] font-extrabold text-pull-500">Jarak maksimal</span>
                  <select value={mapRadius} onChange={(event) => setMapRadius(Number(event.target.value))} className="mt-1 h-9 cursor-pointer bg-transparent text-sm font-extrabold text-pull-900 outline-none">
                    <option value={3}>3 km</option>
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                  </select>
                </label>
                <button type="button" onClick={() => setFocusRequest((value) => value + 1)} className="absolute bottom-44 right-4 z-[500] flex h-11 items-center gap-2 rounded-xl border border-pull-100 bg-white px-4 text-[10px] font-extrabold text-pull-700 shadow-lg transition-colors hover:bg-pull-50">
                  <LocateFixed className="h-4 w-4" /> Lokasi saya
                </button>
                {activeMapPool ? <MapPoolCard pool={activeMapPool} onDetail={() => openDetail(activeMapPool.id)} /> : null}
              </section>
            ) : (
              <EmptyState />
            )}
          </div>
      </UmkmDashboardShell>

      {activeModal === "create" ? <CreatePoolModal onClose={() => setActiveModal(null)} onSubmit={createPool} /> : null}
      {activeModal === "detail" && selectedPool ? <DetailModal pool={selectedPool} joined={joinedPoolIds.includes(selectedPool.id)} joinedQuantity={joinedPoolQuantities[selectedPool.id] ?? 0} onClose={() => setActiveModal(null)} onJoin={joinPool} onShare={sharePool} /> : null}
      {toast ? <div role="status" className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#0c261c] px-4 py-3 text-xs font-bold text-white shadow-[0_16px_45px_rgba(7,29,21,.28)]"><Check className="h-4 w-4 text-[#9ad2aa]" />{toast}</div> : null}
    </>
  );
}
