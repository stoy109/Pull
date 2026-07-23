import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  MapPin,
  PackageOpen,
  Send,
  UsersRound,
} from "lucide-react";
import { submitSupplierOfferAgainstPoolAction } from "@/features/supplier/actions";
import { getSupplierWorkspace } from "@/features/supplier/data";
import {
  ActionNotice,
  cardClass,
  DataState,
  EmptyState,
  formatCurrency,
  formatDate,
  formatNumber,
  inputClass,
  primaryButtonClass,
  SectionHeading,
  StatCard,
  textareaClass,
} from "@/features/supplier/components/supplier-ui";

function deadlineLabel(value: string, loadedAt: number) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Tenggat belum tersedia";
  const days = Math.ceil((timestamp - loadedAt) / 86_400_000);
  if (days < 0) return "Tenggat lewat";
  if (days === 0) return "Berakhir hari ini";
  return `${days} hari lagi`;
}

export default async function SupplierDemandsPage({ searchParams }: { searchParams: Promise<{ result?: string | string[] }> }) {
  const [{ status, workspace, loadedAt }, params] = await Promise.all([getSupplierWorkspace(), searchParams]);
  if (status !== "ready") return <DataState status={status} />;
  const offeredPoolIds = new Set(workspace.poolOffers.map((offer) => offer.poolId));
  const categories = new Set(workspace.demands.map((demand) => demand.category).filter(Boolean));
  const verified = workspace.profile.verificationLevel >= 2 && workspace.profile.kycStatus === "verified";

  return (
    <>
      <ActionNotice result={params.result} />
      {!verified ? <p className="mb-5 rounded-xl border border-[#efd8ad] bg-[#fff8e9] px-4 py-3 text-xs font-bold text-[#76581c]">KYC level 2 wajib sebelum mengirim penawaran pool. <Link href="/supplier/store" className="font-extrabold text-[#087447] underline">Ajukan NIB/SIUP</Link>.</p> : null}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pool tersedia" value={formatNumber(workspace.demands.length)} detail="Demand terbuka, threshold terpenuhi, atau siap" icon={PackageOpen} />
        <StatCard label="Kategori aktif" value={formatNumber(categories.size)} detail="Ragam kebutuhan dalam demand board" icon={UsersRound} />
        <StatCard label="Penawaran terkirim" value={formatNumber(offeredPoolIds.size)} detail="Pool yang sudah menerima responsmu" icon={Send} />
      </section>

      <section className={`${cardClass} mt-5 p-5 sm:p-6`}>
        <SectionHeading eyebrow="Demand board" title="Pool yang membutuhkan supplier" description="Jumlah tidak dijumlahkan lintas satuan pada kartu; periksa target dan progres setiap pool sebelum menawarkan pasokan." />
        {workspace.demands.length ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {workspace.demands.map((demand) => {
              const offered = offeredPoolIds.has(demand.id);
              const progress = demand.targetQuantity > 0 ? Math.min(100, Math.round(demand.currentQuantity / demand.targetQuantity * 100)) : 0;
              return (
                <article key={demand.id} className="flex flex-col rounded-[18px] border border-[#dfeae2] bg-[#fcfdfc] p-5">
                  <div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#e8f5ec] text-[#08783f]"><PackageOpen className="h-5 w-5" /></span><span className="rounded-full bg-[#fff0df] px-2.5 py-1 text-[9px] font-extrabold text-[#a85c1c]"><CalendarClock className="mr-1 inline h-3 w-3" />{deadlineLabel(demand.deadline, loadedAt)}</span></div>
                  <p className="mt-4 text-[9px] font-extrabold uppercase tracking-[.12em] text-[#6b7b75]">{demand.category || "Tanpa kategori"}</p>
                  <h3 className="mt-1.5 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-.03em] text-[#10231d]">{demand.itemName || "Demand tanpa nama"}</h3>
                  <div className="mt-4 rounded-xl bg-white p-4"><div className="flex items-center justify-between gap-4 text-[10px] font-bold text-[#507f63]"><span>Terkumpul {formatNumber(demand.currentQuantity)} {demand.unit}</span><span>{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8efea]"><div className="h-full rounded-full bg-[#08783f]" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-[9px] font-semibold text-[#6b7b75]">Target {formatNumber(demand.targetQuantity)} {demand.unit} · minimum {formatNumber(demand.minThreshold)} {demand.unit}</p></div>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-[#f4f8f5] p-3"><dt className="text-[8px] font-bold uppercase text-[#6b7b75]">Tier 1</dt><dd className="mt-1 text-[10px] font-extrabold text-[#163c2b]">{demand.tier1Price === null ? "—" : formatCurrency(demand.tier1Price)}</dd></div><div className="rounded-xl bg-[#edf8f0] p-3"><dt className="text-[8px] font-bold uppercase text-[#6b7b75]">Tier 2</dt><dd className="mt-1 text-[10px] font-extrabold text-[#08783f]">{demand.tier2Price === null ? "—" : formatCurrency(demand.tier2Price)}</dd></div><div className="rounded-xl bg-[#fff9f1] p-3"><dt className="text-[8px] font-bold uppercase text-[#6b7b75]">Pasar</dt><dd className="mt-1 text-[10px] font-extrabold text-[#7e542f]">{demand.marketPrice === null ? "—" : formatCurrency(demand.marketPrice)}</dd></div></dl>
                  <div className="mt-4 grid gap-2 text-[10px] font-semibold text-[#507f63] sm:grid-cols-2"><p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{demand.district || "Lokasi tidak dicantumkan"}</p><p className="flex items-center gap-2"><CalendarClock className="h-3.5 w-3.5" />{formatDate(demand.deadline)}</p></div>
                  {offered ? (
                    <Link href="/supplier/offers" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#b9dcc8] bg-[#edf8f0] px-4 text-xs font-extrabold text-[#08783f]"><CheckCircle2 className="h-4 w-4" />Penawaran sudah terkirim</Link>
                  ) : verified ? (
                    <details className="group mt-5 border-t border-[#e3ece6] pt-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-extrabold text-[#08783f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08783f]">Buat penawaran untuk pool ini <ChevronDown className="h-4 w-4 transition group-open:rotate-180" /></summary>
                      <form action={submitSupplierOfferAgainstPoolAction} className="mt-5 grid gap-4 sm:grid-cols-2">
                        <input type="hidden" name="poolId" value={demand.id} />
                        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">Harga per {demand.unit || "satuan"}<input className={inputClass} name="unitPrice" type="number" inputMode="decimal" min="0.01" step="0.01" required /></label>
                        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">Stok yang ditawarkan<input className={inputClass} name="stockQuantity" type="number" inputMode="decimal" min="0.001" step="0.001" required /></label>
                        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">Minimum pemesanan<input className={inputClass} name="minOrderQuantity" type="number" inputMode="decimal" min="0.001" step="0.001" defaultValue="1" required /></label>
                        <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e] sm:col-span-2">Catatan pasokan<textarea className={textareaClass} name="description" maxLength={1000} placeholder="Estimasi pengiriman atau spesifikasi produk" /></label>
                        <button type="submit" className={`${primaryButtonClass} sm:col-span-2 sm:justify-self-start`}>Kirim penawaran <Send className="h-4 w-4" /></button>
                      </form>
                    </details>
                  ) : (
                    <Link href="/supplier/store" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-[#efd8ad] bg-[#fff8e9] px-4 text-xs font-extrabold text-[#76581c]">Verifikasi supplier untuk menawarkan</Link>
                  )}
                </article>
              );
            })}
          </div>
        ) : <EmptyState title="Belum ada demand aktif" description="Peluang baru akan muncul saat UMKM membuka pool yang dapat ditawarkan ke supplier." />}
      </section>
    </>
  );
}
