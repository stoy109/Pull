import {
  BriefcaseBusiness,
  CircleDollarSign,
  Coins,
  ShoppingCart,
  Star,
  Trophy,
} from "lucide-react";
import { formatCurrency, formatDateTime, formatNumber } from "../format";
import type { TrustWorkspace } from "../types";
import { DashboardFrame, DataErrorPanel } from "./dashboard-frame";

function reasonLabel(reason: string) {
  const labels: Record<string, string> = {
    "Completed job": "Pekerjaan selesai",
    "Completed supplier order": "Pesanan supplier selesai",
    "Submitted transaction rating": "Mengirim rating transaksi",
  };
  return labels[reason] ?? reason;
}

export function TrustPageView({
  error,
  identity,
  workspace,
}: {
  error: string | null;
  identity: Parameters<typeof DashboardFrame>[0]["identity"];
  workspace: TrustWorkspace | null;
}) {
  return (
    <DashboardFrame identity={identity}>
      {error || !workspace ? (
        <DataErrorPanel message={error ?? "Data reputasi belum tersedia."} />
      ) : (
        <div className="space-y-5">
          <section className="grid gap-5 xl:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)]">
            <div className="rounded-[22px] border border-[#d5e5db] bg-[linear-gradient(135deg,#f3faf5,#ffffff)] p-6 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-pull-500">Trust score database</p>
              <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
                <div className="grid h-40 w-40 shrink-0 place-items-center rounded-full p-3" style={{ background: `conic-gradient(#087447 ${workspace.trustScore}%, #dce9e1 0)` }}>
                  <div className="grid h-full w-full place-items-center rounded-full bg-white text-center">
                    <span><strong className="block text-4xl font-extrabold text-[#087447]">{formatNumber(workspace.trustScore)}</strong><span className="text-xs font-bold text-[#718078]">dari 100</span></span>
                  </div>
                </div>
                <div><h2 className="text-xl font-extrabold text-[#10231d]">Reputasi {identity.businessName}</h2><p className="mt-2 text-xs font-medium leading-6 text-[#64746c]">Nilai ini berasal dari rating transaksi selesai yang tersimpan. Tidak ada nilai simulasi di halaman ini.</p></div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Metric icon={Star} label="Rata-rata rating diterima" value={workspace.averageRating === null ? "Belum ada" : `${workspace.averageRating.toLocaleString("id-ID", { maximumFractionDigits: 2 })} / 5`} />
              <Metric icon={Trophy} label="Jumlah rating" value={formatNumber(workspace.ratingCount)} />
              <Metric icon={BriefcaseBusiness} label="Pekerjaan selesai" value={formatNumber(workspace.completedJobs)} />
              <Metric icon={ShoppingCart} label="Pesanan supplier selesai" value={formatNumber(workspace.completedOrders)} />
              <Metric className="sm:col-span-2" icon={CircleDollarSign} label="Nilai pesanan selesai" value={formatCurrency(workspace.completedOrderValue)} />
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-[22px] border border-[#dce7e1] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-end justify-between gap-3"><div><h2 className="text-lg font-extrabold text-[#10231d]">Rating diterima</h2><p className="mt-1 text-xs font-medium text-[#718078]">Ulasan dari transaksi pekerjaan atau pesanan yang selesai.</p></div><span className="rounded-full bg-[#fff5d9] px-3 py-1 text-[10px] font-extrabold text-[#9a670f]">{workspace.ratings.length}</span></div>
              {workspace.ratings.length ? (
                <div className="mt-5 space-y-3">
                  {workspace.ratings.map((rating) => (
                    <article className="rounded-2xl border border-[#e0e8e3] p-4" key={rating.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="text-sm font-extrabold text-[#9a670f]">{"★".repeat(rating.score)}<span className="text-[#d9d4c6]">{"★".repeat(5 - rating.score)}</span></p><p className="mt-1 text-[9px] font-bold text-[#718078]">{rating.transactionType === "job" ? "Transaksi pekerjaan" : "Pesanan supplier"}</p></div>
                        <time className="text-[9px] font-semibold text-[#89958f]">{formatDateTime(rating.createdAt)}</time>
                      </div>
                      <p className="mt-3 text-xs font-medium leading-5 text-[#52645b]">{rating.review ?? "Rating diberikan tanpa ulasan tertulis."}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-2xl border border-dashed border-[#cbdad2] p-8 text-center text-sm font-semibold text-[#718078]">Belum ada rating yang diterima.</p>
              )}
            </div>

            <div className="rounded-[22px] border border-[#dce7e1] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-end justify-between gap-3"><div><h2 className="text-lg font-extrabold text-[#10231d]">PullPoints</h2><p className="mt-1 text-xs font-medium text-[#718078]">Ledger poin dari aktivitas transaksi terverifikasi.</p></div><span className="inline-flex items-center gap-1 rounded-full bg-[#fff5d9] px-3 py-1 text-[10px] font-extrabold text-[#9a670f]"><Coins className="h-3.5 w-3.5" />{workspace.totalPoints}</span></div>
              {workspace.points.length ? (
                <div className="mt-5 divide-y divide-[#e7ede9]">
                  {workspace.points.map((entry) => (
                    <article className="flex items-start justify-between gap-4 py-3" key={entry.id}>
                      <div><p className="text-xs font-extrabold text-[#315b4c]">{reasonLabel(entry.reason)}</p><p className="mt-1 text-[9px] font-semibold text-[#89958f]">{formatDateTime(entry.createdAt)} · {entry.transactionType === "job" ? "Pekerjaan" : entry.transactionType === "order" ? "Pesanan" : "Aktivitas"}</p></div>
                      <strong className={entry.points > 0 ? "text-sm text-[#087447]" : "text-sm text-[#a72e43]"}>{entry.points > 0 ? "+" : ""}{entry.points}</strong>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-2xl border border-dashed border-[#cbdad2] p-8 text-center text-sm font-semibold text-[#718078]">Belum ada transaksi pada ledger poin.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </DashboardFrame>
  );
}

function Metric({
  className = "",
  icon: Icon,
  label,
  value,
}: {
  className?: string;
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <article className={`rounded-[20px] border border-[#dce7e1] bg-white p-5 shadow-sm ${className}`}>
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf6f0] text-[#087447]"><Icon className="h-5 w-5" /></span>
      <p className="mt-4 text-2xl font-extrabold text-[#10231d]">{value}</p>
      <p className="mt-1 text-[10px] font-bold text-[#718078]">{label}</p>
    </article>
  );
}
