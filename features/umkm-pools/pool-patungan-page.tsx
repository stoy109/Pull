"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  FlaskConical,
  Home,
  LayoutList,
  LocateFixed,
  LogOut,
  Map,
  MapPin,
  MoreHorizontal,
  PackageOpen,
  Plus,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Store,
  TrendingUp,
  UsersRound,
  X,
} from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { PoolMap } from "./pool-map";

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
  savings: number;
  memberCount: number;
  location: string;
  district: string;
  deadline: string;
  description: string;
  icon: "fabric" | "dye" | "package";
  iconTone: string;
  iconColor: string;
  coordinates: [number, number];
  unitPrice: number;
  poolPrice: number;
};

type Filters = {
  search: string;
  category: string;
  district: string;
};

const INITIAL_POOLS: PoolItem[] = [
  {
    id: "pool-1",
    name: "Kain Katun Combed 30s",
    category: "Tekstil & Kain",
    current: 350,
    target: 500,
    unit: "kg",
    percentage: 70,
    savings: 22,
    memberCount: 8,
    location: "Laweyan, Solo",
    district: "Laweyan",
    deadline: "3 hari lagi",
    description: "Kain katun combed 30s untuk kebutuhan produksi garmen dan batik.",
    icon: "fabric",
    iconTone: "bg-[#e1f1e4] text-[#08783f]",
    iconColor: "#08783f",
    coordinates: [-7.5662, 110.7974],
    unitPrice: 37500,
    poolPrice: 29300,
  },
  {
    id: "pool-2",
    name: "Pewarna Batik Sintetis",
    category: "Bahan Kerajinan",
    current: 120,
    target: 200,
    unit: "kg",
    percentage: 60,
    savings: 18,
    memberCount: 5,
    location: "Pasar Kliwon, Solo",
    district: "Pasar Kliwon",
    deadline: "5 hari lagi",
    description: "Pewarna sintetis konsentrat untuk kebutuhan produksi batik skala UMKM.",
    icon: "dye",
    iconTone: "bg-[#fff0df] text-[#df710e]",
    iconColor: "#ee8615",
    coordinates: [-7.5831, 110.8311],
    unitPrice: 68000,
    poolPrice: 55700,
  },
  {
    id: "pool-3",
    name: "Kemasan Plastik Standing Pouch",
    category: "Kemasan",
    current: 8000,
    target: 10000,
    unit: "pcs",
    percentage: 80,
    savings: 28,
    memberCount: 12,
    location: "Serengan, Solo",
    district: "Serengan",
    deadline: "1 hari lagi",
    description: "Kemasan standing pouch transparan untuk makanan kering dan produk rumahan.",
    icon: "package",
    iconTone: "bg-[#eee9fb] text-[#7057b8]",
    iconColor: "#775bc1",
    coordinates: [-7.575, 110.8167],
    unitPrice: 1850,
    poolPrice: 1330,
  },
];

