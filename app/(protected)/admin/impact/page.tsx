import Link from "next/link";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  PackageCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { ImpactActionControls } from "@/features/admin/components/impact-action-controls";
import { getAdminImpact } from "@/features/admin/data/get-admin-impact";
import { normalizeImpactFilters, type ImpactPriority } from "@/lib/impact/dashboard";
import { requireRole } from "@/lib/auth/access";

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

const PRIORITY_PRESENTATION: Record<ImpactPriority, { label: string; classes: string }> = {
  high: { label: "Tinggi", classes: "bg-[#fff0f0] text-[#b33e48]" },
  medium: { label: "Sedang", classes: "bg-[#fff2df] text-[#a66013]" },
  low: { label: "Rendah", classes: "bg-[#e8f6ee] text-[#087447]" },
};

const STATUS_LABELS: Record<string, string> = {
  published: "Aktif",
  draft: "Draft",
  closed: "Ditutup",
  submitted: "Menunggu",
  accepted: "Diterima",
  rejected: "Ditolak",
  withdrawn: "Ditarik",
  active: "Aktif",
  inactive: "Tidak aktif",
};

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : `${dateTimeFormatter.format(date)} WIB`;
}

export default async function AdminImpactPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    range?: string | string[];
    category?: string | string[];
    priority?: string | string[];
    page?: string | string[];
  }>;
}>) {
  const [, rawFilters] = await Promise.all([requireRole(["admin"]), searchParams]);
  const filters = normalizeImpactFilters(rawFilters);
  const data = await getAdminImpact(filters);
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  function pageHref(page: number) {
    const params = new URLSearchParams();
    if (filters.days !== 30) params.set("range", String(filters.days));
    if (filters.category) params.set("category", filters.category);
    if (filters.priority) params.set("priority", filters.priority);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/admin/impact?${query}` : "/admin/impact";
  }

  const metricCards = [
    { label: "Lowongan aktif", value: data.metrics.activeJobs, detail: `Diterbitkan dalam ${filters.days} hari`, icon: BriefcaseBusiness, tone: "bg-[#e8f6ee] text-[#087447]" },
    { label: "Lamaran masuk", value: data.metrics.applications, detail: `Masuk dalam ${filters.days} hari`, icon: ClipboardList, tone: "bg-[#eaf1fb] text-[#315f9a]" },
    { label: "Tingkat penempatan", value: `${data.metrics.placementRate}%`, detail: "Lamaran berstatus diterima", icon: Target, tone: "bg-[#f0ebf8] text-[#684b96]" },
    { label: "Penawaran aktif", value: data.metrics.activeSupplierOffers, detail: `Dibuat dalam ${filters.days} hari`, icon: PackageCheck, tone: "bg-[#fff2df] text-[#a66013]" },
  ] as const;

  return (
    <AdminShell activePath="/admin/impact">
      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
        <section>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#cfe3d7] bg-[#eaf6ee] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#087447]">
            <Sparkles className="h-3.5 w-3.5" /> Rule-based recommendation
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">Smart Impact Dashboard</h1>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-[#62746d]">
            Ukur dampak rekrutmen dan supplier, temukan item prioritas, lalu catat tindak lanjut langsung dari satu halaman.
          </p>
        </section>

        <form method="get" className="mt-7 grid gap-3 rounded-[20px] border border-[#dce6e0] bg-white p-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
          <label className="grid gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#688078]">Periode
            <select name="range" defaultValue={String(filters.days)} className="h-11 rounded-xl border border-[#d7e3dc] bg-[#fbfdfc] px-3 text-xs font-extrabold normal-case tracking-normal outline-none">
              <option value="7">7 hari terakhir</option><option value="30">30 hari terakhir</option><option value="90">90 hari terakhir</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#688078]">Kategori
            <select name="category" defaultValue={filters.category ?? ""} className="h-11 rounded-xl border border-[#d7e3dc] bg-[#fbfdfc] px-3 text-xs font-extrabold normal-case tracking-normal outline-none">
              <option value="">Semua kategori</option><option value="recruitment">Rekrutmen</option><option value="supplier">Supplier</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#688078]">Prioritas
            <select name="priority" defaultValue={filters.priority ?? ""} className="h-11 rounded-xl border border-[#d7e3dc] bg-[#fbfdfc] px-3 text-xs font-extrabold normal-case tracking-normal outline-none">
              <option value="">Semua prioritas</option><option value="high">Tinggi</option><option value="medium">Sedang</option><option value="low">Rendah</option>
            </select>
          </label>
          <button type="submit" className="h-11 rounded-xl bg-[#0b7449] px-6 text-xs font-extrabold text-white">Terapkan filter</button>
        </form>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Metrik dampak utama">
          {metricCards.map(({ label, value, detail, icon: Icon, tone }) => <article key={label} className="rounded-[20px] border border-[#dce6e0] bg-white p-5 shadow-[0_8px_24px_rgba(23,58,44,.04)]">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-[#6b7b75]">{label}</p><p className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">{value}</p></div><span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span></div>
            <p className="mt-4 text-[10px] font-semibold text-[#8a9893]">{detail}</p>
          </article>)}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
          <article className="rounded-[22px] border border-[#dce6e0] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#42806a]">Rekomendasi cerdas</p><h2 className="mt-1 text-lg font-extrabold">Tindak lanjut yang disarankan</h2></div><span className="rounded-lg bg-[#edf5f1] px-3 py-1.5 text-[10px] font-extrabold text-[#3f6c5b]">{data.recommendations.length} rekomendasi</span></div>
            <div className="mt-5 space-y-3">{data.recommendations.length ? data.recommendations.map((item) => <div key={`${item.itemType}-${item.itemId}`} className="flex gap-3 rounded-2xl border border-[#e1e9e4] p-4"><span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.priority === "high" ? "bg-[#d94a55]" : "bg-[#dc8a2c]"}`} /><div><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-extrabold">{item.itemName}</p><span className={`rounded-md px-2 py-0.5 text-[8px] font-extrabold ${PRIORITY_PRESENTATION[item.priority].classes}`}>{PRIORITY_PRESENTATION[item.priority].label}</span></div><p className="mt-2 text-[10px] font-medium leading-5 text-[#687a73]">{item.recommendation}</p></div></div>) : <div className="py-10 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-[#0b8a50]" /><p className="mt-3 text-xs font-extrabold">Tidak ada rekomendasi mendesak</p><p className="mt-1 text-[10px] text-[#7b8984]">Semua item pada filter ini sudah tertangani atau berprioritas rendah.</p></div>}</div>
          </article>
          <article className="rounded-[22px] border border-[#dce6e0] bg-[#0b4333] p-5 text-white sm:p-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/50">Kondisi prioritas</p><h2 className="mt-1 text-lg font-extrabold">{data.prioritySummary.pending} belum ditindaklanjuti</h2>
            <div className="mt-6 space-y-3">{(["high", "medium", "low"] as const).map((priority) => <div key={priority} className="flex items-center justify-between rounded-xl bg-white/[0.07] px-4 py-3"><span className="text-xs font-bold text-white/70">{PRIORITY_PRESENTATION[priority].label}</span><span className="text-xl font-extrabold">{data.prioritySummary[priority]}</span></div>)}</div>
          </article>
        </section>

        <section className="mt-5 overflow-hidden rounded-[22px] border border-[#dce6e0] bg-white shadow-[0_8px_24px_rgba(23,58,44,.04)]">
          <div className="border-b border-[#e3ebe6] px-5 py-5 sm:px-6"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#42806a]">Detail dampak</p><h2 className="mt-1 text-lg font-extrabold">Item yang perlu dipantau ({data.total})</h2></div>
          {data.items.length ? <div className="overflow-x-auto"><table className="w-full min-w-[1120px] border-collapse text-left"><thead className="bg-[#f3f7f5] text-[9px] font-extrabold uppercase tracking-[0.11em] text-[#6d8078]"><tr><th className="px-5 py-4">Nama item</th><th className="px-4 py-4">Kategori</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Prioritas</th><th className="px-4 py-4">Waktu</th><th className="px-5 py-4 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-[#e7ede9]">{data.items.map((item) => <tr key={`${item.itemType}-${item.itemId}`} className="text-xs text-[#273f36]"><td className="px-5 py-4"><p className="max-w-64 truncate font-extrabold">{item.itemName}</p><p className="mt-1 max-w-64 truncate text-[9px] font-semibold text-[#819089]">{item.ownerName}</p></td><td className="px-4 py-4"><span className="rounded-lg bg-[#edf4f0] px-2.5 py-1 text-[9px] font-extrabold text-[#3d6958]">{item.category === "recruitment" ? "Rekrutmen" : "Supplier"}</span></td><td className="px-4 py-4 font-bold">{STATUS_LABELS[item.status] ?? item.status}</td><td className="px-4 py-4"><span className={`rounded-lg px-2.5 py-1 text-[9px] font-extrabold ${PRIORITY_PRESENTATION[item.priority].classes}`}>{PRIORITY_PRESENTATION[item.priority].label}</span></td><td className="whitespace-nowrap px-4 py-4 text-[10px] font-bold text-[#63766e]">{formatDateTime(item.eventTime)}</td><td className="px-5 py-4">{item.latestAction ? <div className="text-right"><span className="rounded-lg bg-[#e8f6ee] px-2.5 py-1 text-[9px] font-extrabold text-[#087447]">{item.latestAction === "followed_up" ? "Ditindaklanjuti" : "Diabaikan"}</span><p className="mt-1 text-[8px] text-[#83918b]">{item.actionTime ? formatDateTime(item.actionTime) : ""}</p></div> : <ImpactActionControls itemType={item.itemType} itemId={item.itemId} />}</td></tr>)}</tbody></table></div> : <div className="px-6 py-16 text-center"><Sparkles className="mx-auto h-8 w-8 text-[#6d8b7f]" /><h3 className="mt-4 text-sm font-extrabold">Belum ada item pada filter ini</h3><p className="mt-2 text-xs text-[#7a8a83]">Buat lowongan, lamaran, atau penawaran supplier terlebih dahulu.</p></div>}
        </section>

        <div className="mt-5 flex items-center justify-between gap-4"><p className="text-[10px] font-bold text-[#73847d]">Halaman {Math.min(data.page, totalPages)} dari {totalPages}</p><div className="flex gap-2"><Link aria-disabled={data.page <= 1} href={pageHref(Math.max(1, data.page - 1))} className={`inline-flex h-9 items-center rounded-xl border border-[#d2dfd8] bg-white px-4 text-[10px] font-extrabold text-[#315b4c] ${data.page <= 1 ? "pointer-events-none opacity-40" : ""}`}>Sebelumnya</Link><Link aria-disabled={data.page >= totalPages} href={pageHref(Math.min(totalPages, data.page + 1))} className={`inline-flex h-9 items-center rounded-xl border border-[#d2dfd8] bg-white px-4 text-[10px] font-extrabold text-[#315b4c] ${data.page >= totalPages ? "pointer-events-none opacity-40" : ""}`}>Berikutnya</Link></div></div>

        <section className="mt-5 rounded-[22px] border border-[#dce6e0] bg-white p-5 sm:p-6"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#42806a]">Action Log</p><h2 className="mt-1 text-lg font-extrabold">Tindakan Administrator terbaru</h2><div className="mt-5 divide-y divide-[#e7ede9]">{data.actionLog.length ? data.actionLog.map((action) => <div key={action.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="text-xs font-extrabold">{action.itemName}</p><p className="mt-1 text-[10px] font-medium text-[#718079]">{action.actorName} · {action.actionType === "followed_up" ? "Menandai sudah ditindaklanjuti" : "Mengabaikan rekomendasi"}</p></div><div className="text-left sm:text-right"><span className={`rounded-lg px-2.5 py-1 text-[9px] font-extrabold ${PRIORITY_PRESENTATION[action.previousPriority].classes}`}>{PRIORITY_PRESENTATION[action.previousPriority].label}</span><p className="mt-2 text-[9px] font-semibold text-[#899790]">{formatDateTime(action.createdAt)}</p></div></div>) : <p className="py-10 text-center text-xs text-[#7a8a83]">Belum ada tindakan Administrator pada periode ini.</p>}</div></section>
      </main>
    </AdminShell>
  );
}
