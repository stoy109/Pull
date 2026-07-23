import { ArrowUpRight, Boxes, CalendarClock, CheckCircle2, PackageOpen, Scale, Send } from "lucide-react";
import { requireRole } from "@/lib/auth/require-role";
import { getSupplierDashboardData } from "@/lib/activity/queries";

function formatValue(value: string | number) {
  return typeof value === "number" ? new Intl.NumberFormat("id-ID").format(value) : value;
}

function formatDeadline(value: string | Date) {
  if (!value) return "Belum ditentukan";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default async function SupplierPage() {
  await requireRole(["supplier"]);
  const data = await getSupplierDashboardData();

  const metrics = [
    { label: "Jumlah pool 7 hari terakhir", value: data.poolsLast7Days, detail: "Peluang permintaan terbaru", icon: CalendarClock, tone: "bg-[#e7e4f6] text-[#554b91]" },
    { label: "Total komoditas diminta", value: data.totalCommodities, detail: "Kebutuhan pool aktif", icon: Boxes, tone: "bg-[#dff5f0] text-[#167c6c]" },
    { label: "Estimasi volume permintaan", value: data.estimatedVolume, detail: "Akumulasi kebutuhan pool", icon: Scale, tone: "bg-[#e3effb] text-[#286c9d]" },
    { label: "Menunggu konfirmasi supplier", value: data.awaitingConfirmation, detail: "Perlu tindak lanjut", icon: CheckCircle2, tone: "bg-[#fff0d9] text-[#a35d12]" },
  ];

  return (
    <>
      <section id="insight" className="relative overflow-hidden rounded-[26px] bg-[#302a5c] px-5 py-7 text-white shadow-[0_20px_50px_rgba(42,35,87,.16)] sm:px-8 sm:py-9">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(135deg,transparent,rgba(62,221,194,.13))]" />
        <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full border-[28px] border-[#5de0ca]/10" />
        <div className="relative max-w-2xl">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#8de9d9]">Radar kebutuhan UMKM</p>
          <h2 className="mt-3 font-[family-name:var(--font-worker-display)] text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-[38px]">Pasok kebutuhan yang sedang dicari.</h2>
          <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-white/65">Lihat volume dan tenggat pool aktif, lalu siapkan pesan penawaran tanpa membuka nomor pribadi di dashboard.</p>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan demand supplier">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="rounded-[20px] border border-[#e1e2eb] bg-white p-5 shadow-[0_9px_24px_rgba(42,35,87,.04)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-[#6b6981]">{metric.label}</p>
                  <strong className="mt-3 block font-[family-name:var(--font-worker-display)] text-[32px] font-semibold leading-none tracking-[-0.05em] text-[#252048]">{formatValue(metric.value)}</strong>
                </div>
                <span className={`grid h-11 w-11 place-items-center rounded-[14px] ${metric.tone}`}><Icon className="h-5 w-5" /></span>
              </div>
              <p className="mt-4 text-[10px] font-semibold text-[#9693a5]">{metric.detail}</p>
            </article>
          );
        })}
      </section>

      <section id="pool-aktif" className="mt-5 overflow-hidden rounded-[22px] border border-[#dedfe9] bg-white shadow-[0_12px_32px_rgba(42,35,87,.05)]">
        <header className="flex flex-col gap-3 border-b border-[#e8e8ef] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#1b8e7b]">Demand board</p>
            <h2 className="mt-1.5 font-[family-name:var(--font-worker-display)] text-xl font-semibold tracking-[-0.03em] text-[#252048]">Pool menunggu konfirmasi</h2>
          </div>
          <p className="text-xs font-semibold text-[#858397]">{data.pools.length} pool tersedia</p>
        </header>

        {data.pools.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left">
              <thead>
                <tr className="bg-[#f8f8fb] text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#7b788f]">
                  <th className="px-6 py-4">Komoditas</th>
                  <th className="px-4 py-4">Volume</th>
                  <th className="px-4 py-4">Tenggat</th>
                  <th className="px-4 py-4">Ketua pool</th>
                  <th className="px-4 py-4">Kontak</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeF3]">
                {data.pools.map((pool) => {
                  const message = encodeURIComponent(`Halo, saya tertarik memasok kebutuhan ${pool.commodity} untuk pool ${pool.id}. Apakah masih tersedia?`);
                  return (
                    <tr key={pool.id} className="transition-colors hover:bg-[#fbfbfd]">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9f7f3] text-[#16806e]"><PackageOpen className="h-[18px] w-[18px]" /></span>
                          <div>
                            <p className="text-sm font-extrabold text-[#29264a]">{pool.commodity}</p>
                            <p className="mt-1 font-mono text-[9px] text-[#9a97a9]">ID {pool.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-sm font-extrabold text-[#343052]">{formatValue(pool.volume)} <span className="font-semibold text-[#858296]">{pool.unit || "unit"}</span></td>
                      <td className="px-4 py-5"><time className="text-xs font-bold text-[#504b70]">{formatDeadline(pool.deadline)}</time></td>
                      <td className="px-4 py-5 text-xs font-bold text-[#504b70]">{pool.poolLeader}</td>
                      <td className="px-4 py-5"><span className="rounded-lg bg-[#f0eff6] px-2.5 py-1.5 font-mono text-[10px] font-bold text-[#65617c]">{pool.whatsappMasked}</span></td>
                      <td className="px-6 py-5 text-right">
                        <a href={`https://wa.me/?text=${message}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#238b76] px-4 text-xs font-extrabold text-white transition hover:bg-[#176f5e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#238b76]">
                          Hubungi via WA masking <Send className="h-3.5 w-3.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eeedf6] text-[#645d91]"><PackageOpen className="h-6 w-6" /></span>
              <h3 className="mt-4 text-sm font-extrabold text-[#302c52]">Belum ada pool yang membutuhkan supplier</h3>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-[#858296]">Kebutuhan baru akan tampil di sini saat pool dibuka. Periksa kembali secara berkala.</p>
            </div>
          </div>
        )}
      </section>

      <footer className="mt-6 flex flex-col gap-2 border-t border-[#dedfe8] pt-5 text-[10px] font-semibold text-[#858296] sm:flex-row sm:items-center sm:justify-between">
        <p>Data demand mengikuti pool aktif di jaringan Pull.</p>
        <a href="#insight" className="inline-flex items-center gap-1 font-extrabold text-[#4c4777]">Kembali ke insight <ArrowUpRight className="h-3.5 w-3.5" /></a>
      </footer>
    </>
  );
}