const NAVIGATION = [
  { label: "Homepage", icon: Home, href: "/dashboard" },
  { label: "Pool Patungan", icon: UsersRound, href: "/dashboard/pools", active: true },
  { label: "Papan Loker", icon: BriefcaseBusiness, href: "#" },
  { label: "Lamaran Saya", icon: ClipboardList, href: "#" },
  { label: "Profil Usaha", icon: Store, href: "#" },
  { label: "Trust Score", icon: ShieldCheck, href: "#" },
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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function PoolIcon({ pool, small = false }: { pool: PoolItem; small?: boolean }) {
  const Icon = pool.icon === "dye" ? FlaskConical : pool.icon === "package" ? ShoppingBag : PackageOpen;
  return (
    <span className={`grid shrink-0 place-items-center rounded-full ${small ? "h-10 w-10" : "h-14 w-14"} ${pool.iconTone}`}>
      <Icon className={small ? "h-5 w-5" : "h-7 w-7"} strokeWidth={1.9} />
    </span>
  );
}

function Sidebar({ ownerName, businessName }: { ownerName: string; businessName: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[232px] bg-gradient-to-b from-[#075f42] via-[#005236] to-[#003e2a] text-white lg:block">
      <div className="flex h-full flex-col px-4 py-7">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <Image src="/Logo(Pull).svg" alt="Pull" width={42} height={42} className="h-11 w-11 rounded-xl" priority />
          <span className="text-[28px] font-extrabold tracking-[-0.03em]">Pull</span>
        </Link>

        <nav className="mt-8 flex-1 space-y-2" aria-label="Navigasi utama UMKM">
          {NAVIGATION.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${
                  item.active ? "bg-[#07933f] text-white shadow-lg shadow-black/10" : "text-white/90 hover:bg-white/10"
                }`}
              >
                <Icon className="h-[19px] w-[19px] shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <nav className="space-y-2 border-t border-white/10 pt-4" aria-label="Bantuan dan pengaturan">
          <a href="#" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-white/90 hover:bg-white/10"><CircleHelp className="h-[19px] w-[19px]" /> Bantuan</a>
          <a href="#" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-white/90 hover:bg-white/10"><Settings className="h-[19px] w-[19px]" /> Pengaturan</a>
        </nav>

        <div className="mt-5 rounded-xl border border-white/20 bg-white/[0.06] p-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#4c9664] text-xs font-extrabold">{initials(ownerName)}</span>
            <div className="min-w-0">
              <p className="truncate text-xs font-extrabold">{ownerName}</p>
              <p className="mt-1 truncate text-[10px] text-white/70">{businessName}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[9px] font-bold"><span>78% profil lengkap</span><ChevronRight className="h-3.5 w-3.5" /></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full w-[78%] rounded-full bg-[#7eba39]" /></div>
        </div>
        <form action={signOutAction} className="mt-2">
          <button type="submit" className="flex h-11 w-full items-center gap-3 rounded-lg border border-white/20 px-3 text-xs font-bold text-white/90 transition hover:bg-white/10"><LogOut className="h-4 w-4" /> Keluar dari akun</button>
        </form>
      </div>
    </aside>
  );
}

function Topbar({ ownerName, businessName }: { ownerName: string; businessName: string }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: PointerEvent) {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex min-h-[82px] items-center gap-3 border-b border-[#e3e8e5] bg-white px-4 sm:px-6 xl:px-8">
      <Link href="/dashboard" className="mr-auto flex items-center gap-2 lg:hidden">
        <Image src="/Logo(Pull).svg" alt="Pull" width={36} height={36} className="rounded-lg" />
        <span className="text-xl font-extrabold text-[#145c46]">Pull</span>
      </Link>
      <label className="hidden h-12 min-w-0 max-w-[500px] flex-1 items-center gap-3 rounded-xl border border-[#dfe5e1] bg-white px-4 text-[#7b8781] md:flex">
        <Search className="h-5 w-5 shrink-0" />
        <input className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#1a2c25] outline-none placeholder:text-[#7b8781]" placeholder="Cari UMKM, bahan baku, atau pekerjaan..." />
      </label>

      <button type="button" className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[#46534d] transition hover:bg-[#f0f5f1]" aria-label="Notifikasi">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#e3343f] px-1 text-[9px] font-extrabold text-white">3</span>
      </button>

      <div className="hidden h-14 items-center gap-3 rounded-xl border border-[#e1e7e3] px-3 sm:flex">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e7f5eb] text-[#08783f]"><ShieldCheck className="h-5 w-5 fill-[#08783f] text-white" /></span>
        <div><p className="text-[10px] font-bold text-[#596760]">Trust Score</p><p className="mt-0.5 text-sm font-extrabold text-[#10231d]">92 <span className="ml-1 text-[9px] text-[#11834a]">Sangat Baik</span></p></div>
      </div>
      <div className="hidden h-14 items-center gap-3 rounded-xl border border-[#e1e7e3] px-3 xl:flex">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#eef6e6] text-[#4e8c3c]"><ShoppingBag className="h-4 w-4" /></span>
        <div><p className="text-[10px] font-bold text-[#596760]">PullPoints</p><p className="mt-0.5 text-sm font-extrabold text-[#10231d]">1.250</p></div>
      </div>

      <div ref={profileRef} className="relative">
        <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex h-14 items-center gap-3 rounded-xl px-2 text-left transition hover:bg-[#f5f8f6]" aria-expanded={profileOpen} aria-haspopup="menu">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#08783d] text-xs font-extrabold text-white">{initials(ownerName)}</span>
          <span className="hidden min-w-0 sm:block"><span className="block max-w-28 truncate text-xs font-extrabold text-[#111b17]">{ownerName}</span><span className="mt-1 block max-w-28 truncate text-[10px] font-medium text-[#69756f]">{businessName}</span></span>
          <ChevronDown className={`hidden h-4 w-4 text-[#24332d] transition sm:block ${profileOpen ? "rotate-180" : ""}`} />
        </button>
        {profileOpen ? (
          <div role="menu" className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-xl border border-[#dfe6e2] bg-white p-3 shadow-[0_18px_48px_rgba(12,38,28,.16)]">
            <p className="text-xs font-extrabold text-[#10231d]">{ownerName}</p>
            <p className="mt-1 text-[10px] text-[#69756f]">{businessName} · Pemilik UMKM</p>
            <Link href="/dashboard" className="mt-3 flex h-10 items-center gap-2 rounded-lg bg-[#f0f5f1] px-3 text-[11px] font-bold text-[#28543e]"><Home className="h-4 w-4" /> Kembali ke dashboard</Link>
          </div>
        ) : null}
      </div>
    </header>
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
        <div className="flex h-[52px] w-full rounded-[15px] border border-[#dfe5e1] bg-white p-1 sm:w-[232px]">
          <button type="button" onClick={() => setViewMode("list")} className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${viewMode === "list" ? "bg-[#08783f] text-white shadow-sm" : "text-[#38694e] hover:bg-[#f0f5f1]"}`}><LayoutList className="h-4 w-4" /> List View</button>
          <button type="button" onClick={() => setViewMode("map")} className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${viewMode === "map" ? "bg-[#08783f] text-white shadow-sm" : "text-[#38694e] hover:bg-[#f0f5f1]"}`}><Map className="h-4 w-4" /> Map</button>
        </div>
        <button type="button" onClick={onCreate} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#08783f] px-5 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(8,120,63,.18)] transition hover:bg-[#066b36]">Buat Pool <Plus className="h-4 w-4" /></button>
      </div>
    </section>
  );
}

function PoolCard({ pool, onOpen }: { pool: PoolItem; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="group flex min-h-[328px] w-full flex-col rounded-xl border border-[#dfe5e1] bg-white p-5 text-left shadow-[0_5px_18px_rgba(18,59,48,.03)] transition hover:-translate-y-0.5 hover:border-[#9ac4aa] hover:shadow-[0_12px_28px_rgba(18,59,48,.08)]">
      <div className="flex items-start gap-3.5">
        <PoolIcon pool={pool} />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[15px] font-extrabold leading-5 text-[#10231d]">{pool.name}</h3>
          <span className="mt-2 inline-flex rounded bg-[#f1f3f2] px-2 py-1 text-[9px] font-bold text-[#46534d]">{pool.category}</span>
        </div>
      </div>
      <div className="mt-7">
        <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-[#34463e]"><span><strong>{formatNumber(pool.current)}{pool.unit}</strong> / {formatNumber(pool.target)}{pool.unit} target</span><strong className="text-[#10231d]">{pool.percentage}%</strong></div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e8ecea]"><div className="h-full rounded-full bg-[#08783f] transition-all" style={{ width: `${pool.percentage}%` }} /></div>
      </div>
      <div className="mt-4 flex h-11 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(90deg,#f0f7e9,#f5f9ef)] text-xs font-extrabold text-[#1c663a]"><TrendingUp className="h-4 w-4" /> Estimasi hemat {pool.savings}%</div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-[9px] font-semibold leading-4 text-[#53625b]">
        <span className="flex items-start gap-1.5"><UsersRound className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {pool.memberCount} UMKM bergabung</span>
        <span className="flex items-start gap-1.5"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {pool.location}</span>
        <span className="flex items-start gap-1.5"><Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {pool.deadline}</span>
      </div>
      <span className="mt-4 flex h-11 w-full items-center justify-center rounded-lg bg-[#08783f] text-xs font-extrabold text-white transition group-hover:bg-[#066b36]">Gabung Pool</span>
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
          <p className="mt-2 text-xs font-extrabold text-[#08783f]">Estimasi hemat {pool.savings}%</p>
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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const target = Number(form.get("target_volume"));
    const unit = String(form.get("satuan"));
    const category = String(form.get("kategori"));
    onSubmit({
      id: `pool-${Date.now()}`,
      name: String(form.get("nama_bahan")),
      category,
      current: 0,
      target,
      unit,
      percentage: 0,
      savings: 15,
      memberCount: 1,
      location: "Laweyan, Solo",
      district: "Laweyan",
      deadline: "Baru dibuat",
      description: description || "Pool bahan baku baru dari komunitas UMKM Pull.",
      icon: category === "Kemasan" ? "package" : category === "Bahan Kerajinan" ? "dye" : "fabric",
      iconTone: "bg-[#e1f1e4] text-[#08783f]",
      iconColor: "#08783f",
      coordinates: [-7.569, 110.805],
      unitPrice: 0,
      poolPrice: 0,
    });
  }

  return (
    <ModalFrame title="Buat Pool Baru" onClose={onClose} width="max-w-[760px]">
      <form onSubmit={submit}>
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <Field label="Nama Bahan Baku *"><input name="nama_bahan" required placeholder="Contoh: Kain Katun Combed 30s" className="pool-input" /></Field>
          <Field label="Kategori *"><select name="kategori" required className="pool-input"><option value="">Pilih kategori</option>{CATEGORY_OPTIONS.slice(1).map((option) => <option key={option}>{option}</option>)}</select></Field>
          <Field label="Target Volume *"><input name="target_volume" type="number" min="1" required placeholder="Masukkan jumlah target" className="pool-input" /></Field>
          <Field label="Satuan *"><select name="satuan" required className="pool-input"><option value="">Pilih satuan</option><option>kg</option><option>pcs</option><option>liter</option><option>meter</option></select></Field>
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

function DetailModal({ pool, joined, onClose, onJoin, onShare }: { pool: PoolItem; joined: boolean; onClose: () => void; onJoin: () => void; onShare: () => void }) {
  const savedPerUnit = Math.max(0, pool.unitPrice - pool.poolPrice);
  const totalSavings = savedPerUnit * pool.target;
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
          <div className="flex items-start gap-4"><PoolIcon pool={pool} /><div><h3 className="text-lg font-extrabold text-[#10231d]">{pool.name}</h3><span className="mt-2 inline-flex rounded bg-[#eef3ec] px-2 py-1 text-[9px] font-bold text-[#315c45]">{pool.category}</span></div></div>
          <p className="mt-5 text-xs font-medium leading-6 text-[#596760]">{pool.description}</p>
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
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={onJoin} disabled={joined} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#08783f] text-xs font-extrabold text-white transition hover:bg-[#066b36] disabled:bg-[#70a984]"><Check className="h-4 w-4" /> {joined ? "Sudah Bergabung" : "Gabung Pool"}</button>
            <button type="button" onClick={onShare} className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#87b99a] text-xs font-extrabold text-[#08783f] transition hover:bg-[#f0f7f2]"><Share2 className="h-4 w-4" /> Bagikan Pool</button>
          </div>
        </div>

        <div className="bg-[#fbfcfb] p-6">
          <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-extrabold text-[#10231d]">Savings Calculator</h3><span className="rounded-full bg-[#eef6e7] px-3 py-1 text-[9px] font-extrabold text-[#27703f]">Perkiraan hemat 18–28%</span></div>
          <p className="mt-4 text-[10px] font-bold text-[#596760]">Perbandingan Harga</p>
          <div className="mt-5 grid h-56 grid-cols-[1fr_auto_1fr] items-end gap-5 border-b border-[#cfd6d2] px-4">
            <div className="text-center"><p className="mb-2 text-[9px] font-bold text-[#67736d]">{pool.unitPrice ? `${formatCurrency(pool.unitPrice)}/${pool.unit}` : "Belum tersedia"}</p><div className="mx-auto h-28 max-w-28 rounded-t bg-gradient-to-b from-[#dfe3e1] to-[#bcc3c0]" /><p className="mt-3 text-[9px] font-bold text-[#53625b]">Beli Satuan<br /><span className="font-medium">(Estimasi)</span></p></div>
            <div className="mb-20 rounded-xl border border-[#d9e7c6] bg-[#f1f8df] px-3 py-2 text-center text-[9px] font-extrabold text-[#28703f]">Hemat<br /><strong className="text-sm">{pool.savings}%</strong></div>
            <div className="text-center"><p className="mb-2 text-[9px] font-bold text-[#27703f]">{pool.poolPrice ? `${formatCurrency(pool.poolPrice)}/${pool.unit}` : "Belum tersedia"}</p><div className="mx-auto h-24 max-w-28 rounded-t bg-gradient-to-b from-[#4e9a59] to-[#24763d]" /><p className="mt-3 text-[9px] font-bold text-[#53625b]">Pool Patungan<br /><span className="font-medium">(Estimasi)</span></p></div>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-[9px] font-bold text-[#7b8781]">Estimasi Hemat</p><p className="mt-2 text-lg font-extrabold text-[#08783f]">{savedPerUnit ? `${formatCurrency(savedPerUnit)}/${pool.unit}` : "Menunggu harga"}</p></div><div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-[9px] font-bold text-[#7b8781]">Total Hemat (Jika tercapai target)</p><p className="mt-2 text-lg font-extrabold text-[#08783f]">{totalSavings ? formatCurrency(totalSavings) : "Menunggu harga"}</p></div></div>
          <p className="mt-5 text-[9px] font-medium text-[#7b8781]">*Perhitungan berdasarkan target {formatNumber(pool.target)}{pool.unit}</p>
        </div>
      </div>
    </ModalFrame>
  );
}

export function PoolPatunganPage({ ownerName, businessName }: { ownerName: string; businessName: string }) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ search: "", category: "Semua kategori", district: "Semua kecamatan" });
  const [pools, setPools] = useState(INITIAL_POOLS);
  const [joinedPoolIds, setJoinedPoolIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [mapRadius, setMapRadius] = useState(5);
  const [focusRequest, setFocusRequest] = useState(0);
  const [selectedMapPoolId, setSelectedMapPoolId] = useState<string | null>(null);

  const filteredPools = useMemo(() => pools.filter((pool) => {
    const search = filters.search.trim().toLocaleLowerCase("id-ID");
    const matchesSearch = !search || `${pool.name} ${pool.category} ${pool.location}`.toLocaleLowerCase("id-ID").includes(search);
    const matchesCategory = filters.category === "Semua kategori" || pool.category === filters.category;
    const matchesDistrict = filters.district === "Semua kecamatan" || pool.district === filters.district;
    return matchesSearch && matchesCategory && matchesDistrict;
  }), [filters, pools]);

  const selectedPool = pools.find((pool) => pool.id === selectedPoolId) ?? null;
  const mappablePools = useMemo(
    () => filteredPools.filter((pool) => distanceKm(USER_POSITION, pool.coordinates) <= mapRadius),
    [filteredPools, mapRadius],
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

  function openDetail(poolId: string) {
    setSelectedPoolId(poolId);
    setActiveModal("detail");
  }

  function createPool(pool: PoolItem) {
    setPools((current) => [pool, ...current]);
    setFilters({ search: "", category: "Semua kategori", district: "Semua kecamatan" });
    setViewMode("list");
    setActiveModal(null);
    setToast("Pool baru berhasil dibuat dan ditambahkan ke daftar.");
  }

  function joinPool() {
    if (!selectedPool) return;
    setJoinedPoolIds((current) => [...current, selectedPool.id]);
    setPools((current) => current.map((pool) => pool.id === selectedPool.id ? { ...pool, memberCount: pool.memberCount + 1 } : pool));
    setToast(`Anda berhasil bergabung ke pool ${selectedPool.name}.`);
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
    <div className="min-h-screen bg-[#f7f9f8] font-[family-name:var(--font-worker-sans)] text-[#10231d]">
      <style jsx global>{`.pool-input{height:46px;width:100%;border:1px solid #dfe5e1;border-radius:10px;background:white;padding:0 12px;font-size:12px;font-weight:600;color:#26372f;outline:none;transition:.2s}.pool-input:focus{border-color:#71a987;box-shadow:0 0 0 4px #e7f3eb}.pool-input::placeholder{color:#98a29d}.pool-map-marker{background:transparent!important;border:0!important}`}</style>
      <Sidebar ownerName={ownerName} businessName={businessName} />
      <div className="lg:pl-[232px]">
        <Topbar ownerName={ownerName} businessName={businessName} />
        <main className="mx-auto max-w-[1480px] px-4 pb-16 pt-6 sm:px-6 xl:px-8">
          <FilterBar filters={filters} setFilters={setFilters} viewMode={viewMode} setViewMode={setViewMode} onCreate={() => setActiveModal("create")} />

          <div className="mt-5 flex items-center justify-between gap-4 text-[11px] font-bold text-[#507f63]">
            <p>Menampilkan <strong className="text-[#17392c]">{filteredPools.length}</strong> pool aktif di Solo Raya</p>
          </div>

          <div className="mt-4">
            {viewMode === "list" ? (
              filteredPools.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredPools.map((pool) => <PoolCard key={pool.id} pool={pool} onOpen={() => openDetail(pool.id)} />)}</div> : <EmptyState />
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
        </main>
      </div>

      {activeModal === "create" ? <CreatePoolModal onClose={() => setActiveModal(null)} onSubmit={createPool} /> : null}
      {activeModal === "detail" && selectedPool ? <DetailModal pool={selectedPool} joined={joinedPoolIds.includes(selectedPool.id)} onClose={() => setActiveModal(null)} onJoin={joinPool} onShare={sharePool} /> : null}
      {toast ? <div role="status" className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#0c261c] px-4 py-3 text-xs font-bold text-white shadow-[0_16px_45px_rgba(7,29,21,.28)]"><Check className="h-4 w-4 text-[#9ad2aa]" />{toast}</div> : null}
    </div>
  );
}
