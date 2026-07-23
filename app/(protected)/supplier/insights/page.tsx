import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Boxes, Minus, PackageSearch, TriangleAlert } from "lucide-react";
import { getSupplierWorkspace } from "@/features/supplier/data";
import {
  cardClass,
  DataState,
  EmptyState,
  formatNumber,
  SectionHeading,
  StatCard,
} from "@/features/supplier/components/supplier-ui";
import { isWithinDays } from "@/features/supplier/workspace";

export default async function SupplierInsightsPage() {
  const { status, workspace, loadedAt } = await getSupplierWorkspace();
  if (status !== "ready") return <DataState status={status} />;

  const last7 = workspace.demands.filter((demand) => isWithinDays(demand.createdAt, 7, loadedAt));
  const last30 = workspace.demands.filter((demand) => isWithinDays(demand.createdAt, 30, loadedAt));
  const prior7 = workspace.demands.filter((demand) => {
    const timestamp = new Date(demand.createdAt).getTime();
    return Number.isFinite(timestamp) && timestamp >= loadedAt - 14 * 86_400_000 && timestamp < loadedAt - 7 * 86_400_000;
  });
  const stockWarnings = workspace.products.filter((product) => product.status === "active" && product.stockQuantity <= product.minOrderQuantity);
  const categories30 = new Set(last30.map((demand) => demand.category).filter(Boolean));
  const groups = new Map<string, { category: string; unit: string; quantity: number; pools: number }>();
  for (const demand of last30) {
    const key = `${demand.category || "Tanpa kategori"}::${demand.unit || "unit"}`;
    const current = groups.get(key) ?? { category: demand.category || "Tanpa kategori", unit: demand.unit || "unit", quantity: 0, pools: 0 };
    current.quantity += demand.targetQuantity;
    current.pools += 1;
    groups.set(key, current);
  }
  const groupedDemand = [...groups.values()].sort((left, right) => right.pools - left.pools || right.quantity - left.quantity);
  const trend = last7.length > prior7.length ? "up" : last7.length < prior7.length ? "down" : "flat";
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendCopy = prior7.length || last7.length
    ? `${last7.length} pool dalam 7 hari terakhir dibanding ${prior7.length} pada 7 hari sebelumnya.`
    : "Belum ada pool aktif yang dibuat dalam 14 hari terakhir.";

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Demand 7 hari" value={formatNumber(last7.length)} detail="Pool aktif berdasarkan tanggal dibuat" icon={BarChart3} />
        <StatCard label="Demand 30 hari" value={formatNumber(last30.length)} detail={`${categories30.size} kategori tercatat`} icon={PackageSearch} tone="blue" />
        <StatCard label="Stok perlu perhatian" value={formatNumber(stockWarnings.length)} detail="Produk aktif pada atau di bawah MOQ" icon={TriangleAlert} tone={stockWarnings.length ? "orange" : "green"} />
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <section className="overflow-hidden rounded-[18px] bg-[#0c4d34] p-6 text-white shadow-[0_18px_42px_rgba(12,77,52,.16)]">
          <p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#a8d7b7]">Tren demand · bukan prediksi AI</p>
          <div className="mt-5 flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#bde4c8]"><TrendIcon className="h-6 w-6" /></span><div><h2 className="font-[family-name:var(--font-worker-display)] text-2xl font-semibold tracking-[-.03em]">{trend === "up" ? "Demand aktif meningkat" : trend === "down" ? "Demand aktif menurun" : "Demand aktif stabil"}</h2><p className="mt-3 text-xs font-medium leading-6 text-white/65">{trendCopy}</p></div></div>
          <p className="mt-6 border-t border-white/10 pt-4 text-[10px] font-medium leading-5 text-white/50">Tren dihitung dari riwayat pool aktif yang tersedia melalui workspace supplier. Pool selesai atau dibatalkan tidak termasuk dalam RPC ini.</p>
        </section>

        <section className={`${cardClass} p-5 sm:p-6`}>
          <SectionHeading eyebrow="Komposisi 30 hari" title="Volume demand per kategori & satuan" description="Volume tidak digabungkan bila satuannya berbeda." />
          {groupedDemand.length ? <div className="mt-5 space-y-3">{groupedDemand.map((group) => (
            <div key={`${group.category}-${group.unit}`} className="flex items-center justify-between gap-4 rounded-xl border border-[#e3ece6] p-4"><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f5ec] text-[#08783f]"><Boxes className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-xs font-extrabold text-[#163c2b]">{group.category}</p><p className="mt-1 text-[9px] font-semibold text-[#6b7b75]">{group.pools} pool</p></div></div><strong className="shrink-0 text-sm text-[#08783f]">{formatNumber(group.quantity)} {group.unit}</strong></div>
          ))}</div> : <EmptyState title="Belum ada riwayat 30 hari" description="Agregat kategori akan muncul saat pool aktif memiliki tanggal pembuatan dalam 30 hari terakhir." />}
        </section>
      </div>

      <section className={`${cardClass} mt-5 p-5 sm:p-6`}>
        <SectionHeading eyebrow="Kontrol persediaan" title="Produk yang perlu diperbarui" description="Peringatan menggunakan stok dan MOQ katalog supplier." action={<Link href="/supplier/products" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#08783f]">Kelola produk <ArrowRight className="h-3.5 w-3.5" /></Link>} />
        {stockWarnings.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{stockWarnings.map((product) => (
          <Link key={product.id} href="/supplier/products" className="rounded-2xl border border-[#f0d6bd] bg-[#fff9f1] p-4 transition hover:border-[#dda969]"><p className="text-xs font-extrabold text-[#613d1e]">{product.itemName}</p><div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-[#94673e]"><span>Stok {formatNumber(product.stockQuantity)} {product.unit}</span><span>MOQ {formatNumber(product.minOrderQuantity)} {product.unit}</span></div></Link>
        ))}</div> : <div className="mt-5 rounded-2xl bg-[#edf8f0] p-5 text-center text-xs font-bold text-[#08783f]">Semua produk aktif berada di atas MOQ.</div>}
      </section>
    </>
  );
}
