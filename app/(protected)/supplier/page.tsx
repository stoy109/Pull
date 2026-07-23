import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Boxes,
  CalendarClock,
  CircleAlert,
  PackageCheck,
  PackageOpen,
  ReceiptText,
} from "lucide-react";
import { getSupplierWorkspace } from "@/features/supplier/data";
import {
  cardClass,
  DataState,
  EmptyState,
  formatCurrency,
  formatDate,
  formatNumber,
  SectionHeading,
  shortId,
  StatCard,
  StatusBadge,
} from "@/features/supplier/components/supplier-ui";
import { isWithinDays, supplierOrderItemName } from "@/features/supplier/workspace";

export default async function SupplierPage() {
  const { status, workspace, loadedAt } = await getSupplierWorkspace();
  if (status !== "ready") return <DataState status={status} />;

  const todayOrders = workspace.orders.filter((order) => isWithinDays(order.createdAt, 1, loadedAt));
  const awaitingDecision = workspace.orders.filter((order) => order.status === "pending");
  const inProgress = workspace.orders.filter((order) => order.status === "accepted" || order.status === "processing" || order.status === "shipped");
  const completedToday = workspace.orders.filter((order) => order.status === "completed" && isWithinDays(order.completedAt, 1, loadedAt));
  const completedTodayValue = completedToday.reduce((sum, order) => sum + order.total, 0);
  const lowStock = workspace.products.filter((product) => product.status === "active" && product.stockQuantity <= product.minOrderQuantity);
  const recentOrders = workspace.orders.slice(0, 4);
  const nearestDemands = [...workspace.demands]
    .sort((left, right) => new Date(left.deadline).getTime() - new Date(right.deadline).getTime())
    .slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden rounded-[22px] bg-[#0c4d34] px-5 py-7 text-white shadow-[0_18px_42px_rgba(12,77,52,.18)] sm:px-8 sm:py-9">
        <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_70%_35%,rgba(148,220,171,.24),transparent_55%)] sm:block" />
        <div className="relative max-w-3xl">
          <p className="text-[9px] font-extrabold uppercase tracking-[.18em] text-[#a8d7b7]">Catatan operasi · hari ini</p>
          <h2 className="mt-3 font-[family-name:var(--font-worker-display)] text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
            {awaitingDecision.length ? `${awaitingDecision.length} pesanan perlu keputusanmu.` : "Operasional supplier terkendali."}
          </h2>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/70">
            {workspace.demands.length} pool sedang mencari pasokan dan {inProgress.length} pesanan sedang dalam pemenuhan.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={awaitingDecision.length ? "/supplier/transactions" : "/supplier/demands"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-extrabold text-[#08783f] transition hover:bg-[#eff8f2]">
              {awaitingDecision.length ? "Tinjau pesanan" : "Cari peluang demand"}<ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/supplier/products" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/[.06] px-5 text-xs font-extrabold text-white transition hover:bg-white/10">Periksa stok</Link>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Metrik bisnis hari ini">
        <StatCard label="Pesanan masuk 24 jam" value={formatNumber(todayOrders.length)} detail="Berdasarkan waktu pesanan dibuat" icon={ReceiptText} />
        <StatCard label="Perlu keputusan" value={formatNumber(awaitingDecision.length)} detail="Terima atau tolak pesanan baru" icon={CircleAlert} tone="orange" />
        <StatCard label="Dalam pemenuhan" value={formatNumber(inProgress.length)} detail="Diterima, diproses, atau dikirim" icon={PackageCheck} tone="blue" />
        <StatCard label="Selesai 24 jam" value={formatCurrency(completedTodayValue)} detail={`${completedToday.length} pesanan selesai`} icon={Banknote} />
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <section className={`${cardClass} p-5 sm:p-6`}>
          <SectionHeading eyebrow="Pesanan terbaru" title="Antrian transaksi" description="Status paling baru dari pesanan supplier." action={<Link href="/supplier/transactions" className="text-xs font-extrabold text-[#08783f]">Lihat semua</Link>} />
          {recentOrders.length ? (
            <div className="mt-5 divide-y divide-[#e3ece6]">
              {recentOrders.map((order) => (
                <article key={order.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f5ec] text-[#08783f]"><ReceiptText className="h-4 w-4" /></span>
                    <div className="min-w-0"><h3 className="truncate text-sm font-extrabold text-[#163c2b]">{supplierOrderItemName(workspace, order)}</h3><p className="mt-1 text-[10px] font-semibold text-[#6b7b75]">{shortId(order.id)} · {formatDate(order.createdAt, true)}</p></div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end"><StatusBadge status={order.status} /><strong className="text-xs text-[#163c2b]">{formatCurrency(order.total)}</strong></div>
                </article>
              ))}
            </div>
          ) : <EmptyState title="Belum ada pesanan" description="Pesanan akan muncul setelah UMKM memilih penawaran suppliermu." />}
        </section>

        <section className={`${cardClass} p-5 sm:p-6`}>
          <SectionHeading eyebrow="Kontrol stok" title="Peringatan stok" description="Produk aktif dengan stok pada atau di bawah MOQ." />
          {lowStock.length ? (
            <div className="mt-5 space-y-3">
              {lowStock.slice(0, 5).map((product) => (
                <Link key={product.id} href="/supplier/products" className="flex items-center justify-between gap-4 rounded-xl border border-[#f0d6bd] bg-[#fff9f1] p-3.5 transition hover:border-[#e4b780]">
                  <div className="min-w-0"><p className="truncate text-xs font-extrabold text-[#613d1e]">{product.itemName}</p><p className="mt-1 text-[9px] font-semibold text-[#94673e]">MOQ {formatNumber(product.minOrderQuantity)} {product.unit}</p></div>
                  <strong className="shrink-0 text-xs text-[#b35e16]">{formatNumber(product.stockQuantity)} {product.unit}</strong>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-[#edf8f0] p-5 text-center"><Boxes className="mx-auto h-6 w-6 text-[#08783f]" /><p className="mt-3 text-xs font-extrabold text-[#163c2b]">Tidak ada stok kritis</p><p className="mt-1 text-[10px] font-medium leading-5 text-[#6b7b75]">Semua produk aktif berada di atas MOQ.</p></div>
          )}
        </section>
      </div>

      <section className={`${cardClass} mt-5 p-5 sm:p-6`}>
        <SectionHeading eyebrow="Tenggat terdekat" title="Demand yang bisa ditindaklanjuti" description="Pool aktif diurutkan dari tenggat paling dekat." action={<Link href="/supplier/demands" className="text-xs font-extrabold text-[#08783f]">Buka demand board</Link>} />
        {nearestDemands.length ? <div className="mt-5 grid gap-3 md:grid-cols-3">{nearestDemands.map((demand) => (
          <Link key={demand.id} href="/supplier/demands" className="group rounded-2xl border border-[#dfeae2] p-4 transition hover:-translate-y-0.5 hover:border-[#a8cfb7] hover:shadow-sm">
            <div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f5ec] text-[#08783f]"><PackageOpen className="h-4 w-4" /></span><CalendarClock className="h-4 w-4 text-[#c76516]" /></div>
            <h3 className="mt-4 text-sm font-extrabold text-[#163c2b] group-hover:text-[#08783f]">{demand.itemName || "Demand tanpa nama"}</h3>
            <p className="mt-2 text-[10px] font-semibold text-[#6b7b75]">{formatNumber(demand.currentQuantity)} / {formatNumber(demand.targetQuantity)} {demand.unit}</p>
            <p className="mt-3 text-[9px] font-bold text-[#507f63]">Tenggat {formatDate(demand.deadline)}</p>
          </Link>
        ))}</div> : <EmptyState title="Belum ada demand aktif" description="Pool baru akan tampil saat UMKM membuka kebutuhan pasokan." />}
      </section>
    </>
  );
}
