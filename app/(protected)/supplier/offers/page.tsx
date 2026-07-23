import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  PackageOpen,
  Send,
  ShieldCheck,
} from "lucide-react";
import { createSupplierOfferAction } from "@/features/collaboration/actions";
import { getSupplierActivities } from "@/features/dashboard/data/get-role-dashboard-data";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export default async function SupplierOffersPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ success?: string; error?: string }>;
}>) {
  const [{ user }, params] = await Promise.all([
    requireRole(["supplier"]),
    searchParams,
  ]);
  const supabase = await createClient();
  const [{ data: offers }, activities] = await Promise.all([
    supabase
      .from("supplier_offers")
      .select("id,item_name,unit,unit_price,status")
      .eq("supplier_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    getSupplierActivities(user.id),
  ]);
  const offerRows = offers ?? [];
  const formatRupiah = (value: number | string | null) => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

  return (
    <>
      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <form action={createSupplierOfferAction} className="rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_28px_rgba(18,59,48,.03)] sm:p-6">
          <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#e8f5ec] text-[#08783f]"><Send className="h-5 w-5" /></span><div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#507f63]">Penawaran cepat</p><h2 className="mt-1 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em]">Catat kemampuan pasokmu</h2></div></div>
          <p className="mt-4 max-w-2xl text-xs font-medium leading-6 text-[#6e9b7d]">Masukkan komoditas dan harga satuan. Data ini membantu tim mencocokkan penawaran dengan demand yang relevan.</p>

          {params.success ? <p aria-live="polite" className="mt-4 rounded-xl bg-[#e8f5ec] px-4 py-3 text-xs font-bold text-[#08783f]">Penawaran berhasil dikirim.</p> : null}
          {params.error ? <p aria-live="polite" className="mt-4 rounded-xl bg-[#fff0f0] px-4 py-3 text-xs font-bold text-[#b43e48]">{params.error === "validation" ? "Lengkapi komoditas, satuan, dan harga yang valid." : "Penawaran belum dapat disimpan. Coba lagi."}</p> : null}

          <div className="mt-5 grid gap-4 md:grid-cols-[1.4fr_.7fr_1fr]">
            <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">Komoditas<input name="itemName" required minLength={3} maxLength={100} placeholder="Contoh: Kain katun 30s" className="h-11 rounded-xl border border-[#d8e4dd] bg-[#fbfdfc] px-3 text-xs font-semibold outline-none transition focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]" /></label>
            <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">Satuan<select name="unit" required defaultValue="" className="h-11 rounded-xl border border-[#d8e4dd] bg-[#fbfdfc] px-3 text-xs font-semibold outline-none transition focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]"><option value="" disabled>Pilih</option><option value="kg">Kilogram</option><option value="pcs">Pcs</option><option value="meter">Meter</option><option value="liter">Liter</option><option value="dus">Dus</option></select></label>
            <label className="grid gap-2 text-[10px] font-extrabold text-[#28543e]">Harga per satuan<input name="unitPrice" type="number" inputMode="numeric" required min={1} step={100} placeholder="25000" className="h-11 rounded-xl border border-[#d8e4dd] bg-[#fbfdfc] px-3 text-xs font-semibold outline-none transition focus:border-[#78b994] focus:ring-4 focus:ring-[#e8f5ec]" /></label>
          </div>
          <button type="submit" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#08783f] px-5 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(7,150,77,.18)] transition hover:bg-[#00613f] sm:w-auto">Kirim penawaran <ArrowRight className="h-4 w-4" /></button>
        </form>

        <aside className="rounded-[18px] bg-[#0c261c] p-5 text-white shadow-[0_16px_38px_rgba(12,38,28,.14)] sm:p-6">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#94b9a1]">Checklist respons</p><h2 className="mt-2 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.025em]">Sebelum mengirim penawaran</h2>
          <div className="mt-5 space-y-3">{["Pastikan stok memenuhi volume minimum", "Cek biaya kirim ke lokasi pool", "Siapkan estimasi waktu pasok"].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3 text-[10px] font-bold text-white/75"><CheckCircle2 className="h-4 w-4 shrink-0 text-[#8ec9a6]" />{item}</div>)}</div>
          <Link href="/supplier/demands" className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-[10px] font-extrabold text-white/80 transition hover:bg-white/10">Lihat demand aktif</Link>
        </aside>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_28px_rgba(18,59,48,.03)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#507f63]">Data Supabase</p><h2 className="mt-1.5 font-[family-name:var(--font-worker-display)] text-xl font-semibold">Penawaran tersimpan</h2></div>
            <span className="rounded-full bg-[#e8f5ec] px-3 py-1.5 text-[9px] font-extrabold text-[#08783f]">{offerRows.length} penawaran</span>
          </div>
          <div className="mt-4 space-y-3">
            {offerRows.length ? offerRows.map((offer) => (
              <article key={offer.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#e3ece6] p-4">
                <div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f5ec] text-[#08783f]"><PackageOpen className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-sm font-extrabold text-[#1d4634]">{offer.item_name}</p><p className="mt-1 text-[10px] text-[#6e9b7d]">Per {offer.unit} · {offer.status}</p></div></div>
                <p className="shrink-0 text-sm font-extrabold text-[#08783f]">{formatRupiah(offer.unit_price)}</p>
              </article>
            )) : <p className="py-10 text-center text-xs text-[#6e9b7d]">Belum ada penawaran tersimpan.</p>}
          </div>
        </div>

        <div className="rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_28px_rgba(18,59,48,.03)] sm:p-6">
          <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-[#08783f]" /><h2 className="font-[family-name:var(--font-worker-display)] text-xl font-semibold">Aktivitas terbaru</h2></div>
          <div className="mt-4 divide-y divide-[#e3ece6]">
            {activities.length ? activities.map((activity) => (
              <article key={activity.id} className="flex items-start justify-between gap-4 py-4">
                <div><p className="text-xs font-extrabold text-[#1d4634]">{activity.title}</p><p className="mt-1 text-[10px] leading-5 text-[#6e9b7d]">{activity.detail}</p></div>
                <time className="shrink-0 text-[9px] font-bold text-[#6e9b7d]">{activity.time}</time>
              </article>
            )) : <p className="py-10 text-center text-xs text-[#6e9b7d]">Belum ada aktivitas supplier.</p>}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-3">
        {[{ icon: PackageCheck, title: "Komoditas jelas", detail: "Gunakan nama produk yang mudah dicocokkan." }, { icon: ShieldCheck, title: "Harga transparan", detail: "Isi harga per satuan sesuai kapasitas pasok." }, { icon: Send, title: "Respons cepat", detail: "Lanjutkan komunikasi setelah demand cocok." }].map((item) => { const Icon = item.icon; return <article key={item.title} className="rounded-[18px] border border-[#dfeae2] bg-white p-5 shadow-[0_8px_24px_rgba(18,59,48,.025)]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f5ec] text-[#08783f]"><Icon className="h-4.5 w-4.5" /></span><h3 className="mt-4 text-sm font-extrabold text-[#1d4634]">{item.title}</h3><p className="mt-2 text-[10px] font-medium leading-5 text-[#6e9b7d]">{item.detail}</p></article>; })}
      </section>

      <footer className="mt-8 flex flex-col gap-2 border-t border-[#dfeae2] pt-5 text-[9px] font-semibold text-[#6e9b7d] sm:flex-row sm:items-center sm:justify-between"><p>Pull Supplier Space · Penawaran</p><p>Penawaran disimpan ke akun supplier Anda</p></footer>
    </>
  );
}
