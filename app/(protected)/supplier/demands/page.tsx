import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Building2,
  CalendarClock,
  CheckCircle2,
  MapPin,
  PackageOpen,
  Send,
  Store,
} from "lucide-react";
import { getSupplierProfile } from "@/features/supplier/profile";
import { requireRole } from "@/lib/auth/require-role";
import { getSupplierDashboardData } from "@/lib/activity/queries";

function formatValue(value: string | number) {
  return typeof value === "number" ? new Intl.NumberFormat("id-ID").format(value) : value;
}

function formatDeadline(value: string | Date) {
  if (!value) return "Belum ditentukan";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function deadlineStatus(value: string | Date) {
  if (!value) return "Tenggat fleksibel";
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Cek tenggat";
  const days = Math.ceil((timestamp - Date.now()) / 86_400_000);
  if (days < 0) return "Tenggat lewat";
  if (days === 0) return "Berakhir hari ini";
  return `${days} hari lagi`;
}

export default async function SupplierDemandsPage() {
  const { user } = await requireRole(["supplier"]);
  const data = await getSupplierDashboardData();
  const profile = getSupplierProfile(user.user_metadata ?? {}, user.email ?? "");
  const responseSteps = [
    { title: "Pilih demand", detail: "Cek komoditas, volume, lokasi, dan tenggat." },
    { title: "Kirim minat", detail: "Gunakan pesan yang sudah disiapkan untuk ketua pool." },
    { title: "Buat penawaran", detail: "Lanjutkan dengan harga satuan dan kemampuan pasok." },
  ];

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        {[{ label: "Pool tersedia", value: data.pools.length, icon: PackageOpen }, { label: "UMKM peminta", value: data.requestingUmkm, icon: Store }, { label: "Kategori aktif", value: data.categories, icon: Boxes }].map((item) => {
          const Icon = item.icon;
          return <article key={item.label} className="flex items-center gap-4 rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_24px_rgba(18,59,48,.025)]"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#e8f5ec] text-[#08783f]"><Icon className="h-5 w-5" /></span><div><p className="text-[10px] font-bold text-[#6e9b7d]">{item.label}</p><p className="mt-1 font-[family-name:var(--font-worker-display)] text-3xl font-semibold text-[#0c261c]">{item.value}</p></div></article>;
        })}
      </section>

      <section className="mt-5 rounded-[18px] border border-[#dfeae2] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(18,59,48,.025)] sm:px-6">
        <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-center"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#507f63]">Alur respons</p><h2 className="mt-1.5 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em]">Dari demand ke penawaran</h2></div><ol className="grid gap-3 sm:grid-cols-3">{responseSteps.map((step, index) => <li key={step.title} className="flex gap-3 rounded-xl bg-[#f6f9f7] p-3.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#08783f] text-[10px] font-black text-white">{index + 1}</span><span><strong className="block text-[11px] font-extrabold text-[#1d4634]">{step.title}</strong><span className="mt-1 block text-[9px] font-medium leading-4 text-[#6e9b7d]">{step.detail}</span></span></li>)}</ol></div>
      </section>

      <section className="mt-5 overflow-hidden rounded-[18px] border border-[#dfeae2] bg-white shadow-[0_8px_28px_rgba(18,59,48,.03)]">
        <header className="flex flex-col gap-3 border-b border-[#dfeae2] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#507f63]">Demand board</p><h2 className="mt-1.5 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em] text-[#0c261c]">Pool yang membutuhkan supplier</h2><p className="mt-1.5 text-[10px] font-medium text-[#6e9b7d]">Prioritaskan keputusan dari tenggat, kapasitas, dan jangkauan pengiriman.</p></div><Link href="/supplier/offers" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#b9dcc8] px-4 text-[10px] font-extrabold text-[#08783f]">Buat penawaran <ArrowRight className="h-3.5 w-3.5" /></Link></header>

        {data.pools.length ? <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2 xl:grid-cols-3">{data.pools.map((pool) => {
          const message = encodeURIComponent(`Halo, saya dari ${profile.businessName} tertarik memasok kebutuhan ${pool.commodity} untuk pool ${pool.id}. Apakah masih tersedia?`);
          return <article key={pool.id} className="flex min-h-[300px] flex-col rounded-[18px] border border-[#dfeae2] bg-[#fcfdfc] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#b9d5c4] hover:shadow-[0_12px_28px_rgba(18,59,48,.07)]"><div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#e8f5ec] text-[#08783f]"><PackageOpen className="h-5 w-5" /></span><span className="rounded-full bg-[#fff0df] px-2.5 py-1 text-[9px] font-extrabold text-[#b9681d]"><CalendarClock className="mr-1 inline h-3 w-3" />{deadlineStatus(pool.deadline)}</span></div><p className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#6e9b7d]">{pool.category || "Kebutuhan bahan"}</p><h3 className="mt-1.5 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em] text-[#0c261c]">{pool.commodity}</h3><div className="mt-4 grid grid-cols-2 gap-3 text-[10px]"><div className="rounded-xl bg-white p-3"><p className="font-bold text-[#6e9b7d]">Volume</p><p className="mt-1 text-xs font-extrabold text-[#1d4634]">{formatValue(pool.volume)} {pool.unit || "unit"}</p></div><div className="rounded-xl bg-white p-3"><p className="font-bold text-[#6e9b7d]">Tenggat</p><p className="mt-1 text-xs font-extrabold text-[#1d4634]">{formatDeadline(pool.deadline)}</p></div></div><div className="mt-4 space-y-2 text-[10px] font-semibold text-[#507f63]"><p className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> {pool.poolLeader}</p><p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {pool.location || "Solo Raya"}</p></div><a href={`https://wa.me/?text=${message}`} target="_blank" rel="noreferrer" className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#08783f] px-4 text-xs font-extrabold text-white transition hover:bg-[#00613f]">Kirim minat pasok <Send className="h-3.5 w-3.5" /></a></article>;
        })}</div> : <div className="grid min-h-64 place-items-center px-6 py-12 text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e8f5ec] text-[#08783f]"><CheckCircle2 className="h-6 w-6" /></span><h3 className="mt-4 text-sm font-extrabold text-[#0c261c]">Semua demand sudah ditangani</h3><p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-[#6e9b7d]">Peluang baru akan tampil saat UMKM membuka pool berikutnya.</p></div></div>}
      </section>

      <footer className="mt-8 flex flex-col gap-2 border-t border-[#dfeae2] pt-5 text-[9px] font-semibold text-[#6e9b7d] sm:flex-row sm:items-center sm:justify-between"><p>Pull Supplier Space · Demand board</p><p>Estimasi volume aktif: {data.estimatedVolume}</p></footer>
    </>
  );
}
