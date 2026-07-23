import {
  BadgeCheck,
  BriefcaseBusiness,
  CircleDollarSign,
  Clock3,
  Eye,
  HandCoins,
  MousePointerClick,
  PackageCheck,
  Repeat2,
  UsersRound,
} from "lucide-react";
import { AdminShell } from "@/features/admin/components/admin-shell";
import {
  getProposalMetrics,
  normalizeProposalMetricsPeriod,
} from "@/features/admin/data/get-proposal-metrics";
import { requireRole } from "@/lib/auth/access";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

export default async function AdminMetricsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ range?: string | string[] }>;
}>) {
  const [, params] = await Promise.all([requireRole(["admin"]), searchParams]);
  const periodDays = normalizeProposalMetricsPeriod(params.range);
  const metrics = await getProposalMetrics(periodDays);

  const cards = [
    { label: "Pool terpenuhi", value: metrics.poolCompletionCount, detail: `${numberFormatter.format(metrics.poolCompletionRate)}% dari ${metrics.poolTotalCount} pool yang dibuat dalam periode`, icon: PackageCheck, tone: "bg-[#e8f6ee] text-[#087447]" },
    { label: "Rata-rata penghematan", value: `${numberFormatter.format(metrics.averageSavingsPercent)}%`, detail: `${metrics.savingsSampleCount} pool fulfilled dengan harga pasar dan harga order`, icon: HandCoins, tone: "bg-[#fff2df] text-[#a66013]" },
    { label: "Lowongan terisi", value: metrics.jobFillCount, detail: `Rata-rata ${numberFormatter.format(metrics.averageJobFillHours)} jam dari pembuatan lowongan ke penerimaan pertama`, icon: BriefcaseBusiness, tone: "bg-[#eaf1fb] text-[#315f9a]" },
    { label: "Upah pekerja terkonfirmasi", value: currencyFormatter.format(metrics.confirmedWorkerWage), detail: "Total nominal wage_amount pada pekerjaan selesai yang dikonfirmasi kedua pihak", icon: CircleDollarSign, tone: "bg-[#f0ebf8] text-[#684b96]" },
    { label: "Turnover supplier selesai", value: currencyFormatter.format(metrics.supplierCompletedTurnover), detail: `Total order supplier completed dalam ${periodDays} hari`, icon: BadgeCheck, tone: "bg-[#e8f6ee] text-[#087447]" },
    { label: "Konfirmasi penyelesaian", value: `${numberFormatter.format(metrics.confirmationCompletionRate)}%`, detail: `${metrics.confirmationCompletedCount} dari ${metrics.confirmationEligibleCount} lamaran yang diterima dalam periode kini dikonfirmasi kedua pihak`, icon: Clock3, tone: "bg-[#fff2df] text-[#a66013]" },
    { label: "Tampilan profil publik", value: numberFormatter.format(metrics.qrProfileViews), detail: "Kumulatif; proksi jangkauan QR karena sumber kunjungan belum direkam", icon: Eye, tone: "bg-[#eaf1fb] text-[#315f9a]" },
    { label: "Klik kontak profil", value: metrics.qrContactCount, detail: `Redirect WhatsApp/website dalam ${periodDays} hari; belum dapat diatribusikan khusus ke QR`, icon: MousePointerClick, tone: "bg-[#f0ebf8] text-[#684b96]" },
    { label: "Retensi aktif 30 hari", value: `${numberFormatter.format(metrics.retention30dRate)}%`, detail: `${metrics.retentionReturningCount} dari ${metrics.retentionBaseCount} pengguna aktif pada hari 31–60 kembali aktif dalam 30 hari terakhir`, icon: Repeat2, tone: "bg-[#e8f6ee] text-[#087447]" },
    { label: "KYC menunggu", value: metrics.kycPending, detail: "Jumlah antrean saat ini, tidak dibatasi periode", icon: UsersRound, tone: "bg-[#fff0f0] text-[#b33e48]" },
  ] as const;

  return (
    <AdminShell activePath="/admin/metrics">
      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#42806a]">Proposal KPI</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em]">Metrik inti platform</h1>
            <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-[#687a73]">
              Pantau outcome pool, pekerjaan, supplier, profil publik, retensi, dan antrean KYC dari data transaksi yang tersedia.
            </p>
          </div>
          <form method="get" className="grid min-w-52 gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#688078]">
            <label htmlFor="metrics-range">Periode transaksi</label>
            <div className="flex gap-2">
              <select id="metrics-range" name="range" defaultValue={String(periodDays)} className="h-11 flex-1 rounded-xl border border-[#d7e3dc] bg-white px-3 text-xs font-extrabold normal-case tracking-normal outline-none">
                <option value="7">7 hari</option>
                <option value="30">30 hari</option>
                <option value="90">90 hari</option>
              </select>
              <button type="submit" className="h-11 rounded-xl bg-[#0b7449] px-4 text-xs font-extrabold normal-case tracking-normal text-white">Terapkan</button>
            </div>
          </form>
        </section>

        <section className="mt-6 rounded-[20px] border border-[#ecd4ae] bg-[#fffaf1] p-4 text-xs font-medium leading-6 text-[#7b5a28]">
          <strong className="font-extrabold">Batas interpretasi:</strong> retensi adalah proksi aktivitas rolling, sedangkan tampilan/kontak profil adalah proksi dampak QR karena sumber kunjungan belum disimpan. Nilai nol dapat berarti belum ada sampel yang memenuhi syarat.
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Metrik proposal">
          {cards.map(({ label, value, detail, icon: Icon, tone }) => (
            <article key={label} className="rounded-[20px] border border-[#dce6e0] bg-white p-5 shadow-[0_8px_24px_rgba(23,58,44,.04)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#718079]">{label}</p>
                  <p className="mt-2 break-words text-3xl font-extrabold tracking-[-0.04em]">{value}</p>
                </div>
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
              </div>
              <p className="mt-4 text-[10px] font-semibold leading-5 text-[#7e8d87]">{detail}</p>
            </article>
          ))}
        </section>
      </main>
    </AdminShell>
  );
}
